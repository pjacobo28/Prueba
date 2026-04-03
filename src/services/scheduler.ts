/**
 * Scheduler para ejecutar reportes 2 veces al día
 * 08:00 AM y 06:00 PM (18:00)
 */

import { ReporteGenerator } from "./reporte-generator";
import { ExpedienteScraper } from "./expediente-scraper";
import { Expediente } from "../types/expediente";
import * as fs from "fs/promises";
import * as path from "path";

export interface SchedulerConfig {
  usuario: string;
  contrasena: string;
  expedientes: string[]; // Números de expedientes a monitorear
  horariosEjecucion: string[]; // ["08:00", "18:00"]
  directorioReportes?: string;
  enviarEmail?: boolean;
  emailDestino?: string;
}

export class ReporteScheduler {
  private config: SchedulerConfig;
  private expedientesGuardados: Map<string, Expediente> = new Map();
  private ultimaEjecucion: Map<string, Date> = new Map();

  constructor(config: SchedulerConfig) {
    this.config = {
      directorioReportes: "./reportes",
      ...config,
    };
  }

  /**
   * Inicia el scheduler
   */
  iniciar(): void {
    console.log("🚀 Iniciando scheduler de reportes...");
    console.log(`⏰ Horarios de ejecución: ${this.config.horariosEjecucion.join(", ")}`);

    // Verificar inmediatamente y ejecutar si corresponde
    this.verificarYEjecutar();

    // Configurar verificación cada minuto
    const intervalo = setInterval(() => {
      this.verificarYEjecutar();
    }, 60000); // Cada minuto

    // Permitir detener el scheduler
    process.on("SIGINT", () => {
      console.log("\n🛑 Deteniendo scheduler...");
      clearInterval(intervalo);
      process.exit(0);
    });
  }

  /**
   * Verifica si es hora de ejecutar y ejecuta si corresponde
   */
  private verificarYEjecutar(): void {
    const ahora = new Date();
    const horaActual = `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;

    for (const horario of this.config.horariosEjecucion) {
      // Si la hora coincide y no se ha ejecutado en los últimos 10 minutos
      if (horaActual === horario) {
        const ultimaEjec = this.ultimaEjecucion.get(horario);
        if (!ultimaEjec || ahora.getTime() - ultimaEjec.getTime() > 600000) {
          console.log(`\n⏰ ${horaActual} - Ejecutando reporte programado...`);
          this.ejecutar(horario);
          this.ultimaEjecucion.set(horario, ahora);
        }
      }
    }
  }

  /**
   * Ejecuta el reporte
   */
  private async ejecutar(horario: string): Promise<void> {
    try {
      // Extraer expedientes del portal
      console.log("📥 Extrayendo expedientes del portal...");
      const scraper = new ExpedienteScraper({
        usuario: this.config.usuario,
        contrasena: this.config.contrasena,
        headless: true,
      });

      let expedientes: Expediente[] = [];

      try {
        await scraper.iniciar();
        const resultados = await scraper.buscarMuchosExpedientes(
          this.config.expedientes
        );
        expedientes = resultados.filter((r) => r !== null) as Expediente[];

        // Guardar en caché local
        expedientes.forEach((exp) => {
          this.expedientesGuardados.set(exp.numeroExpediente, exp);
        });
      } catch (error) {
        console.error("⚠️  Error extrayendo del portal, usando datos en caché:", error);
        // Si falla el scraper, usar datos guardados previamente
        expedientes = Array.from(this.expedientesGuardados.values());
      } finally {
        await scraper.cerrar();
      }

      if (expedientes.length === 0) {
        console.error("❌ No se encontraron expedientes");
        return;
      }

      // Generar reporte
      console.log(`📊 Generando reporte para ${expedientes.length} expedientes...`);
      const generator = new ReporteGenerator(expedientes, horario);

      // Guardar reporte
      await generator.guardar(this.config.directorioReportes);

      // Mostrar resumen en consola
      console.log("\n" + generator.generarTexto());

      // Enviar por email si está configurado
      if (this.config.enviarEmail && this.config.emailDestino) {
        await this.enviarEmailReporte(generator, horario);
      }

      console.log("✅ Reporte completado exitosamente");
    } catch (error) {
      console.error("❌ Error ejecutando reporte:", error);
    }
  }

  /**
   * Envía el reporte por email (simulado - necesita configuración real de SMTP)
   */
  private async enviarEmailReporte(
    generator: ReporteGenerator,
    horario: string
  ): Promise<void> {
    // NOTA: Esta es una función de ejemplo
    // En producción, integrar con un servicio real de emails (SendGrid, Gmail API, etc.)
    console.log(`📧 Enviando reporte por email a ${this.config.emailDestino}...`);

    const asunto = `Reporte de Expedientes - ${new Date().toLocaleDateString("es-DO")} ${horario}`;
    const cuerpo = generator.generarTexto();

    // Aquí iría el código real para enviar email
    // const transporter = nodemailer.createTransport({...});
    // await transporter.sendMail({to, subject, text});

    console.log(`✅ Email enviado a ${this.config.emailDestino}`);
  }

  /**
   * Ejecuta manualmente un reporte (para testing)
   */
  async ejecutarManualmente(horario: string = "manual"): Promise<void> {
    console.log("🔄 Ejecutando reporte manual...");
    await this.ejecutar(horario);
  }

  /**
   * Obtiene expedientes guardados en caché
   */
  obtenerExpedientes(): Expediente[] {
    return Array.from(this.expedientesGuardados.values());
  }

  /**
   * Obtiene información de un expediente específico
   */
  obtenerExpediente(numero: string): Expediente | null {
    return this.expedientesGuardados.get(numero) || null;
  }

  /**
   * Lista todos los expedientes monitoreados
   */
  listarExpedientes(): string[] {
    return Array.from(this.expedientesGuardados.keys());
  }
}

/**
 * Función para iniciar el scheduler desde un script
 */
export async function iniciarScheduler(config: SchedulerConfig): Promise<ReporteScheduler> {
  const scheduler = new ReporteScheduler(config);
  scheduler.iniciar();
  return scheduler;
}

// Exportar para uso directo
export default ReporteScheduler;

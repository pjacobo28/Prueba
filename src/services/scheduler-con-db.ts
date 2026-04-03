/**
 * Scheduler con Persistencia en Base de Datos
 * Guarda todos los expedientes y reportes en SQLite
 */

import { ReporteGenerator } from "./reporte-generator";
import { DatabaseService, inicializarDB } from "./database";
import { Expediente } from "../types/expediente";
import * as fs from "fs/promises";
import * as path from "path";

let ExpedienteScraper: any = null;
try {
  ExpedienteScraper = require("./expediente-scraper").ExpedienteScraper;
} catch (e) {
  console.warn("⚠️  Scraper no disponible (Playwright no instalado)");
}

export interface SchedulerDBConfig {
  usuario: string;
  contrasena: string;
  expedientes: string[];
  horariosEjecucion: string[];
  directorioReportes?: string;
  rutaDB?: string;
  enviarEmail?: boolean;
  emailDestino?: string;
}

export class ReporteSchedulerConDB {
  private config: SchedulerDBConfig;
  private db: DatabaseService;
  private expedientesGuardados: Map<string, Expediente> = new Map();
  private ultimaEjecucion: Map<string, Date> = new Map();

  constructor(config: SchedulerDBConfig) {
    this.config = {
      directorioReportes: "./reportes",
      rutaDB: "./data/expedientes.db",
      ...config,
    };

    // Inicializar base de datos
    this.db = inicializarDB(this.config.rutaDB);
  }

  /**
   * Inicia el scheduler
   */
  iniciar(): void {
    console.log("🚀 Iniciando scheduler con persistencia en BD...");
    console.log(`⏰ Horarios: ${this.config.horariosEjecucion.join(", ")}`);
    console.log(`💾 Base de datos: ${this.config.rutaDB}`);

    // Cargar expedientes previos de la BD
    this.cargarExpedientesDeDB();

    // Verificar inmediatamente
    this.verificarYEjecutar();

    // Verificar cada minuto
    const intervalo = setInterval(() => {
      this.verificarYEjecutar();
    }, 60000);

    process.on("SIGINT", () => {
      console.log("\n🛑 Deteniendo scheduler...");
      clearInterval(intervalo);
      this.db.cerrar();
      process.exit(0);
    });
  }

  /**
   * Carga expedientes previos de la BD
   */
  private cargarExpedientesDeDB(): void {
    try {
      const expedientes = this.db.obtenerTodosExpedientes();
      expedientes.forEach((exp) => {
        this.expedientesGuardados.set(exp.numeroExpediente, exp);
      });

      const info = this.db.obtenerInfo();
      console.log(`📦 Expedientes en BD: ${info.expedientes}`);
      console.log(`📝 Movimientos en BD: ${info.movimientos}`);
      console.log(`📊 Reportes en BD: ${info.reportes}`);
    } catch (error) {
      console.error("⚠️  Error cargando datos previos:", error);
    }
  }

  /**
   * Verifica si es hora de ejecutar
   */
  private verificarYEjecutar(): void {
    const ahora = new Date();
    const horaActual = `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;

    for (const horario of this.config.horariosEjecucion) {
      if (horaActual === horario) {
        const ultimaEjec = this.ultimaEjecucion.get(horario);
        if (!ultimaEjec || ahora.getTime() - ultimaEjec.getTime() > 600000) {
          console.log(`\n⏰ ${horaActual} - Ejecutando reporte...`);
          this.ejecutar(horario);
          this.ultimaEjecucion.set(horario, ahora);
        }
      }
    }
  }

  /**
   * Ejecuta el reporte completo
   */
  private async ejecutar(horario: string): Promise<void> {
    try {
      let expedientes: Expediente[] = [];

      // Intentar extraer del portal si Playwright está disponible
      if (ExpedienteScraper) {
        try {
          console.log("📥 Extrayendo expedientes del portal...");
          const scraper = new ExpedienteScraper({
            usuario: this.config.usuario,
            contrasena: this.config.contrasena,
            headless: true,
          });

          try {
            await scraper.iniciar();
            const resultados = await scraper.buscarMuchosExpedientes(
              this.config.expedientes
            );
            expedientes = resultados.filter((r: any) => r !== null) as Expediente[];

            // Guardar en BD
            for (const exp of expedientes) {
              this.db.guardarExpediente(exp);
              this.db.guardarMovimientos(exp.numeroExpediente, exp.movimientos);
              this.expedientesGuardados.set(exp.numeroExpediente, exp);
            }

            console.log(`✅ ${expedientes.length} expedientes guardados en BD`);
          } catch (error) {
            console.error("⚠️  Error extrayendo del portal:", error);
            expedientes = Array.from(this.expedientesGuardados.values());
            console.log(`📦 Usando ${expedientes.length} expedientes del caché`);
          } finally {
            await scraper.cerrar();
          }
        } catch (error) {
          console.warn("⚠️  Scraper no disponible:", error);
          expedientes = Array.from(this.expedientesGuardados.values());
        }
      } else {
        console.log("ℹ️  Usando expedientes del caché (Playwright no instalado)");
        expedientes = Array.from(this.expedientesGuardados.values());
      }

      if (expedientes.length === 0) {
        console.error("❌ No hay expedientes para generar reporte");
        return;
      }

      // Generar reporte
      console.log("📊 Generando reporte...");
      const generator = new ReporteGenerator(expedientes, horario);
      const reporte = generator.generar();

      // Guardar archivos
      const archivoHTML = generator.generarHTML();
      const archivoJSON = JSON.stringify(reporte, null, 2);

      // Guardar en BD
      this.db.guardarReporte(reporte, archivoHTML, archivoJSON);

      // Guardar en archivos
      await generator.guardar(this.config.directorioReportes);

      // Mostrar resumen
      console.log("\n" + generator.generarTexto());

      // Mostrar estadísticas
      this.mostrarEstadisticas();

      console.log("✅ Reporte guardado en BD y archivos");
    } catch (error) {
      console.error("❌ Error ejecutando reporte:", error);
    }
  }

  /**
   * Muestra estadísticas de la BD
   */
  private mostrarEstadisticas(): void {
    const stats = this.db.calcularEstadisticasGlobales();

    console.log("\n📊 ESTADÍSTICAS DE BASE DE DATOS");
    console.log("─".repeat(50));
    console.log(`Total expedientes: ${stats.totalExpedientes}`);
    console.log(`  ├─ Activos: ${stats.activos}`);
    console.log(`  ├─ Resueltos: ${stats.resueltos}`);
    console.log(`  ├─ Apelación: ${stats.apelacion}`);
    console.log(`  └─ Archivados: ${stats.archivados}`);
    console.log(`Total movimientos: ${stats.totalMovimientos}`);

    if (stats.ultimaActualizacion) {
      console.log(
        `Última actualización: ${stats.ultimaActualizacion.toLocaleString("es-DO")}`
      );
    }
  }

  /**
   * Ejecuta manualmente (para testing)
   */
  async ejecutarManualmente(horario: string = "manual"): Promise<void> {
    console.log("🔄 Ejecutando reporte manual...");
    await this.ejecutar(horario);
  }

  /**
   * Obtiene expediente desde BD
   */
  obtenerExpediente(numero: string): Expediente | null {
    return this.db.obtenerExpediente(numero);
  }

  /**
   * Lista todos los expedientes
   */
  listarExpedientes(): string[] {
    return this.db.obtenerTodosExpedientes().map((e) => e.numeroExpediente);
  }

  /**
   * Obtiene reportes guardados
   */
  obtenerReportes(limite: number = 10): any[] {
    return this.db.obtenerReportes(limite);
  }

  /**
   * Obtiene historial de un expediente
   */
  obtenerHistorial(numeroExpediente: string): any[] {
    return this.db.obtenerHistorialMovimientos(numeroExpediente);
  }

  /**
   * Obtiene expedientes con actividad reciente
   */
  obtenerConActividadReciente(dias: number = 7): Expediente[] {
    return this.db.obtenerExpedientesConActividadReciente(dias);
  }

  /**
   * Obtiene estadísticas globales
   */
  obtenerEstadisticas(): any {
    return this.db.calcularEstadisticasGlobales();
  }

  /**
   * Obtiene estadísticas por mes
   */
  obtenerEstadisticasPorMes(meses: number = 12): any[] {
    return this.db.calcularEstadisticasPorMes(meses);
  }
}

/**
 * Función auxiliar para iniciar
 */
export async function iniciarSchedulerConDB(
  config: SchedulerDBConfig
): Promise<ReporteSchedulerConDB> {
  const scheduler = new ReporteSchedulerConDB(config);
  scheduler.iniciar();
  return scheduler;
}

export default ReporteSchedulerConDB;

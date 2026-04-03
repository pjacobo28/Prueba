/**
 * Generador de Reportes de Movimientos
 * Crea reportes detallados 2 veces al día
 */

import {
  Expediente,
  ReporteMovimientos,
  EstadisticasExpediente,
} from "../types/expediente";
import * as fs from "fs/promises";
import * as path from "path";

export class ReporteGenerator {
  private horaGeneracion: string;
  private expedientes: Expediente[];

  constructor(expedientes: Expediente[], hora: string) {
    this.expedientes = expedientes;
    this.horaGeneracion = hora; // "08:00" o "18:00"
  }

  /**
   * Genera el reporte completo
   */
  generar(): ReporteMovimientos {
    const fecha = new Date();
    const id = `REPORTE-${fecha.getTime()}`;

    // Preparar datos de expedientes
    const expedientesData = this.expedientes.map((exp) => ({
      numeroExpediente: exp.numeroExpediente,
      caratula: exp.caratula,
      estado: exp.estado,
      ultimoMovimiento: {
        tipo: exp.ultimoMovimiento.tipo,
        descripcion: exp.ultimoMovimiento.descripcion,
        fecha: exp.ultimoMovimiento.fecha,
        diasDesdeUltimo: this.calcularDiasDesde(
          exp.ultimoMovimiento.fecha
        ),
      },
      proximaAudiencia: exp.proximaAudiencia,
    }));

    // Calcular resumen
    const resumen = this.calcularResumen();

    return {
      id,
      fecha,
      horaGeneracion: this.horaGeneracion,
      expedientes: expedientesData,
      resumen,
      generadoPor: "Sistema Automático de Monitoreo",
    };
  }

  /**
   * Calcula el número de días desde una fecha
   */
  private calcularDiasDesde(fecha: Date): number {
    const hoy = new Date();
    const diferencia = hoy.getTime() - fecha.getTime();
    return Math.floor(diferencia / (1000 * 60 * 60 * 24));
  }

  /**
   * Calcula el resumen del reporte
   */
  private calcularResumen() {
    const totalExpedientes = this.expedientes.length;
    const expedientesActivos = this.expedientes.filter(
      (e) => e.estado === "activo"
    ).length;
    const expedientesResueltos = this.expedientes.filter(
      (e) => e.estado === "resuelto"
    ).length;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const movimientosHoy = this.expedientes.reduce((count, exp) => {
      return (
        count +
        exp.movimientos.filter((m) => {
          const movFecha = new Date(m.fecha);
          movFecha.setHours(0, 0, 0, 0);
          return movFecha.getTime() === hoy.getTime();
        }).length
      );
    }, 0);

    const expedientesConMovimientoReciente = this.expedientes.filter(
      (exp) => this.calcularDiasDesde(exp.ultimoMovimiento.fecha) <= 7
    ).length;

    return {
      totalExpedientes,
      expedientesActivos,
      expedientesResueltos,
      movimientosHoy,
      expedientesConMovimientoReciente,
    };
  }

  /**
   * Genera un reporte en formato texto (para email/console)
   */
  generarTexto(): string {
    const reporte = this.generar();
    const lineas: string[] = [];

    lineas.push("═".repeat(80));
    lineas.push("📋 REPORTE DE MOVIMIENTOS EN EXPEDIENTES");
    lineas.push(`Generado: ${reporte.fecha.toLocaleString("es-DO")}`);
    lineas.push(`Hora: ${reporte.horaGeneracion}`);
    lineas.push("═".repeat(80));
    lineas.push("");

    // Resumen ejecutivo
    lineas.push("📊 RESUMEN EJECUTIVO");
    lineas.push("─".repeat(80));
    lineas.push(`Total de expedientes monitoreados: ${reporte.resumen.totalExpedientes}`);
    lineas.push(`  ├─ Activos: ${reporte.resumen.expedientesActivos}`);
    lineas.push(`  ├─ Resueltos: ${reporte.resumen.expedientesResueltos}`);
    lineas.push(`  └─ Archivados: ${reporte.resumen.totalExpedientes - reporte.resumen.expedientesActivos - reporte.resumen.expedientesResueltos}`);
    lineas.push("");
    lineas.push(`Movimientos registrados hoy: ${reporte.resumen.movimientosHoy}`);
    lineas.push(
      `Expedientes con movimiento reciente (últimos 7 días): ${reporte.resumen.expedientesConMovimientoReciente}`
    );
    lineas.push("");

    // Detalle por expediente
    lineas.push("📁 DETALLE POR EXPEDIENTE");
    lineas.push("═".repeat(80));

    reporte.expedientes.forEach((exp, idx) => {
      lineas.push("");
      lineas.push(
        `${idx + 1}. ${exp.numeroExpediente} - ${exp.caratula.substring(0, 50)}...`
      );
      lineas.push(`   Estado: ${exp.estado.toUpperCase()}`);
      lineas.push(`   Último movimiento: ${exp.ultimoMovimiento.tipo}`);
      lineas.push(
        `   Descripción: ${exp.ultimoMovimiento.descripcion.substring(0, 70)}`
      );
      lineas.push(
        `   Fecha: ${exp.ultimoMovimiento.fecha.toLocaleDateString("es-DO")}`
      );
      lineas.push(
        `   Días sin movimiento: ${exp.ultimoMovimiento.diasDesdeUltimo}`
      );

      if (exp.proximaAudiencia) {
        const diasHasta = this.calcularDiasDesde(
          new Date(exp.proximaAudiencia)
        );
        lineas.push(
          `   ⚠️  Próxima audiencia: ${new Date(exp.proximaAudiencia).toLocaleDateString("es-DO")} (en ${Math.abs(diasHasta)} días)`
        );
      }
    });

    lineas.push("");
    lineas.push("═".repeat(80));
    lineas.push(`Reporte ID: ${reporte.id}`);
    lineas.push("═".repeat(80));

    return lineas.join("\n");
  }

  /**
   * Genera un reporte en formato HTML
   */
  generarHTML(): string {
    const reporte = this.generar();

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Expedientes</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        h1 { color: #1a3a52; border-bottom: 3px solid #1a3a52; padding-bottom: 10px; }
        h2 { color: #2c5aa0; margin-top: 30px; }
        .resumen { background: #e8f4f8; padding: 15px; border-radius: 5px; }
        .resumen p { margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #2c5aa0; color: white; padding: 12px; text-align: left; }
        td { padding: 12px; border-bottom: 1px solid #ddd; }
        tr:hover { background: #f9f9f9; }
        .activo { color: green; font-weight: bold; }
        .resuelto { color: blue; font-weight: bold; }
        .alerta { background: #fff3cd; padding: 5px 10px; border-radius: 3px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📋 Reporte de Movimientos en Expedientes</h1>
        <p><strong>Generado:</strong> ${reporte.fecha.toLocaleString("es-DO")}</p>
        <p><strong>Hora:</strong> ${reporte.horaGeneracion}</p>

        <h2>📊 Resumen Ejecutivo</h2>
        <div class="resumen">
            <p><strong>Total de expedientes:</strong> ${reporte.resumen.totalExpedientes}</p>
            <p><strong>Activos:</strong> ${reporte.resumen.expedientesActivos} |
               <strong>Resueltos:</strong> ${reporte.resumen.expedientesResueltos}</p>
            <p><strong>Movimientos hoy:</strong> ${reporte.resumen.movimientosHoy}</p>
            <p><strong>Con movimiento reciente (7 días):</strong> ${reporte.resumen.expedientesConMovimientoReciente}</p>
        </div>

        <h2>📁 Detalle de Expedientes</h2>
        <table>
            <thead>
                <tr>
                    <th>Número Expediente</th>
                    <th>Caratula</th>
                    <th>Estado</th>
                    <th>Último Movimiento</th>
                    <th>Fecha</th>
                    <th>Días sin mov.</th>
                </tr>
            </thead>
            <tbody>
                ${reporte.expedientes
                  .map(
                    (exp) => `
                <tr>
                    <td><strong>${exp.numeroExpediente}</strong></td>
                    <td>${exp.caratula.substring(0, 40)}</td>
                    <td><span class="${exp.estado === "activo" ? "activo" : "resuelto"}">${exp.estado.toUpperCase()}</span></td>
                    <td>${exp.ultimoMovimiento.tipo}</td>
                    <td>${exp.ultimoMovimiento.fecha.toLocaleDateString("es-DO")}</td>
                    <td>${exp.ultimoMovimiento.diasDesdeUltimo}</td>
                </tr>
            `
                  )
                  .join("")}
            </tbody>
        </table>

        <div class="footer">
            <p>Reporte ID: ${reporte.id}</p>
            <p>Sistema automático de monitoreo de expedientes</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Guarda el reporte en archivos
   */
  async guardar(directorio: string = "./reportes"): Promise<void> {
    const reporte = this.generar();

    // Crear directorio si no existe
    await fs.mkdir(directorio, { recursive: true });

    // Guardar en TXT
    const nombreTxt = `reporte-${reporte.horaGeneracion.replace(":", "-")}-${new Date().toISOString().split("T")[0]}.txt`;
    await fs.writeFile(
      path.join(directorio, nombreTxt),
      this.generarTexto()
    );

    // Guardar en HTML
    const nombreHtml = `reporte-${reporte.horaGeneracion.replace(":", "-")}-${new Date().toISOString().split("T")[0]}.html`;
    await fs.writeFile(
      path.join(directorio, nombreHtml),
      this.generarHTML()
    );

    // Guardar en JSON
    const nombreJson = `reporte-${reporte.horaGeneracion.replace(":", "-")}-${new Date().toISOString().split("T")[0]}.json`;
    await fs.writeFile(
      path.join(directorio, nombreJson),
      JSON.stringify(reporte, null, 2)
    );

    console.log(`✅ Reporte guardado en: ${directorio}`);
  }

  /**
   * Calcula estadísticas de un expediente
   */
  calcularEstadisticas(numeroExpediente: string): EstadisticasExpediente | null {
    const exp = this.expedientes.find(
      (e) => e.numeroExpediente === numeroExpediente
    );

    if (!exp) return null;

    const ahora = new Date();
    const anoActual = ahora.getFullYear();

    const movimientosEsteAno = exp.movimientos.filter(
      (m) => new Date(m.fecha).getFullYear() === anoActual
    ).length;

    const tiposMovimientos = [
      ...new Set(exp.movimientos.map((m) => m.tipo)),
    ];

    return {
      numeroExpediente: exp.numeroExpediente,
      totalMovimientos: exp.movimientos.length,
      movimientosEsteAno,
      diasDesdeLaRadicacion: this.calcularDiasDesde(exp.fechaRadicacion),
      diasSinMovimiento: this.calcularDiasDesde(
        exp.ultimoMovimiento.fecha
      ),
      tiposMovimientosRegistrados: tiposMovimientos as any,
      ultimaActividad: {
        tipo: exp.ultimoMovimiento.tipo,
        fecha: exp.ultimoMovimiento.fecha,
      },
    };
  }
}

/**
 * Función auxiliar para generar reporte
 */
export async function generarReporte(
  expedientes: Expediente[],
  hora: string,
  guardar: boolean = true
): Promise<ReporteMovimientos> {
  const generator = new ReporteGenerator(expedientes, hora);
  const reporte = generator.generar();

  if (guardar) {
    await generator.guardar();
    console.log(generator.generarTexto());
  }

  return reporte;
}

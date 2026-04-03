/**
 * Generador de Reportes PDF
 * Crea reportes profesionales en PDF
 */

import PDFDocument from "pdfkit";
import * as fs from "fs";
import * as path from "path";
import { Expediente } from "../types/expediente";

export class PDFGenerator {
  private doc: any;
  private outputPath: string;

  constructor(outputPath: string = "./reportes-pdf") {
    // Crear directorio si no existe
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }
    this.outputPath = outputPath;
  }

  /**
   * Genera un reporte de expediente en PDF
   */
  async generarReporteExpediente(expediente: Expediente): Promise<string> {
    const filename = `expediente-${expediente.numeroExpediente.replace(/\//g, "-")}.pdf`;
    const filepath = path.join(this.outputPath, filename);

    this.doc = new PDFDocument({
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      size: "A4",
    });

    const stream = fs.createWriteStream(filepath);
    this.doc.pipe(stream);

    // Header
    this.agregarHeader();

    // Título
    this.doc.fontSize(20).font("Helvetica-Bold").text("REPORTE DE EXPEDIENTE", { align: "center" });
    this.doc.moveDown();

    // Información principal
    this.doc.fontSize(12).font("Helvetica-Bold").text("INFORMACIÓN GENERAL");
    this.doc.fontSize(10).font("Helvetica");

    this.agregarFila("Número de Expediente:", expediente.numeroExpediente);
    this.agregarFila("Caratula:", expediente.caratula);
    this.agregarFila("Estado:", expediente.estado.toUpperCase());
    this.agregarFila("Demandante:", expediente.demandante);
    this.agregarFila("Demandado:", expediente.demandado);

    this.doc.moveDown();

    // Información judicial
    this.doc.fontSize(12).font("Helvetica-Bold").text("INFORMACIÓN JUDICIAL");
    this.doc.fontSize(10).font("Helvetica");

    this.agregarFila("Juzgado:", expediente.juzgado);
    this.agregarFila("Juez:", expediente.juez);
    this.agregarFila("Ciudad:", expediente.ciudad);
    this.agregarFila("Fecha de Radicación:", expediente.fechaRadicacion.toLocaleDateString("es-DO"));

    if (expediente.proximaAudiencia) {
      this.agregarFila(
        "Próxima Audiencia:",
        expediente.proximaAudiencia.toLocaleDateString("es-DO")
      );
    }

    this.doc.moveDown();

    // Movimientos
    this.doc.fontSize(12).font("Helvetica-Bold").text("HISTORIAL DE MOVIMIENTOS");
    this.doc.moveDown(0.3);

    if (expediente.movimientos.length === 0) {
      this.doc.fontSize(10).font("Helvetica").text("No hay movimientos registrados");
    } else {
      this.doc.fontSize(9).font("Helvetica");

      // Tabla de movimientos
      expediente.movimientos.forEach((mov, idx) => {
        this.doc.font("Helvetica-Bold").text(`${idx + 1}. ${mov.tipo.toUpperCase()}`);
        this.doc.font("Helvetica").fontSize(8);

        this.agregarFila("Fecha:", mov.fecha.toLocaleDateString("es-DO"));
        this.agregarFila("Descripción:", mov.descripcion);

        if (mov.juez) {
          this.agregarFila("Juez:", mov.juez);
        }
        if (mov.numeroAuto) {
          this.agregarFila("Auto:", mov.numeroAuto);
        }

        this.doc.fontSize(9);
        this.doc.moveDown(0.2);
      });
    }

    // Footer
    this.agregarFooter();

    this.doc.end();

    return new Promise((resolve) => {
      stream.on("finish", () => {
        console.log(`✅ PDF generado: ${filepath}`);
        resolve(filepath);
      });
    });
  }

  /**
   * Genera un reporte de estadísticas
   */
  async generarReporteEstadisticas(
    stats: any,
    expedientes: Expediente[],
    fecha: Date
  ): Promise<string> {
    const filename = `estadisticas-${fecha.toISOString().split("T")[0]}.pdf`;
    const filepath = path.join(this.outputPath, filename);

    this.doc = new PDFDocument({
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      size: "A4",
    });

    const stream = fs.createWriteStream(filepath);
    this.doc.pipe(stream);

    // Header
    this.agregarHeader();

    // Título
    this.doc.fontSize(20).font("Helvetica-Bold").text("REPORTE DE ESTADÍSTICAS", { align: "center" });
    this.doc.fontSize(10).font("Helvetica").text(`Fecha: ${fecha.toLocaleDateString("es-DO")}`, {
      align: "center",
    });
    this.doc.moveDown();

    // Resumen ejecutivo
    this.doc.fontSize(12).font("Helvetica-Bold").text("RESUMEN EJECUTIVO");
    this.doc.fontSize(10).font("Helvetica");

    this.agregarFila("Total de expedientes:", String(stats.totalExpedientes));
    this.agregarFila("Expedientes activos:", String(stats.activos));
    this.agregarFila("Expedientes resueltos:", String(stats.resueltos));
    this.agregarFila("En apelación:", String(stats.apelacion));
    this.agregarFila("Archivados:", String(stats.archivados));
    this.agregarFila("Total de movimientos:", String(stats.totalMovimientos));

    this.doc.moveDown();

    // Expedientes activos
    this.doc.fontSize(12).font("Helvetica-Bold").text("EXPEDIENTES ACTIVOS");
    this.doc.moveDown(0.3);

    const activos = expedientes.filter((e) => e.estado === "activo");

    if (activos.length === 0) {
      this.doc.fontSize(10).font("Helvetica").text("No hay expedientes activos");
    } else {
      this.doc.fontSize(8).font("Helvetica");

      activos.forEach((exp) => {
        this.doc.font("Helvetica-Bold").text(`• ${exp.numeroExpediente}`);
        this.doc.font("Helvetica").text(`  ${exp.caratula.substring(0, 70)}`);
      });
    }

    // Footer
    this.agregarFooter();

    this.doc.end();

    return new Promise((resolve) => {
      stream.on("finish", () => {
        console.log(`✅ PDF generado: ${filepath}`);
        resolve(filepath);
      });
    });
  }

  /**
   * Agrega header con logo/título
   */
  private agregarHeader(): void {
    this.doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("SISTEMA DE MONITOREO DE EXPEDIENTES", { align: "center" });
    this.doc.fontSize(10).font("Helvetica").text("Reporte Oficial", { align: "center" });
    this.doc.moveTo(50, this.doc.y).lineTo(550, this.doc.y).stroke();
    this.doc.moveDown();
  }

  /**
   * Agrega footer con fecha y página
   */
  private agregarFooter(): void {
    const pageCount = this.doc.bufferedPageRange().count;

    for (let i = 0; i < pageCount; i++) {
      this.doc.switchToPage(i);
      this.doc.moveTo(50, this.doc.page.height - 50).lineTo(550, this.doc.page.height - 50).stroke();

      this.doc
        .fontSize(8)
        .font("Helvetica")
        .text(
          `Generado: ${new Date().toLocaleString("es-DO")} | Página ${i + 1} de ${pageCount}`,
          50,
          this.doc.page.height - 40,
          { align: "center" }
        );
    }
  }

  /**
   * Agrega una fila de información (etiqueta: valor)
   */
  private agregarFila(etiqueta: string, valor: string): void {
    const y = this.doc.y;
    this.doc.font("Helvetica-Bold").text(etiqueta, 50, y, { width: 150 });
    this.doc.font("Helvetica").text(valor, 200, y, { width: 300 });
    this.doc.moveDown(0.5);
  }
}

/**
 * Función auxiliar para generar PDF
 */
export async function generarPDFExpediente(expediente: Expediente): Promise<string> {
  const generator = new PDFGenerator();
  return await generator.generarReporteExpediente(expediente);
}

export default PDFGenerator;

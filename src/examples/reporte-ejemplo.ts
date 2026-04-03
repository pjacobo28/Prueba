/**
 * Ejemplo de uso del sistema de reportes de expedientes
 * Usa datos de prueba sin necesidad de credenciales reales
 */

import { Expediente, Movimiento } from "../types/expediente";
import { ReporteGenerator } from "../services/reporte-generator";

/**
 * Datos de ejemplo: Expedientes ficticiios
 * Estos son datos de prueba para demostración
 */
export const expedientesEjemplo: Expediente[] = [
  {
    numeroExpediente: "2024-00001-00-01-00-JCL-001-001",
    caratula: "Juan Pérez VS Empresa XYZ S.A. - Despido Injustificado",
    demandante: "Juan Pérez García",
    demandado: "Empresa XYZ S.A.",
    juzgado: "Juzgado de lo Laboral Primero",
    juez: "Dra. María Rodríguez López",
    ciudad: "Santo Domingo",
    fechaRadicacion: new Date("2024-01-15"),
    estado: "activo",
    proximaAudiencia: new Date("2024-04-20"),
    movimientos: [
      {
        id: "MOV-001",
        numeroExpediente: "2024-00001-00-01-00-JCL-001-001",
        tipo: "audiencia_celebrada",
        descripcion: "Celebrada audiencia de conciliación",
        fecha: new Date("2024-04-01"),
        juez: "Dra. María Rodríguez López",
        observaciones: "Partes no llegaron a acuerdo",
      },
      {
        id: "MOV-002",
        numeroExpediente: "2024-00001-00-01-00-JCL-001-001",
        tipo: "audiencia_programada",
        descripcion: "Audiencia programada para fase probatoria",
        fecha: new Date("2024-03-20"),
        juez: "Dra. María Rodríguez López",
      },
      {
        id: "MOV-003",
        numeroExpediente: "2024-00001-00-01-00-JCL-001-001",
        tipo: "auto_admisorio",
        descripcion: "Auto admisorio de demanda",
        fecha: new Date("2024-01-25"),
        juez: "Dra. María Rodríguez López",
        numeroAuto: "AUTO-001-2024",
      },
      {
        id: "MOV-004",
        numeroExpediente: "2024-00001-00-01-00-JCL-001-001",
        tipo: "radicacion",
        descripcion: "Demanda radicada en juzgado",
        fecha: new Date("2024-01-15"),
        juez: "Dra. María Rodríguez López",
      },
    ],
    ultimoMovimiento: {
      id: "MOV-001",
      numeroExpediente: "2024-00001-00-01-00-JCL-001-001",
      tipo: "audiencia_celebrada",
      descripcion: "Celebrada audiencia de conciliación",
      fecha: new Date("2024-04-01"),
      juez: "Dra. María Rodríguez López",
      observaciones: "Partes no llegaron a acuerdo",
    },
    creado: new Date("2024-01-15"),
    actualizado: new Date("2024-04-01"),
    monitoredDesde: new Date("2024-01-15"),
  },

  {
    numeroExpediente: "2024-00002-00-02-00-JCC-001-001",
    caratula:
      "Empresa ABC Corp VS Carlos López Núñez - Incumplimiento de Contrato",
    demandante: "Empresa ABC Corp S.R.L.",
    demandado: "Carlos López Núñez",
    juzgado: "Juzgado de lo Civil Segundo",
    juez: "Lic. Roberto Fernández Torres",
    ciudad: "Santiago",
    fechaRadicacion: new Date("2024-02-01"),
    estado: "activo",
    proximaAudiencia: new Date("2024-04-25"),
    movimientos: [
      {
        id: "MOV-101",
        numeroExpediente: "2024-00002-00-02-00-JCC-001-001",
        tipo: "traslado",
        descripcion: "Se traslada a demandado para que comparezca",
        fecha: new Date("2024-03-28"),
        juez: "Lic. Roberto Fernández Torres",
      },
      {
        id: "MOV-102",
        numeroExpediente: "2024-00002-00-02-00-JCC-001-001",
        tipo: "auto_admisorio",
        descripcion: "Auto admisorio de demanda",
        fecha: new Date("2024-02-10"),
        juez: "Lic. Roberto Fernández Torres",
        numeroAuto: "AUTO-002-2024",
      },
      {
        id: "MOV-103",
        numeroExpediente: "2024-00002-00-02-00-JCC-001-001",
        tipo: "radicacion",
        descripcion: "Demanda radicada",
        fecha: new Date("2024-02-01"),
        juez: "Lic. Roberto Fernández Torres",
      },
    ],
    ultimoMovimiento: {
      id: "MOV-101",
      numeroExpediente: "2024-00002-00-02-00-JCC-001-001",
      tipo: "traslado",
      descripcion: "Se traslada a demandado para que comparezca",
      fecha: new Date("2024-03-28"),
      juez: "Lic. Roberto Fernández Torres",
    },
    creado: new Date("2024-02-01"),
    actualizado: new Date("2024-03-28"),
    monitoredDesde: new Date("2024-02-01"),
  },

  {
    numeroExpediente: "2024-00003-00-03-00-JPE-001-001",
    caratula: "María González VS Juan Sánchez - Pensión Alimenticia",
    demandante: "María González Reyes",
    demandado: "Juan Sánchez Pérez",
    juzgado: "Juzgado de la Familia - Primera Instancia",
    juez: "Licda. Sofía Martínez Gómez",
    ciudad: "La Romana",
    fechaRadicacion: new Date("2023-11-10"),
    estado: "resuelto",
    movimientos: [
      {
        id: "MOV-201",
        numeroExpediente: "2024-00003-00-03-00-JPE-001-001",
        tipo: "sentencia",
        descripcion: "Sentencia que condena al demandado al pago de pensión",
        fecha: new Date("2024-03-15"),
        juez: "Licda. Sofía Martínez Gómez",
        numeroAuto: "SENT-001-2024",
      },
      {
        id: "MOV-202",
        numeroExpediente: "2024-00003-00-03-00-JPE-001-001",
        tipo: "audiencia_celebrada",
        descripcion: "Audiencia de vista de la causa",
        fecha: new Date("2024-02-20"),
        juez: "Licda. Sofía Martínez Gómez",
      },
      {
        id: "MOV-203",
        numeroExpediente: "2024-00003-00-03-00-JPE-001-001",
        tipo: "auto_admisorio",
        descripcion: "Auto admisorio de demanda",
        fecha: new Date("2023-11-20"),
        juez: "Licda. Sofía Martínez Gómez",
        numeroAuto: "AUTO-003-2023",
      },
      {
        id: "MOV-204",
        numeroExpediente: "2024-00003-00-03-00-JPE-001-001",
        tipo: "radicacion",
        descripcion: "Demanda radicada",
        fecha: new Date("2023-11-10"),
        juez: "Licda. Sofía Martínez Gómez",
      },
    ],
    ultimoMovimiento: {
      id: "MOV-201",
      numeroExpediente: "2024-00003-00-03-00-JPE-001-001",
      tipo: "sentencia",
      descripcion: "Sentencia que condena al demandado al pago de pensión",
      fecha: new Date("2024-03-15"),
      juez: "Licda. Sofía Martínez Gómez",
      numeroAuto: "SENT-001-2024",
    },
    creado: new Date("2023-11-10"),
    actualizado: new Date("2024-03-15"),
    monitoredDesde: new Date("2023-11-10"),
  },
];

/**
 * Función para generar reporte de ejemplo
 */
export async function generarReporteEjemplo(
  hora: string = "08:00"
): Promise<void> {
  console.log("\n🎯 GENERANDO REPORTE DE EJEMPLO");
  console.log("════════════════════════════════════════════\n");

  const generator = new ReporteGenerator(expedientesEjemplo, hora);

  // Mostrar reporte en texto
  console.log(generator.generarTexto());

  // Guardar archivos
  try {
    await generator.guardar("./reportes-ejemplo");
    console.log("\n✅ Archivos de ejemplo guardados en ./reportes-ejemplo/");
  } catch (error) {
    console.error("Error guardando reportes:", error);
  }
}

/**
 * Función para ejecutar desde línea de comandos
 */
if (require.main === module) {
  const hora = process.argv[2] || "08:00";
  generarReporteEjemplo(hora);
}

export default generarReporteEjemplo;

/**
 * Demo: Sistema de Reportes con Base de Datos
 * Ejemplo completo de uso con SQLite
 */

import { inicializarDB } from "../services/database";
import { ReporteGenerator } from "../services/reporte-generator";
import { obtenerAPI } from "../api/expedientes-api";
import { expedientesEjemplo } from "./reporte-ejemplo";

/**
 * Ejecuta la demo completa
 */
export async function demoDB(): Promise<void> {
  console.log("🚀 DEMO: SISTEMA DE REPORTES CON BASE DE DATOS");
  console.log("═".repeat(70));
  console.log("");

  try {
    // 1. Inicializar base de datos
    console.log("1️⃣  INICIALIZAR BASE DE DATOS");
    console.log("─".repeat(70));
    const db = inicializarDB("./data/expedientes-demo.db");

    // Mostrar información de BD
    const info = db.obtenerInfo();
    console.log(`Ruta: ${info.ruta}`);
    console.log(`Expedientes: ${info.expedientes}`);
    console.log(`Movimientos: ${info.movimientos}`);
    console.log(`Reportes: ${info.reportes}`);
    console.log("");

    // 2. Guardar expedientes de ejemplo
    console.log("2️⃣  GUARDAR EXPEDIENTES DE EJEMPLO");
    console.log("─".repeat(70));

    for (const expediente of expedientesEjemplo) {
      db.guardarExpediente(expediente);
      db.guardarMovimientos(
        expediente.numeroExpediente,
        expediente.movimientos
      );
      console.log(`✅ ${expediente.numeroExpediente} - ${expediente.caratula.substring(0, 40)}`);
    }
    console.log("");

    // 3. Generar y guardar reportes
    console.log("3️⃣  GENERAR REPORTES");
    console.log("─".repeat(70));

    const generador = new ReporteGenerator(expedientesEjemplo, "09:00");
    const reporte = generador.generar();
    const archivoHTML = generador.generarHTML();
    const archivoJSON = JSON.stringify(reporte, null, 2);

    db.guardarReporte(reporte, archivoHTML, archivoJSON);
    console.log(`✅ Reporte guardado: ${reporte.id}`);
    console.log("");

    // 4. Mostrar estadísticas
    console.log("4️⃣  ESTADÍSTICAS GLOBALES");
    console.log("─".repeat(70));

    const stats = db.calcularEstadisticasGlobales();
    console.log(`Total expedientes: ${stats.totalExpedientes}`);
    console.log(`  ├─ Activos: ${stats.activos}`);
    console.log(`  ├─ Resueltos: ${stats.resueltos}`);
    console.log(`  ├─ Apelación: ${stats.apelacion}`);
    console.log(`  └─ Archivados: ${stats.archivados}`);
    console.log(`Total movimientos: ${stats.totalMovimientos}`);
    console.log(
      `Última actualización: ${stats.ultimaActualizacion?.toLocaleString("es-DO")}`
    );
    console.log("");

    // 5. Usar la API
    console.log("5️⃣  CONSULTAS VIA API");
    console.log("─".repeat(70));

    const api = obtenerAPI();

    // Obtener todos los expedientes
    const todosRes = await api.obtenerTodos();
    console.log(`\n📋 Todos los expedientes (${todosRes.datos?.length}):`);
    for (const exp of todosRes.datos || []) {
      console.log(`  ├─ ${exp.numeroExpediente}`);
      console.log(`  │  ├─ Estado: ${exp.estado}`);
      console.log(
        `  │  └─ Movimientos: ${exp.movimientos}`
      );
    }

    // Obtener expedientes activos
    console.log("\n📋 Expedientes ACTIVOS:");
    const activosRes = await api.obtenerPorEstado("activo");
    for (const exp of activosRes.datos || []) {
      console.log(`  ├─ ${exp.caratula.substring(0, 50)}`);
    }

    // Obtener próximas audiencias
    console.log("\n📋 Próximas audiencias:");
    const audienciasRes = await api.obtenerProximasAudiencias();
    for (const exp of audienciasRes.datos || []) {
      console.log(`  ├─ ${exp.caratula.substring(0, 40)}`);
      console.log(
        `  │  ├─ Fecha: ${new Date(exp.proximaAudiencia).toLocaleDateString("es-DO")}`
      );
      console.log(`  │  └─ En: ${exp.diasHasta} días`);
    }

    // Obtener expedientes con actividad reciente
    console.log("\n📋 Actividad reciente (últimos 7 días):");
    const recientesRes = await api.obtenerConActividadReciente(7);
    for (const exp of recientesRes.datos || []) {
      console.log(`  ├─ ${exp.caratula.substring(0, 40)}`);
      console.log(`  │  └─ Último movimiento hace ${exp.diasSinMovimiento} días`);
    }

    // Buscar por término
    console.log("\n📋 Búsqueda por 'Juan':");
    const busquedaRes = await api.buscar("Juan");
    for (const exp of busquedaRes.datos || []) {
      console.log(`  ├─ ${exp.numeroExpediente}`);
      console.log(`  │  ├─ Demandante: ${exp.demandante}`);
      console.log(`  │  └─ Demandado: ${exp.demandado}`);
    }

    console.log("");

    // 6. Movimientos detallados
    console.log("6️⃣  HISTORIAL DETALLADO");
    console.log("─".repeat(70));

    const primerExpediente = expedientesEjemplo[0];
    const movimientosRes = await api.obtenerMovimientos(
      primerExpediente.numeroExpediente
    );

    console.log(`\n${primerExpediente.numeroExpediente}:`);
    for (const mov of movimientosRes.datos || []) {
      console.log(`  ├─ ${mov.tipo.toUpperCase()}`);
      console.log(
        `  │  ├─ Fecha: ${new Date(mov.fecha).toLocaleDateString("es-DO")}`
      );
      console.log(`  │  ├─ Descripción: ${mov.descripcion}`);
      console.log(`  │  └─ Juez: ${mov.juez || "N/A"}`);
    }

    console.log("");

    // 7. Estadísticas por mes
    console.log("7️⃣  ESTADÍSTICAS POR MES (últimos 12 meses)");
    console.log("─".repeat(70));

    const porMes = db.calcularEstadisticasPorMes(12);
    for (const mes of porMes) {
      console.log(`  ${mes.mes}: ${mes.movimientos} movimientos`);
    }

    console.log("");

    // 8. Información de BD
    console.log("8️⃣  INFORMACIÓN FINAL DE BASE DE DATOS");
    console.log("─".repeat(70));

    const infoFinal = db.obtenerInfo();
    console.log(`Base de datos: ${infoFinal.ruta}`);
    console.log(`Expedientes guardados: ${infoFinal.expedientes}`);
    console.log(`Movimientos registrados: ${infoFinal.movimientos}`);
    console.log(`Reportes generados: ${infoFinal.reportes}`);

    console.log("");
    console.log("✅ DEMO COMPLETADA EXITOSAMENTE");
    console.log("═".repeat(70));

    // Cerrar BD
    db.cerrar();
  } catch (error) {
    console.error("❌ Error en demo:", error);
  }
}

// Ejecutar demo si se llama directamente
if (require.main === module) {
  demoDB();
}

export default demoDB;

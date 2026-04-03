/**
 * Servicio de Base de Datos SQLite
 * Almacena histórico completo de expedientes y reportes
 */

import Database from "better-sqlite3";
import * as path from "path";
import { Expediente, Movimiento, ReporteMovimientos } from "../types/expediente";

export class DatabaseService {
  private db: Database.Database;
  private dbPath: string;

  constructor(dbPath: string = "./data/expedientes.db") {
    this.dbPath = dbPath;

    // Crear directorio si no existe
    const dir = path.dirname(dbPath);
    const fs = require("fs");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Abrir/crear base de datos
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");

    // Inicializar esquema
    this.inicializarEsquema();
  }

  /**
   * Inicializa el esquema de la base de datos
   */
  private inicializarEsquema(): void {
    // Tabla de Expedientes
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS expedientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numeroExpediente TEXT UNIQUE NOT NULL,
        caratula TEXT NOT NULL,
        demandante TEXT NOT NULL,
        demandado TEXT NOT NULL,
        juzgado TEXT NOT NULL,
        juez TEXT NOT NULL,
        ciudad TEXT NOT NULL,
        estado TEXT NOT NULL,
        fechaRadicacion DATETIME NOT NULL,
        proximaAudiencia DATETIME,
        creado DATETIME DEFAULT CURRENT_TIMESTAMP,
        actualizado DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de Movimientos
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS movimientos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numeroExpediente TEXT NOT NULL,
        tipo TEXT NOT NULL,
        descripcion TEXT NOT NULL,
        fecha DATETIME NOT NULL,
        juez TEXT,
        juzgado TEXT,
        numeroAuto TEXT,
        observaciones TEXT,
        usuario TEXT,
        creado DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (numeroExpediente) REFERENCES expedientes(numeroExpediente)
          ON DELETE CASCADE
      );
    `);

    // Tabla de Reportes
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS reportes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reporteId TEXT UNIQUE NOT NULL,
        fecha DATETIME NOT NULL,
        horaGeneracion TEXT NOT NULL,
        totalExpedientes INTEGER NOT NULL,
        expedientesActivos INTEGER NOT NULL,
        expedientesResueltos INTEGER NOT NULL,
        movimientosHoy INTEGER NOT NULL,
        expedientesConMovimientoReciente INTEGER NOT NULL,
        archivo BLOB,
        archivoHTML TEXT,
        archivoJSON TEXT,
        creado DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de Historial de Movimientos
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS historial_movimientos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numeroExpediente TEXT NOT NULL,
        movimientoId TEXT,
        tipo TEXT NOT NULL,
        descripcion TEXT NOT NULL,
        fecha DATETIME NOT NULL,
        registradoEn DATETIME DEFAULT CURRENT_TIMESTAMP,
        cambio TEXT,
        FOREIGN KEY (numeroExpediente) REFERENCES expedientes(numeroExpediente)
          ON DELETE CASCADE
      );
    `);

    // Tabla de Estadísticas
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS estadisticas_diarias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha DATE UNIQUE NOT NULL,
        totalExpedientes INTEGER NOT NULL,
        expedientesActivos INTEGER NOT NULL,
        movimientosRegistrados INTEGER NOT NULL,
        expedientesConActividad INTEGER NOT NULL,
        creado DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Índices para performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_expedientes_estado ON expedientes(estado);
      CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos(fecha);
      CREATE INDEX IF NOT EXISTS idx_movimientos_expediente ON movimientos(numeroExpediente);
      CREATE INDEX IF NOT EXISTS idx_reportes_fecha ON reportes(fecha);
      CREATE INDEX IF NOT EXISTS idx_historial_fecha ON historial_movimientos(fecha);
    `);

    console.log("✅ Esquema de base de datos inicializado");
  }

  /**
   * Guarda un expediente en la base de datos
   */
  guardarExpediente(expediente: Expediente): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO expedientes (
        numeroExpediente, caratula, demandante, demandado,
        juzgado, juez, ciudad, estado, fechaRadicacion,
        proximaAudiencia, actualizado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      expediente.numeroExpediente,
      expediente.caratula,
      expediente.demandante,
      expediente.demandado,
      expediente.juzgado,
      expediente.juez,
      expediente.ciudad,
      expediente.estado,
      expediente.fechaRadicacion.toISOString(),
      expediente.proximaAudiencia?.toISOString() || null,
      new Date().toISOString()
    );
  }

  /**
   * Guarda movimientos de un expediente
   */
  guardarMovimientos(
    numeroExpediente: string,
    movimientos: Movimiento[]
  ): void {
    const stmtMovimiento = this.db.prepare(`
      INSERT INTO movimientos (
        numeroExpediente, tipo, descripcion, fecha,
        juez, juzgado, numeroAuto, observaciones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT DO NOTHING
    `);

    const stmtHistorial = this.db.prepare(`
      INSERT INTO historial_movimientos (
        numeroExpediente, movimientoId, tipo, descripcion,
        fecha, cambio
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const transaction = this.db.transaction(() => {
      for (const mov of movimientos) {
        stmtMovimiento.run(
          numeroExpediente,
          mov.tipo,
          mov.descripcion,
          mov.fecha.toISOString(),
          mov.juez || null,
          mov.juzgado || null,
          mov.numeroAuto || null,
          mov.observaciones || null
        );

        // Registrar en historial
        stmtHistorial.run(
          numeroExpediente,
          mov.id,
          mov.tipo,
          mov.descripcion,
          mov.fecha.toISOString(),
          `Nuevo movimiento: ${mov.tipo}`
        );
      }
    });

    transaction();
  }

  /**
   * Guarda un reporte
   */
  guardarReporte(
    reporte: ReporteMovimientos,
    archivoHTML: string,
    archivoJSON: string
  ): void {
    const stmt = this.db.prepare(`
      INSERT INTO reportes (
        reporteId, fecha, horaGeneracion,
        totalExpedientes, expedientesActivos, expedientesResueltos,
        movimientosHoy, expedientesConMovimientoReciente,
        archivoHTML, archivoJSON
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      reporte.id,
      reporte.fecha.toISOString(),
      reporte.horaGeneracion,
      reporte.resumen.totalExpedientes,
      reporte.resumen.expedientesActivos,
      reporte.resumen.expedientesResueltos,
      reporte.resumen.movimientosHoy,
      reporte.resumen.expedientesConMovimientoReciente,
      archivoHTML,
      archivoJSON
    );
  }

  /**
   * Obtiene un expediente por número
   */
  obtenerExpediente(numeroExpediente: string): Expediente | null {
    const stmt = this.db.prepare(`
      SELECT * FROM expedientes WHERE numeroExpediente = ?
    `);

    const exp = stmt.get(numeroExpediente) as any;
    if (!exp) return null;

    // Obtener movimientos
    const stmtMov = this.db.prepare(`
      SELECT * FROM movimientos WHERE numeroExpediente = ?
      ORDER BY fecha DESC
    `);

    const movimientos = (stmtMov.all(numeroExpediente) as any[]).map((m) => ({
      ...m,
      fecha: new Date(m.fecha),
    }));

    return {
      numeroExpediente: exp.numeroExpediente,
      caratula: exp.caratula,
      demandante: exp.demandante,
      demandado: exp.demandado,
      juzgado: exp.juzgado,
      juez: exp.juez,
      ciudad: exp.ciudad,
      estado: exp.estado,
      fechaRadicacion: new Date(exp.fechaRadicacion),
      proximaAudiencia: exp.proximaAudiencia
        ? new Date(exp.proximaAudiencia)
        : undefined,
      movimientos,
      ultimoMovimiento: movimientos[0] || null,
      creado: new Date(exp.creado),
      actualizado: new Date(exp.actualizado),
      monitoredDesde: new Date(exp.creado),
    };
  }

  /**
   * Obtiene todos los expedientes
   */
  obtenerTodosExpedientes(): Expediente[] {
    const stmt = this.db.prepare(`
      SELECT * FROM expedientes ORDER BY actualizado DESC
    `);

    const expedientes = stmt.all() as any[];
    return expedientes.map((exp) => this.obtenerExpediente(exp.numeroExpediente)!);
  }

  /**
   * Obtiene expedientes por estado
   */
  obtenerExpedientesPorEstado(estado: string): Expediente[] {
    const stmt = this.db.prepare(`
      SELECT * FROM expedientes WHERE estado = ?
      ORDER BY actualizado DESC
    `);

    const expedientes = stmt.all(estado) as any[];
    return expedientes.map((exp) => this.obtenerExpediente(exp.numeroExpediente)!);
  }

  /**
   * Obtiene el historial de movimientos de un expediente
   */
  obtenerHistorialMovimientos(numeroExpediente: string): any[] {
    const stmt = this.db.prepare(`
      SELECT * FROM historial_movimientos
      WHERE numeroExpediente = ?
      ORDER BY fecha DESC
    `);

    return stmt.all(numeroExpediente) as any[];
  }

  /**
   * Obtiene movimientos de una fecha específica
   */
  obtenerMovimientosEnFecha(fecha: Date): any[] {
    const fechaStr = fecha.toISOString().split("T")[0];
    const stmt = this.db.prepare(`
      SELECT * FROM movimientos
      WHERE DATE(fecha) = ?
      ORDER BY fecha DESC
    `);

    return stmt.all(fechaStr) as any[];
  }

  /**
   * Obtiene todos los reportes
   */
  obtenerReportes(limite: number = 50): any[] {
    const stmt = this.db.prepare(`
      SELECT id, reporteId, fecha, horaGeneracion,
             totalExpedientes, expedientesActivos, expedientesResueltos,
             movimientosHoy, expedientesConMovimientoReciente, creado
      FROM reportes
      ORDER BY fecha DESC
      LIMIT ?
    `);

    return stmt.all(limite) as any[];
  }

  /**
   * Obtiene un reporte completo por ID
   */
  obtenerReporte(reporteId: string): any {
    const stmt = this.db.prepare(`
      SELECT * FROM reportes WHERE reporteId = ?
    `);

    return stmt.get(reporteId);
  }

  /**
   * Calcula estadísticas globales
   */
  calcularEstadisticasGlobales(): {
    totalExpedientes: number;
    activos: number;
    resueltos: number;
    apelacion: number;
    archivados: number;
    totalMovimientos: number;
    ultimaActualizacion: Date | null;
  } {
    const stmtExp = this.db.prepare(`
      SELECT COUNT(*) as total, estado FROM expedientes
      GROUP BY estado
    `);

    const expedientes = stmtExp.all() as any[];

    const resultado = {
      totalExpedientes: 0,
      activos: 0,
      resueltos: 0,
      apelacion: 0,
      archivados: 0,
      totalMovimientos: 0,
      ultimaActualizacion: null as Date | null,
    };

    for (const row of expedientes) {
      resultado.totalExpedientes += row.total;
      if (row.estado === "activo") resultado.activos = row.total;
      else if (row.estado === "resuelto") resultado.resueltos = row.total;
      else if (row.estado === "apelacion") resultado.apelacion = row.total;
      else if (row.estado === "archivado") resultado.archivados = row.total;
    }

    const stmtMov = this.db.prepare(
      `SELECT COUNT(*) as total FROM movimientos`
    );
    resultado.totalMovimientos = (stmtMov.get() as any).total;

    const stmtActual = this.db.prepare(
      `SELECT MAX(actualizado) as fecha FROM expedientes`
    );
    const actDate = (stmtActual.get() as any).fecha;
    if (actDate) {
      resultado.ultimaActualizacion = new Date(actDate);
    }

    return resultado;
  }

  /**
   * Calcula estadísticas por mes
   */
  calcularEstadisticasPorMes(
    meses: number = 12
  ): { mes: string; movimientos: number; expedientes: number }[] {
    const stmt = this.db.prepare(`
      SELECT
        strftime('%Y-%m', fecha) as mes,
        COUNT(*) as movimientos
      FROM movimientos
      WHERE fecha >= datetime('now', '-' || ? || ' months')
      GROUP BY mes
      ORDER BY mes DESC
    `);

    const movimientosPorMes = stmt.all(meses) as any[];

    const resultado = [];
    for (const row of movimientosPorMes) {
      resultado.push({
        mes: row.mes,
        movimientos: row.movimientos,
        expedientes: 0, // Se puede calcular si es necesario
      });
    }

    return resultado;
  }

  /**
   * Obtiene expedientes con actividad reciente
   */
  obtenerExpedientesConActividadReciente(dias: number = 7): Expediente[] {
    const stmt = this.db.prepare(`
      SELECT DISTINCT e.* FROM expedientes e
      JOIN movimientos m ON e.numeroExpediente = m.numeroExpediente
      WHERE m.fecha >= datetime('now', '-' || ? || ' days')
      ORDER BY m.fecha DESC
    `);

    const expedientes = stmt.all(dias) as any[];
    return expedientes.map((exp) => this.obtenerExpediente(exp.numeroExpediente)!);
  }

  /**
   * Limpia datos antiguos
   */
  limpiarDatosAntiguos(diasRetener: number = 365): number {
    const stmt = this.db.prepare(`
      DELETE FROM historial_movimientos
      WHERE registradoEn < datetime('now', '-' || ? || ' days')
    `);

    const info = stmt.run(diasRetener);
    return info.changes;
  }

  /**
   * Cierra la base de datos
   */
  cerrar(): void {
    this.db.close();
    console.log("✅ Base de datos cerrada");
  }

  /**
   * Obtiene información de la base de datos
   */
  obtenerInfo(): {
    ruta: string;
    expedientes: number;
    movimientos: number;
    reportes: number;
  } {
    const stmtExp = this.db.prepare(`SELECT COUNT(*) as total FROM expedientes`);
    const stmtMov = this.db.prepare(`SELECT COUNT(*) as total FROM movimientos`);
    const stmtRep = this.db.prepare(`SELECT COUNT(*) as total FROM reportes`);

    return {
      ruta: this.dbPath,
      expedientes: (stmtExp.get() as any).total,
      movimientos: (stmtMov.get() as any).total,
      reportes: (stmtRep.get() as any).total,
    };
  }
}

/**
 * Instancia global de la base de datos
 */
let dbInstance: DatabaseService | null = null;

export function inicializarDB(
  dbPath: string = "./data/expedientes.db"
): DatabaseService {
  if (!dbInstance) {
    dbInstance = new DatabaseService(dbPath);
  }
  return dbInstance;
}

export function obtenerDB(): DatabaseService {
  if (!dbInstance) {
    dbInstance = new DatabaseService();
  }
  return dbInstance;
}

export default DatabaseService;

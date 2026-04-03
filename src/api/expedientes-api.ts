/**
 * API REST para Consultar Expedientes
 * Endpoints para acceder a los datos guardados en BD
 */

import { obtenerDB } from "../services/database";

/**
 * Interfaz para respuestas de la API
 */
export interface APIResponse<T> {
  exito: boolean;
  datos?: T;
  error?: string;
  timestamp: string;
}

/**
 * Clase API para expedientes
 */
export class ExpedientesAPI {
  private db = obtenerDB();

  // ─────────────────────────────────────────────────────
  // EXPEDIENTES
  // ─────────────────────────────────────────────────────

  /**
   * GET /api/expedientes
   * Obtiene todos los expedientes
   */
  async obtenerTodos(): Promise<APIResponse<any[]>> {
    try {
      const expedientes = this.db.obtenerTodosExpedientes();

      return {
        exito: true,
        datos: expedientes.map((e) => ({
          numeroExpediente: e.numeroExpediente,
          caratula: e.caratula,
          estado: e.estado,
          ultimoMovimiento: e.ultimoMovimiento,
          proximaAudiencia: e.proximaAudiencia,
          movimientos: e.movimientos.length,
        })),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        exito: false,
        error: String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * GET /api/expedientes/:numero
   * Obtiene un expediente específico
   */
  async obtenerPorNumero(
    numeroExpediente: string
  ): Promise<APIResponse<any>> {
    try {
      const expediente = this.db.obtenerExpediente(numeroExpediente);

      if (!expediente) {
        return {
          exito: false,
          error: `Expediente ${numeroExpediente} no encontrado`,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        exito: true,
        datos: expediente,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        exito: false,
        error: String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * GET /api/expedientes/estado/:estado
   * Obtiene expedientes por estado
   */
  async obtenerPorEstado(estado: string): Promise<APIResponse<any[]>> {
    try {
      const expedientes = this.db.obtenerExpedientesPorEstado(estado);

      return {
        exito: true,
        datos: expedientes.map((e) => ({
          numeroExpediente: e.numeroExpediente,
          caratula: e.caratula,
          estado: e.estado,
          ultimoMovimiento: e.ultimoMovimiento,
        })),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        exito: false,
        error: String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * GET /api/expedientes/activos/reciente
   * Obtiene expedientes con actividad reciente
   */
  async obtenerConActividadReciente(dias: number = 7): Promise<APIResponse<any[]>> {
    try {
      const expedientes = this.db.obtenerExpedientesConActividadReciente(dias);

      return {
        exito: true,
        datos: expedientes.map((e) => ({
          numeroExpediente: e.numeroExpediente,
          caratula: e.caratula,
          estado: e.estado,
          ultimoMovimiento: e.ultimoMovimiento,
          diasSinMovimiento: Math.floor(
            (Date.now() - e.ultimoMovimiento.fecha.getTime()) / (1000 * 60 * 60 * 24)
          ),
        })),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        exito: false,
        error: String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ─────────────────────────────────────────────────────
  // MOVIMIENTOS
  // ─────────────────────────────────────────────────────

  /**
   * GET /api/expedientes/:numero/movimientos
   * Obtiene historial de movimientos
   */
  async obtenerMovimientos(
    numeroExpediente: string
  ): Promise<APIResponse<any[]>> {
    try {
      const expediente = this.db.obtenerExpediente(numeroExpediente);

      if (!expediente) {
        return {
          exito: false,
          error: `Expediente ${numeroExpediente} no encontrado`,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        exito: true,
        datos: expediente.movimientos.map((m) => ({
          tipo: m.tipo,
          descripcion: m.descripcion,
          fecha: m.fecha,
          juez: m.juez,
          numeroAuto: m.numeroAuto,
        })),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        exito: false,
        error: String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * GET /api/movimientos/fecha/:fecha
   * Obtiene movimientos de una fecha específica
   */
  async obtenerMovimientosPorFecha(fecha: string): Promise<APIResponse<any[]>> {
    try {
      const fechaObj = new Date(fecha);
      const movimientos = this.db.obtenerMovimientosEnFecha(fechaObj);

      return {
        exito: true,
        datos: movimientos.map((m) => ({
          numeroExpediente: m.numeroExpediente,
          tipo: m.tipo,
          descripcion: m.descripcion,
          fecha: m.fecha,
        })),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        exito: false,
        error: String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * GET /api/expedientes/:numero/historial
   * Obtiene historial completo
   */
  async obtenerHistorial(
    numeroExpediente: string
  ): Promise<APIResponse<any[]>> {
    try {
      const historial = this.db.obtenerHistorialMovimientos(numeroExpediente);

      return {
        exito: true,
        datos: historial,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        exito: false,
        error: String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ─────────────────────────────────────────────────────
  // REPORTES
  // ─────────────────────────────────────────────────────

  /**
   * GET /api/reportes
   * Obtiene lista de reportes
   */
  async obtenerReportes(limite: number = 20): Promise<APIResponse<any[]>> {
    try {
      const reportes = this.db.obtenerReportes(limite);

      return {
        exito: true,
        datos: reportes,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        exito: false,
        error: String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * GET /api/reportes/:id
   * Obtiene un reporte completo
   */
  async obtenerReporte(reporteId: string): Promise<APIResponse<any>> {
    try {
      const reporte = this.db.obtenerReporte(reporteId);

      if (!reporte) {
        return {
          exito: false,
          error: `Reporte ${reporteId} no encontrado`,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        exito: true,
        datos: reporte,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        exito: false,
        error: String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ─────────────────────────────────────────────────────
  // ESTADÍSTICAS
  // ─────────────────────────────────────────────────────

  /**
   * GET /api/estadisticas
   * Obtiene estadísticas globales
   */
  async obtenerEstadisticas(): Promise<APIResponse<any>> {
    try {
      const stats = this.db.calcularEstadisticasGlobales();
      const info = this.db.obtenerInfo();

      return {
        exito: true,
        datos: {
          ...stats,
          baseDatos: info,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        exito: false,
        error: String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * GET /api/estadisticas/mes
   * Obtiene estadísticas por mes
   */
  async obtenerEstadisticasPorMes(
    meses: number = 12
  ): Promise<APIResponse<any[]>> {
    try {
      const stats = this.db.calcularEstadisticasPorMes(meses);

      return {
        exito: true,
        datos: stats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        exito: false,
        error: String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ─────────────────────────────────────────────────────
  // BÚSQUEDA Y FILTRADO
  // ─────────────────────────────────────────────────────

  /**
   * GET /api/buscar?q=termino
   * Busca expedientes por caratula, demandante o demandado
   */
  async buscar(termino: string): Promise<APIResponse<any[]>> {
    try {
      const todos = this.db.obtenerTodosExpedientes();
      const resultados = todos.filter(
        (e) =>
          e.caratula.toLowerCase().includes(termino.toLowerCase()) ||
          e.demandante.toLowerCase().includes(termino.toLowerCase()) ||
          e.demandado.toLowerCase().includes(termino.toLowerCase()) ||
          e.numeroExpediente.includes(termino)
      );

      return {
        exito: true,
        datos: resultados.map((e) => ({
          numeroExpediente: e.numeroExpediente,
          caratula: e.caratula,
          estado: e.estado,
          demandante: e.demandante,
          demandado: e.demandado,
        })),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        exito: false,
        error: String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * GET /api/proximas-audiencias
   * Obtiene expedientes con próxima audiencia
   */
  async obtenerProximasAudiencias(): Promise<APIResponse<any[]>> {
    try {
      const expedientes = this.db
        .obtenerTodosExpedientes()
        .filter((e) => e.proximaAudiencia && e.estado === "activo")
        .sort(
          (a, b) =>
            (a.proximaAudiencia?.getTime() || 0) -
            (b.proximaAudiencia?.getTime() || 0)
        );

      return {
        exito: true,
        datos: expedientes.map((e) => ({
          numeroExpediente: e.numeroExpediente,
          caratula: e.caratula,
          proximaAudiencia: e.proximaAudiencia,
          juez: e.juez,
          juzgado: e.juzgado,
          diasHasta: e.proximaAudiencia
            ? Math.ceil(
                (e.proximaAudiencia.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              )
            : null,
        })),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        exito: false,
        error: String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }
}

/**
 * Instancia global de la API
 */
let apiInstance: ExpedientesAPI | null = null;

export function obtenerAPI(): ExpedientesAPI {
  if (!apiInstance) {
    apiInstance = new ExpedientesAPI();
  }
  return apiInstance;
}

export default ExpedientesAPI;

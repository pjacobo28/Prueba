/**
 * Tipos para Expedientes y Movimientos del Poder Judicial
 * Sistema de monitoreo de expedientes con reportes automáticos
 */

/**
 * Tipos de movimientos en un expediente
 */
export type TipoMovimiento =
  | "radicacion"
  | "auto_admisorio"
  | "traslado"
  | "audiencia_programada"
  | "audiencia_celebrada"
  | "sentencia"
  | "apelacion"
  | "recurso"
  | "ejecucion"
  | "archivo"
  | "otro";

/**
 * Movimiento en un expediente
 * Registra cada acción realizada en el caso
 */
export interface Movimiento {
  id: string;
  numeroExpediente: string;
  tipo: TipoMovimiento;
  descripcion: string;
  fecha: Date;
  juez?: string;
  juzgado?: string;
  numeroAuto?: string;
  observaciones?: string;
  usuario?: string;
}

/**
 * Expediente completo con su historial
 */
export interface Expediente {
  // Identificación
  numeroExpediente: string; // Ej: "2024-00001-00-01-00-JCL-001-001"
  caratula: string; // Ej: "Juan Pérez VS Empresa XYZ"

  // Partes
  demandante: string;
  demandado: string;

  // Ubicación
  juzgado: string;
  juez: string;
  ciudad: string;

  // Fechas importantes
  fechaRadicacion: Date;
  proximaAudiencia?: Date;

  // Estado
  estado: "activo" | "resuelto" | "apelacion" | "archivado";

  // Movimientos
  movimientos: Movimiento[];
  ultimoMovimiento: Movimiento;

  // Metadatos
  creado: Date;
  actualizado: Date;
  monitoredDesde: Date;
}

/**
 * Reporte de movimientos
 * Se genera 2 veces al día
 */
export interface ReporteMovimientos {
  id: string;
  fecha: Date;
  horaGeneracion: string; // "08:00" o "18:00"

  expedientes: {
    numeroExpediente: string;
    caratula: string;
    estado: string;
    ultimoMovimiento: {
      tipo: string;
      descripcion: string;
      fecha: Date;
      diasDesdeUltimo: number;
    };
    proximaAudiencia?: Date;
  }[];

  resumen: {
    totalExpedientes: number;
    expedientesActivos: number;
    expedientesResueltos: number;
    movimientosHoy: number;
    expedientesConMovimientoReciente: number;
  };

  generadoPor: string; // Sistema automático
}

/**
 * Configuración de monitoreo para un expediente
 */
export interface ConfiguracionMonitoreo {
  numeroExpediente: string;
  activo: boolean;
  frecuenciaChequeo: "diaria" | "semanal" | "mensual";
  notificaciones: {
    porEmail: boolean;
    porSMS?: boolean;
    porNotificacion?: boolean;
  };
  alertarSobre: {
    todoMovimiento: boolean;
    soloAudiencias: boolean;
    soloSentencias: boolean;
  };
}

/**
 * Estadísticas de un expediente
 */
export interface EstadisticasExpediente {
  numeroExpediente: string;
  totalMovimientos: number;
  movimientosEsteAno: number;
  diasDesdeLaRadicacion: number;
  diasSinMovimiento: number;
  tiposMovimientosRegistrados: TipoMovimiento[];
  ultimaActividad: {
    tipo: TipoMovimiento;
    fecha: Date;
  };
}

/**
 * Validadores para tipos de expediente
 */

export function esTipoMovimientoValido(tipo: string): tipo is TipoMovimiento {
  const tipos: TipoMovimiento[] = [
    "radicacion",
    "auto_admisorio",
    "traslado",
    "audiencia_programada",
    "audiencia_celebrada",
    "sentencia",
    "apelacion",
    "recurso",
    "ejecucion",
    "archivo",
    "otro",
  ];
  return tipos.includes(tipo as TipoMovimiento);
}

export function esEstadoExpedienteValido(
  estado: string
): estado is "activo" | "resuelto" | "apelacion" | "archivado" {
  return ["activo", "resuelto", "apelacion", "archivado"].includes(estado);
}

export function esNumeroExpedienteValido(numero: string): boolean {
  // Formato dominicano: 2024-00001-00-01-00-JCL-001-001
  return /^\d{4}-\d{5}-\d{2}-\d{2}-\d{2}-[A-Z]{3}-\d{3}-\d{3}$/.test(numero);
}

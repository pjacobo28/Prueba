/**
 * Tipos TypeScript para trabajo legal
 * Asegura que toda la información sea correctamente tipada
 */

/**
 * Información de una persona (física)
 * Usada para demandantes, demandados, partes
 */
export interface Persona {
  nombre: string;
  rut: string;           // Ej: "12345678-9"
  domicilio: string;
  email: string;
  telefono?: string;
  profesion?: string;
}

/**
 * Estados posibles de un caso
 */
export type EstadoCase = "activo" | "resuelto" | "apelacion" | "archivado";

/**
 * Monitoreo de caso - Información principal del expediente
 */
export interface CaseMonitor {
  caseId: string;              // Ej: "CASO-2024-001"
  demandante: Persona;
  demandado: Persona;
  estado: EstadoCase;
  ultimaActualizacion: Date;
  proximaAudiencia?: Date;
  juzgado?: string;
  juez?: string;
  descripcion?: string;
}

/**
 * Tipos de documentos legales
 */
export type TipoDocumento =
  | "demanda"
  | "escrito"
  | "sentencia"
  | "auto"
  | "resolucion"
  | "laudo"
  | "otro";

/**
 * Documento legal - Archivo asociado a un caso
 */
export interface DocumentoLegal {
  id: string;                  // Ej: "DOC-2024-001"
  nombre: string;
  tipo: TipoDocumento;
  fecha: Date;
  contenido?: string;          // Texto extraído
  url?: string;                // Link al archivo
  caseId?: string;             // Caso al que pertenece
}

/**
 * Tipos de alertas
 */
export type TipoAlerta =
  | "cambio_estado"
  | "nuevo_documento"
  | "proximaAudiencia"
  | "plazo_vencimiento"
  | "otro";

/**
 * Alerta - Notificación importante sobre un caso
 */
export interface Alert {
  id: string;                  // Ej: "ALERT-2024-001"
  caseId: string;
  tipo: TipoAlerta;
  mensaje: string;
  fecha: Date;
  leida: boolean;
  accion?: string;             // Ej: "revisar_documento"
}

/**
 * Jurisprudencia - Fallo o sentencia de referencia
 */
export interface Jurisprudencia {
  id: string;                  // Ej: "JURIS-2024-001"
  corte: string;               // Ej: "Corte Suprema", "Juzgado Laboral"
  fecha: Date;
  tema: string;                // Ej: "Indemnización por despido"
  partes: string;              // Quiénes fueron las partes
  resolucion: string;          // Lo que se decidió
  url?: string;
  sentencia?: string;          // Número de sentencia
}

/**
 * Argumento jurídico - Parte de la estrategia legal
 */
export interface ArgumentoLegal {
  id: string;
  descripcion: string;
  baseLegal?: string;          // Ej: "Artículo 123 del Código del Trabajo"
  jurisprudencia?: string;     // ID de jurisprudencia de referencia
  fortaleza: 1 | 2 | 3 | 4 | 5; // Evaluación de 1 a 5
}

/**
 * Caso legal completo - Información integrada
 */
export interface CasoLegal {
  id: string;
  monitor: CaseMonitor;
  documentos: DocumentoLegal[];
  alertas: Alert[];
  jurisprudenciaAplicable: Jurisprudencia[];
  argumentos: ArgumentoLegal[];
  creado: Date;
  actualizado: Date;
}

/**
 * Usuario - Para control de acceso
 */
export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: "admin" | "abogado" | "asistente" | "cliente";
  activo: boolean;
  ultimoAcceso?: Date;
}

/**
 * Validadores de tipos
 */

/** Valida que un RUT tenga formato correcto */
export function esRutValido(rut: string): boolean {
  return /^\d{1,8}-[0-9K]$/.test(rut);
}

/** Valida que un email sea válido */
export function esEmailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Valida que un estado sea válido */
export function esEstadoValido(estado: string): estado is EstadoCase {
  return ["activo", "resuelto", "apelacion", "archivado"].includes(estado);
}

/** Valida que un tipo de documento sea válido */
export function esTipoDocumentoValido(tipo: string): tipo is TipoDocumento {
  return [
    "demanda",
    "escrito",
    "sentencia",
    "auto",
    "resolucion",
    "laudo",
    "otro",
  ].includes(tipo);
}

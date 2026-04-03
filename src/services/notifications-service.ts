/**
 * Servicio de Notificaciones por Email
 * Envia alertas sobre movimientos, audiencias y reportes
 */

import nodemailer from "nodemailer";
import Database from "better-sqlite3";
import * as path from "path";

export interface Notificacion {
  id: string;
  usuarioId: string;
  tipo: "nuevo_movimiento" | "proxima_audiencia" | "reporte_generado" | "alerta_urgente";
  asunto: string;
  mensaje: string;
  enviado: boolean;
  fechaEnvio?: Date;
  email: string;
}

export class NotificationsService {
  private transporter: any;
  private db: Database.Database;
  private emailOrigen: string;

  constructor(
    emailConfig?: {
      host: string;
      port: number;
      user: string;
      pass: string;
    },
    dbPath: string = "./data/notifications.db"
  ) {
    this.emailOrigen = emailConfig?.user || process.env.EMAIL_USER || "noreply@expedientes.com";

    // Configurar transporter de email
    this.transporter = nodemailer.createTransport(
      emailConfig || {
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      }
    );

    // Crear directorio si no existe
    const fs = require("fs");
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.inicializarEsquema();
  }

  /**
   * Inicializa el esquema de notificaciones
   */
  private inicializarEsquema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS notificaciones (
        id TEXT PRIMARY KEY,
        usuario_id TEXT NOT NULL,
        email TEXT NOT NULL,
        tipo TEXT NOT NULL,
        asunto TEXT NOT NULL,
        mensaje TEXT NOT NULL,
        enviado BOOLEAN DEFAULT 0,
        fecha_envio DATETIME,
        creado DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS preferencias_notificaciones (
        usuario_id TEXT PRIMARY KEY,
        nuevo_movimiento BOOLEAN DEFAULT 1,
        proxima_audiencia BOOLEAN DEFAULT 1,
        reporte_generado BOOLEAN DEFAULT 1,
        alerta_urgente BOOLEAN DEFAULT 1,
        frecuencia TEXT DEFAULT 'inmediata'
      );

      CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id);
      CREATE INDEX IF NOT EXISTS idx_notificaciones_enviado ON notificaciones(enviado);
    `);

    console.log("✅ Esquema de notificaciones inicializado");
  }

  /**
   * Envía notificación de nuevo movimiento
   */
  async notificarNuevoMovimiento(
    usuarioId: string,
    email: string,
    numeroExpediente: string,
    tipo: string,
    descripcion: string
  ): Promise<boolean> {
    const asunto = `🔔 Nuevo movimiento en expediente ${numeroExpediente}`;
    const mensaje = `
      <h2>Nuevo Movimiento en Expediente</h2>
      <p><strong>Número:</strong> ${numeroExpediente}</p>
      <p><strong>Tipo:</strong> ${tipo}</p>
      <p><strong>Descripción:</strong> ${descripcion}</p>
      <p><a href="http://localhost:3000/expediente/${numeroExpediente}">Ver detalles</a></p>
    `;

    return this.enviarNotificacion(usuarioId, email, "nuevo_movimiento", asunto, mensaje);
  }

  /**
   * Envía notificación de próxima audiencia
   */
  async notificarProximaAudiencia(
    usuarioId: string,
    email: string,
    numeroExpediente: string,
    caratula: string,
    fecha: Date,
    diasRestantes: number
  ): Promise<boolean> {
    const asunto = `⏰ Próxima audiencia en ${diasRestantes} días`;
    const mensaje = `
      <h2>Próxima Audiencia</h2>
      <p><strong>Expediente:</strong> ${numeroExpediente}</p>
      <p><strong>Caratula:</strong> ${caratula}</p>
      <p><strong>Fecha:</strong> ${fecha.toLocaleDateString("es-DO")}</p>
      <p><strong>Días restantes:</strong> ${diasRestantes}</p>
      <p><a href="http://localhost:3000/expediente/${numeroExpediente}">Ver expediente</a></p>
    `;

    return this.enviarNotificacion(usuarioId, email, "proxima_audiencia", asunto, mensaje);
  }

  /**
   * Envía notificación de reporte generado
   */
  async notificarReporteGenerado(
    usuarioId: string,
    email: string,
    hora: string,
    totalExpedientes: number,
    movimientos: number
  ): Promise<boolean> {
    const asunto = `📊 Reporte de expedientes generado a las ${hora}`;
    const mensaje = `
      <h2>Reporte de Expedientes</h2>
      <p><strong>Hora de generación:</strong> ${hora}</p>
      <p><strong>Total de expedientes:</strong> ${totalExpedientes}</p>
      <p><strong>Movimientos hoy:</strong> ${movimientos}</p>
      <p><a href="http://localhost:3000/reportes">Ver todos los reportes</a></p>
    `;

    return this.enviarNotificacion(usuarioId, email, "reporte_generado", asunto, mensaje);
  }

  /**
   * Envía alerta urgente
   */
  async notificarAlertaUrgente(
    usuarioId: string,
    email: string,
    titulo: string,
    descripcion: string
  ): Promise<boolean> {
    const asunto = `🚨 ALERTA URGENTE: ${titulo}`;
    const mensaje = `
      <h2 style="color: red;">ALERTA URGENTE</h2>
      <p><strong>${titulo}</strong></p>
      <p>${descripcion}</p>
      <p><a href="http://localhost:3000">Ir al dashboard</a></p>
    `;

    return this.enviarNotificacion(usuarioId, email, "alerta_urgente", asunto, mensaje);
  }

  /**
   * Envía una notificación genérica
   */
  private async enviarNotificacion(
    usuarioId: string,
    email: string,
    tipo: string,
    asunto: string,
    mensaje: string
  ): Promise<boolean> {
    const id = "notif-" + Date.now();

    try {
      // Insertar en BD
      const stmt = this.db.prepare(`
        INSERT INTO notificaciones (id, usuario_id, email, tipo, asunto, mensaje)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, usuarioId, email, tipo, asunto, mensaje);

      // Enviar email
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await this.transporter.sendMail({
          from: this.emailOrigen,
          to: email,
          subject: asunto,
          html: mensaje,
        });

        // Marcar como enviada
        const updateStmt = this.db.prepare(
          "UPDATE notificaciones SET enviado = 1, fecha_envio = CURRENT_TIMESTAMP WHERE id = ?"
        );
        updateStmt.run(id);

        console.log(`✅ Notificación enviada a ${email}`);
        return true;
      } else {
        console.log(`📧 Email no configurado, notificación guardada en BD: ${asunto}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Error enviando notificación:`, error);
      return false;
    }
  }

  /**
   * Obtiene preferencias de notificación de usuario
   */
  obtenerPreferencias(usuarioId: string): any {
    const stmt = this.db.prepare("SELECT * FROM preferencias_notificaciones WHERE usuario_id = ?");
    const prefs = stmt.get(usuarioId);

    if (!prefs) {
      // Crear preferencias por defecto
      const insertStmt = this.db.prepare(`
        INSERT INTO preferencias_notificaciones (usuario_id)
        VALUES (?)
      `);
      insertStmt.run(usuarioId);
      return {
        usuario_id: usuarioId,
        nuevo_movimiento: true,
        proxima_audiencia: true,
        reporte_generado: true,
        alerta_urgente: true,
        frecuencia: "inmediata",
      };
    }

    return prefs;
  }

  /**
   * Actualiza preferencias de notificación
   */
  actualizarPreferencias(usuarioId: string, preferencias: any): void {
    const stmt = this.db.prepare(`
      UPDATE preferencias_notificaciones
      SET nuevo_movimiento = ?, proxima_audiencia = ?,
          reporte_generado = ?, alerta_urgente = ?, frecuencia = ?
      WHERE usuario_id = ?
    `);

    stmt.run(
      preferencias.nuevo_movimiento,
      preferencias.proxima_audiencia,
      preferencias.reporte_generado,
      preferencias.alerta_urgente,
      preferencias.frecuencia,
      usuarioId
    );
  }

  /**
   * Obtiene notificaciones no enviadas
   */
  obtenerNotificacionesPendientes(): any[] {
    const stmt = this.db.prepare(`
      SELECT * FROM notificaciones
      WHERE enviado = 0
      ORDER BY creado ASC
      LIMIT 50
    `);
    return stmt.all() as any[];
  }

  /**
   * Obtiene historial de notificaciones
   */
  obtenerHistorial(usuarioId: string, limitar: number = 50): any[] {
    const stmt = this.db.prepare(`
      SELECT * FROM notificaciones
      WHERE usuario_id = ?
      ORDER BY creado DESC
      LIMIT ?
    `);
    return stmt.all(usuarioId, limitar) as any[];
  }

  /**
   * Cierra la base de datos
   */
  cerrar(): void {
    this.db.close();
  }
}

/**
 * Instancia global
 */
let notificationsInstance: NotificationsService | null = null;

export function inicializarNotifications(): NotificationsService {
  if (!notificationsInstance) {
    notificationsInstance = new NotificationsService();
  }
  return notificationsInstance;
}

export function obtenerNotifications(): NotificationsService {
  if (!notificationsInstance) {
    notificationsInstance = new NotificationsService();
  }
  return notificationsInstance;
}

export default NotificationsService;

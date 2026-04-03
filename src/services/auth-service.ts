/**
 * Servicio de Autenticación con JWT
 * Gestiona usuarios, tokens y control de acceso
 */

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Database from "better-sqlite3";
import * as path from "path";

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: "admin" | "abogado" | "asistente" | "cliente";
  activo: boolean;
  creado: Date;
}

export interface TokenPayload {
  id: string;
  email: string;
  rol: string;
  iat: number;
  exp: number;
}

export class AuthService {
  private db: Database.Database;
  private jwtSecret: string;
  private jwtExpire: string = "24h";

  constructor(
    dbPath: string = "./data/auth.db",
    jwtSecret: string = process.env.JWT_SECRET || "tu-secreto-super-seguro-cambiar-en-produccion"
  ) {
    this.jwtSecret = jwtSecret;

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
   * Inicializa el esquema de autenticación
   */
  private inicializarEsquema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        nombre TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        rol TEXT NOT NULL DEFAULT 'asistente',
        activo BOOLEAN DEFAULT 1,
        creado DATETIME DEFAULT CURRENT_TIMESTAMP,
        actualizado DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tokens_revocados (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token TEXT UNIQUE NOT NULL,
        usuario_id TEXT NOT NULL,
        revocado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
      );

      CREATE TABLE IF NOT EXISTS logs_acceso (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id TEXT NOT NULL,
        accion TEXT NOT NULL,
        ip TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
      );

      CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
      CREATE INDEX IF NOT EXISTS idx_logs_usuario ON logs_acceso(usuario_id);
    `);

    // Crear usuario admin por defecto si no existe
    this.crearUsuarioDefecto();

    console.log("✅ Esquema de autenticación inicializado");
  }

  /**
   * Crea usuario admin por defecto
   */
  private crearUsuarioDefecto(): void {
    try {
      const stmt = this.db.prepare("SELECT COUNT(*) as count FROM usuarios");
      const result = stmt.get() as any;

      if (result.count === 0) {
        const adminId = "admin-" + Date.now();
        const passwordHash = bcrypt.hashSync("admin123", 10);

        const insertStmt = this.db.prepare(`
          INSERT INTO usuarios (id, email, nombre, password_hash, rol)
          VALUES (?, ?, ?, ?, ?)
        `);

        insertStmt.run(
          adminId,
          "admin@expedientes.com",
          "Administrador",
          passwordHash,
          "admin"
        );

        console.log("✅ Usuario admin creado: admin@expedientes.com / admin123");
      }
    } catch (error) {
      console.error("Error creando usuario por defecto:", error);
    }
  }

  /**
   * Registra un nuevo usuario
   */
  registrar(email: string, nombre: string, password: string, rol: string = "asistente"): Usuario {
    const id = "user-" + Date.now();
    const passwordHash = bcrypt.hashSync(password, 10);

    const stmt = this.db.prepare(`
      INSERT INTO usuarios (id, email, nombre, password_hash, rol)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, email, nombre, passwordHash, rol);

    return {
      id,
      email,
      nombre,
      rol: rol as any,
      activo: true,
      creado: new Date(),
    };
  }

  /**
   * Login - genera JWT token
   */
  login(email: string, password: string): { token: string; usuario: Usuario } {
    const stmt = this.db.prepare("SELECT * FROM usuarios WHERE email = ?");
    const usuario = stmt.get(email) as any;

    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    if (!usuario.activo) {
      throw new Error("Usuario desactivado");
    }

    // Verificar contraseña
    if (!bcrypt.compareSync(password, usuario.password_hash)) {
      throw new Error("Contraseña incorrecta");
    }

    // Generar token
    const token = this.generarToken(usuario);

    // Registrar acceso
    this.registrarAcceso(usuario.id, "login", "localhost");

    return {
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
        activo: usuario.activo,
        creado: new Date(usuario.creado),
      },
    };
  }

  /**
   * Genera un JWT token
   */
  private generarToken(usuario: any): string {
    const payload: TokenPayload = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 horas
    };

    return jwt.sign(payload, this.jwtSecret);
  }

  /**
   * Verifica y decodifica un token
   */
  verificarToken(token: string): TokenPayload {
    try {
      // Verificar si está revocado
      const stmtRevocado = this.db.prepare(
        "SELECT id FROM tokens_revocados WHERE token = ?"
      );
      if (stmtRevocado.get(token)) {
        throw new Error("Token revocado");
      }

      const payload = jwt.verify(token, this.jwtSecret) as TokenPayload;
      return payload;
    } catch (error) {
      throw new Error("Token inválido: " + String(error));
    }
  }

  /**
   * Obtiene un usuario por ID
   */
  obtenerUsuario(id: string): Usuario | null {
    const stmt = this.db.prepare("SELECT * FROM usuarios WHERE id = ?");
    const usuario = stmt.get(id) as any;

    if (!usuario) return null;

    return {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol,
      activo: usuario.activo,
      creado: new Date(usuario.creado),
    };
  }

  /**
   * Actualiza contraseña
   */
  actualizarContrasena(usuarioId: string, passwordActual: string, passwordNueva: string): void {
    const usuario = this.obtenerUsuario(usuarioId);
    if (!usuario) throw new Error("Usuario no encontrado");

    const stmt = this.db.prepare("SELECT password_hash FROM usuarios WHERE id = ?");
    const result = stmt.get(usuarioId) as any;

    if (!bcrypt.compareSync(passwordActual, result.password_hash)) {
      throw new Error("Contraseña actual incorrecta");
    }

    const newHash = bcrypt.hashSync(passwordNueva, 10);
    const updateStmt = this.db.prepare("UPDATE usuarios SET password_hash = ? WHERE id = ?");
    updateStmt.run(newHash, usuarioId);

    this.registrarAcceso(usuarioId, "cambio_contraseña", "localhost");
  }

  /**
   * Registra acceso de usuario
   */
  private registrarAcceso(usuarioId: string, accion: string, ip: string): void {
    const stmt = this.db.prepare(
      "INSERT INTO logs_acceso (usuario_id, accion, ip) VALUES (?, ?, ?)"
    );
    stmt.run(usuarioId, accion, ip);
  }

  /**
   * Obtiene logs de acceso de un usuario
   */
  obtenerLogsAcceso(usuarioId: string, limitar: number = 50): any[] {
    const stmt = this.db.prepare(`
      SELECT * FROM logs_acceso
      WHERE usuario_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    return stmt.all(usuarioId, limitar) as any[];
  }

  /**
   * Revocar token
   */
  revocarToken(token: string, usuarioId: string): void {
    const stmt = this.db.prepare(
      "INSERT INTO tokens_revocados (token, usuario_id) VALUES (?, ?)"
    );
    stmt.run(token, usuarioId);
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
let authInstance: AuthService | null = null;

export function inicializarAuth(
  dbPath: string = "./data/auth.db"
): AuthService {
  if (!authInstance) {
    authInstance = new AuthService(dbPath);
  }
  return authInstance;
}

export function obtenerAuth(): AuthService {
  if (!authInstance) {
    authInstance = new AuthService();
  }
  return authInstance;
}

export default AuthService;

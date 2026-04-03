/**
 * Aplicación Completa - Sistema Integrado
 * Dashboard + Scheduler + Notificaciones + PDF + Autenticación
 */

import express from "express";
import cors from "cors";
import * as path from "path";
import { obtenerAPI } from "./api/expedientes-api";
import { obtenerDB } from "./services/database";
import { inicializarAuth, obtenerAuth } from "./services/auth-service";
import { inicializarNotifications, obtenerNotifications } from "./services/notifications-service";
import { ReporteSchedulerConDB } from "./services/scheduler-con-db";
import PDFGenerator from "./services/pdf-generator";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// Inicializar servicios
const api = obtenerAPI();
const db = obtenerDB();
const auth = inicializarAuth();
const notifications = inicializarNotifications();

// ─────────────────────────────────────────────────────
// MIDDLEWARE DE AUTENTICACIÓN
// ─────────────────────────────────────────────────────

const verificarToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token && !req.path.startsWith("/login") && !req.path.startsWith("/register")) {
    // Permitir acceso público a páginas pero restringir API
    if (req.path.startsWith("/api/")) {
      return res.status(401).json({ error: "Token requerido" });
    }
  }

  if (token) {
    try {
      const payload = auth.verificarToken(token);
      req.usuario = payload;
    } catch (error) {
      return res.status(401).json({ error: "Token inválido" });
    }
  }

  next();
};

app.use(verificarToken);

// ─────────────────────────────────────────────────────
// RUTAS DE AUTENTICACIÓN
// ─────────────────────────────────────────────────────

app.post("/api/auth/login", (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    const resultado = auth.login(email, password);

    res.json({
      exito: true,
      token: resultado.token,
      usuario: resultado.usuario,
    });
  } catch (error) {
    res.status(401).json({ exito: false, error: String(error) });
  }
});

app.post("/api/auth/logout", (req: any, res: any) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token && req.usuario) {
      auth.revocarToken(token, req.usuario.id);
    }

    res.json({ exito: true, mensaje: "Sesión cerrada" });
  } catch (error) {
    res.status(500).json({ exito: false, error: String(error) });
  }
});

app.get("/api/auth/perfil", (req: any, res: any) => {
  if (!req.usuario) {
    return res.status(401).json({ error: "No autenticado" });
  }

  const usuario = auth.obtenerUsuario(req.usuario.id);
  res.json({ exito: true, usuario });
});

// ─────────────────────────────────────────────────────
// RUTAS HTML
// ─────────────────────────────────────────────────────

app.get("/", (req: any, res: any) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/expedientes", (req: any, res: any) => {
  res.sendFile(path.join(__dirname, "../public/expedientes.html"));
});

app.get("/reportes", (req: any, res: any) => {
  res.sendFile(path.join(__dirname, "../public/reportes.html"));
});

app.get("/estadisticas", (req: any, res: any) => {
  res.sendFile(path.join(__dirname, "../public/estadisticas.html"));
});

// ─────────────────────────────────────────────────────
// API - EXPEDIENTES (Existentes)
// ─────────────────────────────────────────────────────

app.get("/api/dashboard", async (req: any, res: any) => {
  const stats = db.calcularEstadisticasGlobales();
  const info = db.obtenerInfo();
  const reportes = db.obtenerReportes(5);
  const proximasAudiencias = db
    .obtenerTodosExpedientes()
    .filter((e: any) => e.proximaAudiencia && e.estado === "activo")
    .sort(
      (a: any, b: any) =>
        (a.proximaAudiencia?.getTime() || 0) - (b.proximaAudiencia?.getTime() || 0)
    )
    .slice(0, 5);

  res.json({
    exito: true,
    datos: {
      estadisticas: stats,
      baseDatos: info,
      ultimosReportes: reportes,
      proximasAudiencias: proximasAudiencias.map((e: any) => ({
        numeroExpediente: e.numeroExpediente,
        caratula: e.caratula,
        proximaAudiencia: e.proximaAudiencia,
        diasHasta: Math.ceil(
          ((e.proximaAudiencia?.getTime() || 0) - Date.now()) / (1000 * 60 * 60 * 24)
        ),
      })),
    },
  });
});

app.get("/api/expedientes", async (req: any, res: any) => {
  res.json(await api.obtenerTodos());
});

app.get("/api/expedientes/:numero", async (req: any, res: any) => {
  res.json(await api.obtenerPorNumero(req.params.numero));
});

app.get("/api/expedientes/:numero/movimientos", async (req: any, res: any) => {
  res.json(await api.obtenerMovimientos(req.params.numero));
});

app.get("/api/estadisticas", async (req: any, res: any) => {
  res.json(await api.obtenerEstadisticas());
});

// ─────────────────────────────────────────────────────
// API - NOTIFICACIONES
// ─────────────────────────────────────────────────────

app.get("/api/notificaciones/preferencias", (req: any, res: any) => {
  if (!req.usuario) return res.status(401).json({ error: "No autenticado" });

  const prefs = notifications.obtenerPreferencias(req.usuario.id);
  res.json({ exito: true, preferencias: prefs });
});

app.post("/api/notificaciones/preferencias", (req: any, res: any) => {
  if (!req.usuario) return res.status(401).json({ error: "No autenticado" });

  notifications.actualizarPreferencias(req.usuario.id, req.body);
  res.json({ exito: true, mensaje: "Preferencias actualizadas" });
});

app.get("/api/notificaciones/historial", (req: any, res: any) => {
  if (!req.usuario) return res.status(401).json({ error: "No autenticado" });

  const historial = notifications.obtenerHistorial(req.usuario.id);
  res.json({ exito: true, notificaciones: historial });
});

// ─────────────────────────────────────────────────────
// API - DESCARGAS (PDF)
// ─────────────────────────────────────────────────────

app.get("/api/descargar/expediente/:numero", async (req: any, res: any) => {
  try {
    const expediente = db.obtenerExpediente(req.params.numero);

    if (!expediente) {
      return res.status(404).json({ error: "Expediente no encontrado" });
    }

    const generator = new PDFGenerator();
    const filepath = await generator.generarReporteExpediente(expediente);

    res.download(filepath);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ─────────────────────────────────────────────────────
// API - HEALTH CHECK
// ─────────────────────────────────────────────────────

app.get("/api/health", (req: any, res: any) => {
  const info = db.obtenerInfo();
  res.json({
    status: "ok",
    servidor: "expedientes-completo",
    baseDatos: info,
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────────────
// INICIO DE SERVIDOR Y SCHEDULER
// ─────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`\n🚀 SISTEMA COMPLETO INICIADO`);
  console.log(`📍 Dashboard: http://localhost:${PORT}`);
  console.log(`\n🔐 Credenciales por defecto:`);
  console.log(`   Email: admin@expedientes.com`);
  console.log(`   Password: admin123`);
  console.log(`\n📊 Rutas disponibles:`);
  console.log(`   GET  /                 - Dashboard`);
  console.log(`   GET  /expedientes      - Lista de expedientes`);
  console.log(`   POST /api/auth/login   - Login`);
  console.log(`\n⚠️  Cambiar credenciales de admin en producción\n`);

  // Iniciar scheduler si está configurado
  if (process.env.INICIAR_SCHEDULER === "true") {
    console.log(`🔄 Iniciando scheduler de reportes automáticos...`);

    const scheduler = new ReporteSchedulerConDB({
      usuario: process.env.PODER_JUDICIAL_USER || "",
      contrasena: process.env.PODER_JUDICIAL_PASS || "",
      expedientes: (process.env.EXPEDIENTES || "").split(","),
      horariosEjecucion: ["09:00", "17:00"],
      directorioReportes: "./reportes",
      rutaDB: "./data/expedientes.db",
    });

    scheduler.iniciar();
  }
});

export default app;

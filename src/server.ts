/**
 * Servidor Express - Dashboard de Expedientes
 * Panel web para visualizar casos, movimientos y estadísticas
 */

import express from "express";
import cors from "cors";
import * as path from "path";
import { obtenerAPI } from "./api/expedientes-api";
import { obtenerDB } from "./services/database";

const app = express();
const api = obtenerAPI();
const db = obtenerDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// GET / - Dashboard principal
app.get("/", (req: any, res: any) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// GET /expedientes - Lista de expedientes
app.get("/expedientes", (req: any, res: any) => {
  res.sendFile(path.join(__dirname, "../public/expedientes.html"));
});

// GET /reportes - Reportes
app.get("/reportes", (req: any, res: any) => {
  res.sendFile(path.join(__dirname, "../public/reportes.html"));
});

// GET /estadisticas - Estadísticas
app.get("/estadisticas", (req: any, res: any) => {
  res.sendFile(path.join(__dirname, "../public/estadisticas.html"));
});

// API - Dashboard
app.get("/api/dashboard", async (req: any, res: any) => {
  try {
    const stats = db.calcularEstadisticasGlobales();
    const info = db.obtenerInfo();
    const reportes = db.obtenerReportes(5);
    const proximasAudiencias = db
      .obtenerTodosExpedientes()
      .filter((e: any) => e.proximaAudiencia && e.estado === "activo")
      .sort(
        (a: any, b: any) =>
          (a.proximaAudiencia?.getTime() || 0) -
          (b.proximaAudiencia?.getTime() || 0)
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
            ((e.proximaAudiencia?.getTime() || 0) - Date.now()) /
              (1000 * 60 * 60 * 24)
          ),
        })),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ exito: false, error: String(error) });
  }
});

// API - Expedientes
app.get("/api/expedientes", async (req: any, res: any) => {
  const response = await api.obtenerTodos();
  res.json(response);
});

app.get("/api/expedientes/:numero", async (req: any, res: any) => {
  const response = await api.obtenerPorNumero(req.params.numero);
  res.json(response);
});

app.get("/api/expedientes/estado/:estado", async (req: any, res: any) => {
  const response = await api.obtenerPorEstado(req.params.estado);
  res.json(response);
});

app.get("/api/expedientes/:numero/movimientos", async (req: any, res: any) => {
  const response = await api.obtenerMovimientos(req.params.numero);
  res.json(response);
});

// API - Reportes y Estadísticas
app.get("/api/reportes", async (req: any, res: any) => {
  const limite = Math.min(parseInt(req.query.limite) || 20, 100);
  const response = await api.obtenerReportes(limite);
  res.json(response);
});

app.get("/api/reportes/:id", async (req: any, res: any) => {
  const response = await api.obtenerReporte(req.params.id);
  res.json(response);
});

app.get("/api/estadisticas", async (req: any, res: any) => {
  const response = await api.obtenerEstadisticas();
  res.json(response);
});

app.get("/api/estadisticas/mes", async (req: any, res: any) => {
  const meses = Math.min(parseInt(req.query.meses) || 12, 36);
  const response = await api.obtenerEstadisticasPorMes(meses);
  res.json(response);
});

// API - Búsqueda
app.get("/api/buscar", async (req: any, res: any) => {
  if (!req.query.q) {
    return res
      .status(400)
      .json({ exito: false, error: "Parámetro 'q' requerido" });
  }
  const response = await api.buscar(String(req.query.q));
  res.json(response);
});

app.get("/api/proximas-audiencias", async (req: any, res: any) => {
  const response = await api.obtenerProximasAudiencias();
  res.json(response);
});

app.get("/api/activos/reciente", async (req: any, res: any) => {
  const dias = Math.min(parseInt(req.query.dias) || 7, 90);
  const response = await api.obtenerConActividadReciente(dias);
  res.json(response);
});

app.get("/api/movimientos/fecha/:fecha", async (req: any, res: any) => {
  const response = await api.obtenerMovimientosPorFecha(req.params.fecha);
  res.json(response);
});

// Health check
app.get("/api/health", (req: any, res: any) => {
  const info = db.obtenerInfo();
  res.json({
    status: "ok",
    servidor: "dashboard-expedientes",
    baseDatos: info,
    timestamp: new Date().toISOString(),
  });
});

// 404
app.use((req: any, res: any) => {
  res.status(404).json({
    exito: false,
    error: "Ruta no encontrada",
    ruta: req.path,
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀 Dashboard iniciado`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`\n📊 Rutas disponibles:`);
  console.log(`   GET  /                    - Dashboard principal`);
  console.log(`   GET  /expedientes         - Lista de expedientes`);
  console.log(`   GET  /reportes            - Reportes generados`);
  console.log(`   GET  /estadisticas        - Estadísticas`);
  console.log(`\n📡 API endpoints:`);
  console.log(`   GET  /api/dashboard       - Datos del dashboard`);
  console.log(`   GET  /api/expedientes     - Todos los expedientes`);
  console.log(`   GET  /api/estadisticas    - Estadísticas`);
  console.log(`   GET  /api/health          - Estado del servidor\n`);
});

export default app;

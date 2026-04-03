# 💾 Sistema de Base de Datos - Expedientes

Sistema completo de persistencia con **SQLite** para guardar histórico completo de expedientes, movimientos y reportes.

---

## 🎯 Características

✅ **Almacenamiento Persistente** - Datos guardados en SQLite  
✅ **Histórico Completo** - Cada cambio es registrado  
✅ **Análisis Históricos** - Estadísticas por mes, año, expediente  
✅ **API REST** - Consultas desde aplicaciones externas  
✅ **Búsqueda Avanzada** - Por estado, fecha, término, juzgado  
✅ **Reportes Indexados** - Acceso rápido a reportes generados  
✅ **Estadísticas Calculadas** - Métricas de expedientes activos  
✅ **Caché en Memoria** - Sin pérdida de datos si falla el portal  

---

## 📁 Estructura de Base de Datos

### Tablas Principales

#### `expedientes`
```sql
CREATE TABLE expedientes (
  id INTEGER PRIMARY KEY,
  numeroExpediente TEXT UNIQUE,
  caratula TEXT,
  demandante TEXT,
  demandado TEXT,
  juzgado TEXT,
  juez TEXT,
  ciudad TEXT,
  estado TEXT (activo|resuelto|apelacion|archivado),
  fechaRadicacion DATETIME,
  proximaAudiencia DATETIME,
  creado DATETIME,
  actualizado DATETIME
);
```

#### `movimientos`
```sql
CREATE TABLE movimientos (
  id INTEGER PRIMARY KEY,
  numeroExpediente TEXT,
  tipo TEXT (radicacion|auto_admisorio|...),
  descripcion TEXT,
  fecha DATETIME,
  juez TEXT,
  numeroAuto TEXT,
  observaciones TEXT,
  creado DATETIME,
  FOREIGN KEY (numeroExpediente) REFERENCES expedientes
);
```

#### `reportes`
```sql
CREATE TABLE reportes (
  id INTEGER PRIMARY KEY,
  reporteId TEXT UNIQUE,
  fecha DATETIME,
  horaGeneracion TEXT (09:00|17:00),
  totalExpedientes INTEGER,
  expedientesActivos INTEGER,
  expedientesResueltos INTEGER,
  movimientosHoy INTEGER,
  expedientesConMovimientoReciente INTEGER,
  archivoHTML TEXT,
  archivoJSON TEXT,
  creado DATETIME
);
```

#### `historial_movimientos`
```sql
CREATE TABLE historial_movimientos (
  id INTEGER PRIMARY KEY,
  numeroExpediente TEXT,
  movimientoId TEXT,
  tipo TEXT,
  descripcion TEXT,
  fecha DATETIME,
  registradoEn DATETIME,
  cambio TEXT,
  FOREIGN KEY (numeroExpediente) REFERENCES expedientes
);
```

#### `estadisticas_diarias`
```sql
CREATE TABLE estadisticas_diarias (
  id INTEGER PRIMARY KEY,
  fecha DATE UNIQUE,
  totalExpedientes INTEGER,
  expedientesActivos INTEGER,
  movimientosRegistrados INTEGER,
  expedientesConActividad INTEGER,
  creado DATETIME
);
```

### Índices de Performance

```sql
CREATE INDEX idx_expedientes_estado ON expedientes(estado);
CREATE INDEX idx_movimientos_fecha ON movimientos(fecha);
CREATE INDEX idx_movimientos_expediente ON movimientos(numeroExpediente);
CREATE INDEX idx_reportes_fecha ON reportes(fecha);
CREATE INDEX idx_historial_fecha ON historial_movimientos(fecha);
```

---

## 🚀 Uso Básico

### 1. Inicializar Base de Datos

```typescript
import { inicializarDB } from "./src/services/database";

// Crear/abrir BD
const db = inicializarDB("./data/expedientes.db");

// Obtener instancia existente
// const db = obtenerDB();
```

### 2. Guardar Expedientes

```typescript
import { Expediente } from "./src/types/expediente";

const expediente: Expediente = { /* ... */ };

db.guardarExpediente(expediente);
db.guardarMovimientos(
  expediente.numeroExpediente,
  expediente.movimientos
);
```

### 3. Guardar Reportes

```typescript
const reporte = generator.generar();
const html = generator.generarHTML();
const json = JSON.stringify(reporte);

db.guardarReporte(reporte, html, json);
```

### 4. Consultar Datos

```typescript
// Todos los expedientes
const todos = db.obtenerTodosExpedientes();

// Expediente específico
const expediente = db.obtenerExpediente("2024-00001-00-01-00-JCL-001-001");

// Por estado
const activos = db.obtenerExpedientesPorEstado("activo");

// Con actividad reciente
const recientes = db.obtenerExpedientesConActividadReciente(7);
```

### 5. Estadísticas

```typescript
// Globales
const stats = db.calcularEstadisticasGlobales();
// {
//   totalExpedientes: 10,
//   activos: 7,
//   resueltos: 3,
//   totalMovimientos: 45,
//   ultimaActualizacion: Date
// }

// Por mes
const porMes = db.calcularEstadisticasPorMes(12);
// [
//   { mes: "2026-03", movimientos: 12 },
//   { mes: "2026-02", movimientos: 8 },
// ]
```

---

## 📡 API REST

### Instanciar API

```typescript
import { obtenerAPI } from "./src/api/expedientes-api";

const api = obtenerAPI();
```

### Endpoints Disponibles

#### Expedientes

```typescript
// Todos
const res = await api.obtenerTodos();
// { exito: true, datos: Expediente[], timestamp: string }

// Específico
const res = await api.obtenerPorNumero("2024-00001-00-01-00-JCL-001-001");

// Por estado
const res = await api.obtenerPorEstado("activo");

// Con actividad reciente
const res = await api.obtenerConActividadReciente(7);
```

#### Movimientos

```typescript
// Historial de expediente
const res = await api.obtenerMovimientos("2024-00001-00-01-00-JCL-001-001");

// En una fecha específica
const res = await api.obtenerMovimientosPorFecha("2026-04-03");

// Historial completo
const res = await api.obtenerHistorial("2024-00001-00-01-00-JCL-001-001");
```

#### Reportes

```typescript
// Lista de reportes
const res = await api.obtenerReportes(20);

// Reporte específico
const res = await api.obtenerReporte("REPORTE-1775185272946");
```

#### Estadísticas

```typescript
// Globales
const res = await api.obtenerEstadisticas();

// Por mes
const res = await api.obtenerEstadisticasPorMes(12);
```

#### Búsqueda

```typescript
// Búsqueda libre
const res = await api.buscar("Juan");

// Próximas audiencias
const res = await api.obtenerProximasAudiencias();
```

---

## 🔄 Integración con Scheduler

### Scheduler con Base de Datos

```typescript
import { iniciarSchedulerConDB } from "./src/services/scheduler-con-db";

const scheduler = await iniciarSchedulerConDB({
  usuario: process.env.PODER_JUDICIAL_USER,
  contrasena: process.env.PODER_JUDICIAL_PASS,
  expedientes: [
    "2024-00001-00-01-00-JCL-001-001",
    "2024-00002-00-02-00-JCC-001-001",
  ],
  horariosEjecucion: ["09:00", "17:00"],
  directorioReportes: "./reportes",
  rutaDB: "./data/expedientes.db",
});

// El scheduler automáticamente:
// 1. Extrae expedientes del portal
// 2. Guarda en BD
// 3. Genera reporte
// 4. Guarda reporte en BD
// 5. Crea archivos TXT/HTML/JSON
```

---

## 📊 Análisis de Datos

### Casos de Uso Comunes

#### 1. Ver estado actual de todos los casos

```typescript
const api = obtenerAPI();
const todos = await api.obtenerTodos();

todos.datos?.forEach(expediente => {
  console.log(`${expediente.numeroExpediente}`);
  console.log(`  Estado: ${expediente.estado}`);
  console.log(`  Último movimiento: ${expediente.ultimoMovimiento.fecha}`);
});
```

#### 2. Encontrar casos que necesitan seguimiento urgente

```typescript
// Casos activos que no tienen próxima audiencia programada
const activos = await api.obtenerPorEstado("activo");
const sinAudiencia = activos.datos?.filter(e => !e.proximaAudiencia);

// Casos con movimiento hace más de 30 días
const recientes = await api.obtenerConActividadReciente(30);
const atrasados = activos.datos?.filter(
  e => !recientes.datos?.find(r => r.numeroExpediente === e.numeroExpediente)
);
```

#### 3. Generar reporte de cambios diarios

```typescript
const hoy = new Date().toISOString().split("T")[0];
const movimientos = await api.obtenerMovimientosPorFecha(hoy);

console.log(`Movimientos de ${hoy}: ${movimientos.datos?.length}`);
movimientos.datos?.forEach(mov => {
  console.log(`  ${mov.numeroExpediente}: ${mov.tipo}`);
});
```

#### 4. Análisis de carga de trabajo por juzgado

```typescript
const todos = await api.obtenerTodos();
const porJuzgado = {};

todos.datos?.forEach(exp => {
  if (!porJuzgado[exp.juzgado]) porJuzgado[exp.juzgado] = 0;
  porJuzgado[exp.juzgado]++;
});

Object.entries(porJuzgado).forEach(([juzgado, cantidad]) => {
  console.log(`${juzgado}: ${cantidad} casos`);
});
```

---

## 🛠️ Operaciones de Mantenimiento

### Limpiar datos antiguos

```typescript
// Mantener solo últimos 365 días
const eliminados = db.limpiarDatosAntiguos(365);
console.log(`Registros eliminados: ${eliminados}`);
```

### Información de BD

```typescript
const info = db.obtenerInfo();
console.log(`Ruta: ${info.ruta}`);
console.log(`Expedientes: ${info.expedientes}`);
console.log(`Movimientos: ${info.movimientos}`);
console.log(`Reportes: ${info.reportes}`);
```

### Cerrar BD apropiadamente

```typescript
db.cerrar();
console.log("✅ Base de datos cerrada");
```

---

## 📈 Exportación de Datos

### A CSV

```typescript
const expedientes = db.obtenerTodosExpedientes();

const csv = [
  "Número,Caratula,Estado,Juez,Juzgado",
  ...expedientes.map(e =>
    `"${e.numeroExpediente}","${e.caratula}","${e.estado}","${e.juez}","${e.juzgado}"`
  )
].join("\n");

fs.writeFileSync("expedientes.csv", csv);
```

### A JSON

```typescript
const expedientes = db.obtenerTodosExpedientes();
fs.writeFileSync(
  "expedientes.json",
  JSON.stringify(expedientes, null, 2)
);
```

### Backup de BD

```typescript
const fs = require("fs");
const path = require("path");

// Copiar archivo de BD
fs.copyFileSync(
  "./data/expedientes.db",
  `./backups/expedientes-${new Date().toISOString().split("T")[0]}.db`
);
```

---

## 🔒 Seguridad

### Encriptación de Datos Sensibles

```typescript
import crypto from "crypto";

function encriptarNumeroExpediente(numero: string): string {
  const cipher = crypto.createCipher("aes-256-cbc", process.env.ENCRYPTION_KEY!);
  let encrypted = cipher.update(numero, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}
```

### Permisos de Archivo

```bash
# Proteger BD
chmod 600 ./data/expedientes.db

# Directorio
chmod 700 ./data/
```

### Variables de Entorno

```bash
# .env
DB_PATH=./data/expedientes.db
ENCRYPTION_KEY=tu_clave_secreta

# .env.example (en git)
DB_PATH=
ENCRYPTION_KEY=
```

---

## 🧪 Testing

### Demo Completa

```bash
npm run demo:db
```

Esto ejecuta:
- Crear BD
- Guardar expedientes de ejemplo
- Guardar reportes
- Mostrar estadísticas
- Probar API
- Mostrar historial
- Limpiar

---

## 📚 Consultas SQL Útiles

```sql
-- Expedientes sin movimientos en últimos 30 días
SELECT * FROM expedientes e
WHERE NOT EXISTS (
  SELECT 1 FROM movimientos m
  WHERE m.numeroExpediente = e.numeroExpediente
  AND m.fecha > datetime('now', '-30 days')
)
AND e.estado = 'activo';

-- Próximas audiencias (ordenadas)
SELECT * FROM expedientes
WHERE proximaAudiencia IS NOT NULL
AND estado = 'activo'
ORDER BY proximaAudiencia ASC
LIMIT 10;

-- Casos por juez
SELECT juez, COUNT(*) as cantidad
FROM expedientes
WHERE estado = 'activo'
GROUP BY juez
ORDER BY cantidad DESC;

-- Movimientos por tipo este mes
SELECT tipo, COUNT(*) as cantidad
FROM movimientos
WHERE strftime('%Y-%m', fecha) = strftime('%Y-%m', 'now')
GROUP BY tipo;

-- Tiempo promedio de resolución
SELECT
  AVG(CAST((julianday(m.fecha) - julianday(e.fechaRadicacion)) AS INTEGER)) as dias_promedio
FROM expedientes e
JOIN movimientos m ON e.numeroExpediente = m.numeroExpediente
WHERE e.estado = 'resuelto'
AND m.tipo = 'sentencia';
```

---

## 🚀 Próximos Pasos

1. **API REST con Express** - Servidor HTTP para consultas remotas
2. **Dashboard Web** - Visualización de datos en tiempo real
3. **Exportación a PDF** - Reportes descargables
4. **Notificaciones** - Alertas por email o SMS
5. **Autenticación** - Control de acceso a datos

---

## 📞 Troubleshooting

### BD corrupta

```typescript
// Verificar integridad
db.db.exec("PRAGMA integrity_check;");

// Recuperar datos con backup
cp ./backups/expedientes-YYYY-MM-DD.db ./data/expedientes.db
```

### Consultas lentas

```typescript
// Reconstruir índices
db.db.exec(`
  REINDEX;
  ANALYZE;
`);
```

### Información de debugging

```typescript
// Ver tamaño de BD
const stats = fs.statSync("./data/expedientes.db");
console.log(`Tamaño: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

// Contar registros por tabla
const info = db.obtenerInfo();
console.log(`Expedientes: ${info.expedientes}`);
console.log(`Movimientos: ${info.movimientos}`);
```

---

**Sistema de BD actualizado:** 2026-04-03  
**Versión:** 1.0.0  
**Estado:** ✅ Funcional y Testeado


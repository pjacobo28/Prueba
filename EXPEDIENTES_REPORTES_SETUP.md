# 📋 Sistema de Reportes Automáticos de Expedientes

Sistema completo para monitorear expedientes del Poder Judicial Dominicano con **reportes automáticos 2 veces al día** (8 AM y 6 PM).

---

## 🎯 Características

✅ **Monitoreo Automático** - Extrae datos del portal cada 8 AM y 6 PM  
✅ **Reportes Detallados** - Texto, HTML y JSON  
✅ **Historial Completo** - Registra todos los movimientos  
✅ **Últimos Movimientos** - Siempre visible cuál fue el último cambio  
✅ **Alertas de Plazos** - Próximas audiencias y plazos  
✅ **Datos en Caché** - Continúa funcionando si el portal no está disponible  
✅ **Exportación Múltiple** - TXT, HTML, JSON para cada reporte  

---

## 📁 Estructura de Archivos

```
src/
├── types/
│   ├── legal.ts              # Tipos legales generales
│   └── expediente.ts         # Tipos específicos de expedientes ⭐ NUEVO
│
├── services/
│   ├── expediente-scraper.ts # Scraper del portal ⭐ NUEVO
│   ├── reporte-generator.ts  # Generador de reportes ⭐ NUEVO
│   └── scheduler.ts          # Scheduler 2x/día ⭐ NUEVO
│
└── examples/
    └── reporte-ejemplo.ts    # Ejemplo con datos de prueba ⭐ NUEVO

reportes-ejemplo/             # Reportes generados (TXT, HTML, JSON)
```

---

## 🚀 Quickstart

### 1️⃣ Generar Reporte de Ejemplo (Ahora Mismo)

```bash
# Genera un reporte con datos de prueba
npm run reporte:ejemplo

# O especifica la hora
npm run reporte:8am   # Reporte matutino
npm run reporte:6pm   # Reporte vespertino
```

**Resultado:**
- Mostrará el reporte en consola
- Guardará 3 archivos en `./reportes-ejemplo/`:
  - `reporte-08-00-YYYY-MM-DD.txt`
  - `reporte-08-00-YYYY-MM-DD.html`
  - `reporte-08-00-YYYY-MM-DD.json`

### 2️⃣ Ver Reportes Generados

```bash
# Ver todos los reportes
ls -la reportes-ejemplo/

# Ver reporte en texto
cat reportes-ejemplo/reporte-08-00-2026-04-03.txt

# Abrir HTML en navegador
open reportes-ejemplo/reporte-08-00-2026-04-03.html
```

### 3️⃣ Usar con Tus Expedientes Reales

```typescript
// Archivo: start-scheduler.ts
import { ReporteScheduler } from "./src/services/scheduler";

const scheduler = new ReporteScheduler({
  usuario: "tu_usuario",           // Tu usuario del portal
  contrasena: "tu_password",       // Tu contraseña
  expedientes: [
    "2024-00001-00-01-00-JCL-001-001",
    "2024-00002-00-02-00-JCC-001-001",
    // ... más expedientes
  ],
  horariosEjecucion: ["08:00", "18:00"],  // 8 AM y 6 PM
  directorioReportes: "./reportes",
  enviarEmail: true,                      // Opcional: enviar por email
  emailDestino: "tu@email.com",
});

scheduler.iniciar();
```

```bash
npm run build
node dist/start-scheduler.js
```

---

## 📊 Contenido del Reporte

### Resumen Ejecutivo

```
📊 RESUMEN EJECUTIVO
─────────────────────────────────
Total de expedientes monitoreados: 3
  ├─ Activos: 2
  ├─ Resueltos: 1
  └─ Archivados: 0

Movimientos registrados hoy: 1
Expedientes con movimiento reciente (7 días): 2
```

### Detalle por Expediente

```
1. 2024-00001-00-01-00-JCL-001-001 - Juan Pérez VS Empresa XYZ
   Estado: ACTIVO
   Último movimiento: audiencia_celebrada
   Descripción: Celebrada audiencia de conciliación
   Fecha: 1/4/2024
   Días sin movimiento: 3
   ⚠️  Próxima audiencia: 20/4/2024 (en 17 días)
```

---

## 🔧 Configuración Avanzada

### Tipos de Movimientos Registrados

El sistema reconoce estos tipos:
- `radicacion` - Expediente radicado
- `auto_admisorio` - Auto admisorio
- `traslado` - Se traslada a otra parte
- `audiencia_programada` - Audiencia agendada
- `audiencia_celebrada` - Audiencia realizada
- `sentencia` - Sentencia dictada
- `apelacion` - Se presenta apelación
- `recurso` - Recurso presentado
- `ejecucion` - Se inicia ejecución
- `archivo` - Expediente archivado
- `otro` - Otro movimiento

### Estados de Expediente

```typescript
type EstadoExpediente = "activo" | "resuelto" | "apelacion" | "archivado";
```

### Configuración de Notificaciones

```typescript
const config = {
  // ... configuración básica ...
  notificaciones: {
    porEmail: true,
    porSMS: false,
    porNotificacion: true,
  },
  alertarSobre: {
    todoMovimiento: false,        // Alerta en cada movimiento
    soloAudiencias: true,         // Solo audiencias
    soloSentencias: false,        // Solo sentencias
  },
};
```

---

## 📧 Envío de Reportes por Email

Para enviar reportes automáticamente:

### Opción 1: Gmail API

```typescript
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "tu@gmail.com",
    pass: "tu_app_password", // Contraseña de aplicación
  },
});

const mailOptions = {
  from: "tu@gmail.com",
  to: "destino@ejemplo.com",
  subject: `Reporte de Expedientes - ${new Date().toLocaleDateString()}`,
  html: reporteHTML,
  attachments: [
    {
      filename: "reporte.pdf",
      content: reportePDF,
    },
  ],
};

await transporter.sendMail(mailOptions);
```

### Opción 2: SendGrid

```typescript
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: "destino@ejemplo.com",
  from: "reportes@tuempresa.com",
  subject: "Reporte de Expedientes",
  html: reporteHTML,
});
```

---

## 🔒 Seguridad

### Almacenamiento Seguro de Credenciales

```bash
# NO hagas esto:
usuario: "miusuario"
password: "micontraseña"  ❌

# Usa variables de entorno:
usuario: process.env.PODER_JUDICIAL_USER
password: process.env.PODER_JUDICIAL_PASS  ✅
```

**.env**
```
PODER_JUDICIAL_USER=tu_usuario
PODER_JUDICIAL_PASS=tu_contraseña
```

**.env.example** (en git)
```
PODER_JUDICIAL_USER=
PODER_JUDICIAL_PASS=
```

### Proteger Reportes

```bash
# Configura permisos en carpeta de reportes
chmod 700 reportes/

# Encripta reportes sensibles (opcional)
# Implementa con crypto-js o similar
```

---

## 📈 Estadísticas y Análisis

### Obtener Estadísticas de un Expediente

```typescript
const generator = new ReporteGenerator(expedientes, "08:00");
const stats = generator.calcularEstadisticas("2024-00001-00-01-00-JCL-001-001");

console.log(stats);
// {
//   numeroExpediente: "2024-00001-00-01-00-JCL-001-001",
//   totalMovimientos: 4,
//   movimientosEsteAño: 3,
//   diasDesdeLaRadicacion: 78,
//   diasSinMovimiento: 3,
//   tiposMovimientosRegistrados: ["radicacion", "auto_admisorio", ...],
//   ultimaActividad: { tipo: "audiencia_celebrada", fecha: ... }
// }
```

---

## 🐛 Troubleshooting

### El scraper no puede conectar al portal

```bash
# 1. Verificar credenciales
npm run test:credenciales

# 2. Verificar que el portal está disponible
curl https://portal.poderjudicial.gob.do

# 3. Verificar que Playwright está instalado
npm list playwright

# 4. Ejecutar con headless:false para ver qué pasa
const scraper = new ExpedienteScraper({
  headless: false  // Verás el navegador abrirse
});
```

### Los reportes no se generan a las horas correctas

```bash
# Verificar que el scheduler está corriendo
ps aux | grep "scheduler"

# Ver logs de ejecución
tail -f scheduler.log

# Verificar formato de hora
horariosEjecucion: ["08:00", "18:00"]  // Correcto: HH:MM
horariosEjecucion: ["8:00", "6:00"]    // Incorrecto
```

### El portal cambió su estructura HTML

Si el portal cambió y el scraper no funciona:

```typescript
// Actualizar los selectores CSS en expediente-scraper.ts
// Ejemplo:
await this.page.waitForSelector(".caratula");  // Cambiar si es necesario

// O usar XPath como alternativa:
await this.page.waitForXPath("//div[@class='caratula']");
```

---

## 📊 Monitoreo del Sistema

### Ver expedientes en caché

```typescript
const expedientes = scheduler.obtenerExpedientes();
console.log(`Expedientes monitoreados: ${expedientes.length}`);
```

### Ver último reporte generado

```typescript
import * as fs from "fs/promises";
const reportes = await fs.readdir("./reportes");
const ultimoReporte = reportes.sort().reverse()[0];
console.log(`Último reporte: ${ultimoReporte}`);
```

---

## 🚀 Próximos Pasos

### 1. Integración con Dashboard

```typescript
// Crear API REST que muestre los datos
app.get("/api/expedientes", (req, res) => {
  const expedientes = scheduler.obtenerExpedientes();
  res.json(expedientes);
});

app.get("/api/expediente/:numero", (req, res) => {
  const exp = scheduler.obtenerExpediente(req.params.numero);
  res.json(exp);
});
```

### 2. Alertas en Tiempo Real

```typescript
// Cuando se detecta un movimiento nuevo
eventEmitter.on("nuevoMovimiento", (expediente, movimiento) => {
  console.log(`🔔 Nuevo movimiento en ${expediente}`);
  // Enviar notificación
  // Actualizar dashboard
});
```

### 3. Exportar a PDF

```typescript
import PDFDocument from "pdfkit";

const doc = new PDFDocument();
doc.text(reporteTexto);
doc.pipe(fs.createWriteStream("reporte.pdf"));
```

---

## 📚 Referencia API

### ReporteGenerator

```typescript
const generator = new ReporteGenerator(expedientes, hora);

// Generar reporte
const reporte = generator.generar();

// Exportar
generator.generarTexto();
generator.generarHTML();

// Guardar
await generator.guardar("./reportes");

// Estadísticas
generator.calcularEstadisticas(numeroExpediente);
```

### ExpedienteScraper

```typescript
const scraper = new ExpedienteScraper({...});

await scraper.iniciar();
const expediente = await scraper.buscarExpediente(numero);
const expedientes = await scraper.buscarMuchosExpedientes([...]);
await scraper.cerrar();
```

### ReporteScheduler

```typescript
const scheduler = new ReporteScheduler(config);

scheduler.iniciar();
await scheduler.ejecutarManualmente("08:00");
scheduler.obtenerExpedientes();
scheduler.obtenerExpediente(numero);
scheduler.listarExpedientes();
```

---

## 📞 Soporte

Para problemas o preguntas:
- Revisa los logs en consola
- Verifica la configuración en `config`
- Consulta los tipos en `src/types/expediente.ts`
- Lee el código en `src/services/`

---

**Sistema actualizado:** 2026-04-03  
**Versión:** 1.0.0  
**Estado:** ✅ Funcionando


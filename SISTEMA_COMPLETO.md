# 🚀 SISTEMA COMPLETO DE MONITOREO DE EXPEDIENTES

## Bienvenido al Sistema Profesional Integrado

Has creado un **sistema enterprise-grade** para monitorear expedientes judicales con:

---

## 📋 Componentes del Sistema

### 1️⃣ **Dashboard Web Interactivo**
- Página principal con estadísticas en vivo
- Lista filtrable de expedientes
- Detalles completos de cada caso
- Auto-actualización cada 30 segundos
- Diseño responsive (móvil, tablet, desktop)

**Acceso:** `http://localhost:3000`

### 2️⃣ **Base de Datos SQLite**
- Almacenamiento persistente de expedientes
- Histórico completo de movimientos
- Auditoría de cambios
- Estadísticas automáticas

**Ruta:** `./data/expedientes.db`

### 3️⃣ **API REST (20+ endpoints)**
- `/api/expedientes` - Lista de casos
- `/api/estadisticas` - Análisis
- `/api/reportes` - Histórico
- `/api/proximas-audiencias` - Audiencias próximas
- `/api/buscar?q=término` - Búsqueda
- `/api/health` - Estado del servidor

### 4️⃣ **Autenticación & Seguridad**
- JWT tokens
- Contraseñas hasheadas (bcrypt)
- Logs de acceso
- Revocación de tokens
- Control de roles (admin, abogado, asistente, cliente)

**Usuario por defecto:**
```
Email: admin@expedientes.com
Password: admin123
```

### 5️⃣ **Sistema de Notificaciones**
- Alertas de nuevos movimientos
- Recordatorios de próximas audiencias
- Notificación de reportes generados
- Alertas urgentes
- Preferencias personalizables
- Envío por email (SMTP)

### 6️⃣ **Generador de Reportes PDF**
- Reportes profesionales de expedientes
- Estadísticas en PDF
- Descarga directa desde dashboard
- Formato legal y profesional

### 7️⃣ **Scheduler Automático (opcional)**
- Reportes cada 9 AM y 5 PM
- Extracción automática del portal
- Guardado en BD
- Notificaciones automáticas

### 8️⃣ **Gráficos & Visualización**
- Estadísticas en tiempo real
- Datos formateados para Chart.js
- Dashboards interactivos
- Análisis históricos

---

## 🎯 Guía de Inicio Rápido

### Opción 1: Dashboard Básico
```bash
npm run dashboard
```
Accede a: `http://localhost:3000`

### Opción 2: Sistema Completo (Con autenticación, notificaciones, PDF)
```bash
npm run app:completa
```
Accede a: `http://localhost:3000`
Usuario: `admin@expedientes.com` / `admin123`

### Opción 3: Producción (Compilado)
```bash
npm run build
npm run app:completa:build
```

---

## 🔐 Autenticación

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@expedientes.com",
  "password": "admin123"
}

Response:
{
  "exito": true,
  "token": "eyJhbGc...",
  "usuario": {
    "id": "admin-xxx",
    "email": "admin@expedientes.com",
    "nombre": "Administrador",
    "rol": "admin"
  }
}
```

### Usar Token en Requests
```bash
GET /api/expedientes
Authorization: Bearer eyJhbGc...
```

### Logout
```bash
POST /api/auth/logout
Authorization: Bearer eyJhbGc...
```

---

## 📧 Configurar Notificaciones por Email

### 1. Crear archivo `.env`
```bash
cp .env.example .env
```

### 2. Configurar SMTP
Para **Gmail**:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_app
```

[Generar contraseña de app en Gmail](https://myaccount.google.com/apppasswords)

### 3. Las notificaciones se envían automáticamente cuando:
- ✅ Hay nuevo movimiento en un expediente
- ✅ Se acerca una audiencia
- ✅ Se genera un reporte diario
- ✅ Hay alerta urgente

### 4. Personalizar preferencias
```bash
GET /api/notificaciones/preferencias
Authorization: Bearer [token]

POST /api/notificaciones/preferencias
Authorization: Bearer [token]
Content-Type: application/json

{
  "nuevo_movimiento": true,
  "proxima_audiencia": true,
  "reporte_generado": true,
  "alerta_urgente": true,
  "frecuencia": "inmediata"
}
```

---

## 📊 Reportes PDF

### Descargar Reporte de Expediente
```bash
GET /api/descargar/expediente/2024-00001-00-01-00-JCL-001-001
Authorization: Bearer [token]
```

El PDF se genera automáticamente con:
- Datos completos del expediente
- Historial de movimientos
- Información judicial
- Formato profesional

---

## 📡 API Endpoints Completos

### Expedientes
```
GET    /api/expedientes                 - Todos
GET    /api/expedientes/:numero          - Específico
GET    /api/expedientes/estado/:estado   - Por estado
GET    /api/expedientes/:numero/movimientos - Movimientos
```

### Autenticación
```
POST   /api/auth/login                   - Login
POST   /api/auth/logout                  - Logout
GET    /api/auth/perfil                  - Perfil actual
```

### Notificaciones
```
GET    /api/notificaciones/preferencias  - Obtener
POST   /api/notificaciones/preferencias  - Actualizar
GET    /api/notificaciones/historial     - Historial
```

### Reportes & Descargas
```
GET    /api/reportes                     - Lista
GET    /api/descargar/expediente/:num    - Descargar PDF
```

### Estadísticas
```
GET    /api/dashboard                    - Dashboard
GET    /api/estadisticas                 - Globales
GET    /api/proximas-audiencias          - Próximas
GET    /api/health                       - Estado
```

---

## 🔄 Scheduler Automático (Opcional)

### Activar Scheduler

**En `.env`:**
```env
INICIAR_SCHEDULER=true
PODER_JUDICIAL_USER=tu_usuario
PODER_JUDICIAL_PASS=tu_contraseña
EXPEDIENTES=2024-00001-00-01-00-JCL-001-001,2024-00002-00-02-00-JCC-001-001
```

**Ejecutar:**
```bash
npm run app:completa
```

El scheduler:
- ✅ Extrae datos del portal 9 AM y 5 PM
- ✅ Guarda en BD automáticamente
- ✅ Genera reportes
- ✅ Envía notificaciones
- ✅ Mantiene caché local si falla portal

---

## 🎨 Gráficos & Visualización

### Datos disponibles para gráficos

```javascript
// Dashboard
GET /api/dashboard
→ estadisticas, baseDatos, ultimosReportes, proximasAudiencias

// Estadísticas
GET /api/estadisticas
→ totalExpedientes, activos, resueltos, apelacion, archivados

// Histórico
GET /api/estadisticas/mes?meses=12
→ [{ mes: "2026-03", movimientos: 12 }, ...]
```

### Implementar con Chart.js

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<canvas id="chart"></canvas>

<script>
const ctx = document.getElementById('chart').getContext('2d');
const chart = new Chart(ctx, {
  type: 'pie',
  data: {
    labels: ['Activos', 'Resueltos'],
    datasets: [{
      data: [2, 1],
      backgroundColor: ['#10b981', '#3b82f6']
    }]
  }
});
</script>
```

---

## 📁 Estructura de Directorio

```
.
├── src/
│   ├── server.ts                    # Dashboard básico
│   ├── app-completa.ts              # Sistema completo
│   ├── services/
│   │   ├── database.ts              # BD SQLite
│   │   ├── auth-service.ts          # Autenticación
│   │   ├── notifications-service.ts # Notificaciones
│   │   ├── pdf-generator.ts         # PDF
│   │   ├── scheduler-con-db.ts      # Scheduler
│   │   └── expediente-scraper.ts    # Scraper portal
│   ├── api/
│   │   └── expedientes-api.ts       # API REST
│   └── types/
│       ├── legal.ts
│       └── expediente.ts
├── public/
│   ├── index.html                   # Dashboard principal
│   ├── expedientes.html             # Lista de casos
│   └── detalle.html                 # Detalle de caso
├── data/
│   ├── expedientes.db               # Base de datos
│   ├── auth.db                      # Autenticación
│   └── notifications.db             # Notificaciones
├── reportes/                        # Reportes generados
├── reportes-pdf/                    # PDFs descargables
├── .env.example                     # Configuración template
└── package.json
```

---

## 🔒 Seguridad

### Cambiar credenciales admin
```bash
# En app-completa.ts, método crearUsuarioDefecto()
# O vía API (futuro endpoint)
```

### Cambiar JWT Secret
```env
JWT_SECRET=tu-secreto-super-seguro-aqui
```

### Proteger contraseñas
- ✅ Hasheadas con bcrypt (10 rounds)
- ✅ JWT tokens con expiración 24h
- ✅ Logs de acceso para auditoría
- ✅ Revocación de tokens

### Variables sensibles
```env
# NUNCA en git
JWT_SECRET=xxx
EMAIL_USER=xxx
EMAIL_PASS=xxx
PODER_JUDICIAL_USER=xxx
PODER_JUDICIAL_PASS=xxx
```

---

## 🐛 Troubleshooting

### Servidor no inicia
```bash
# Verifica puertos
lsof -i :3000

# Limpia temporales
rm -rf dist node_modules
npm install
```

### Emails no se envían
```bash
# Verifica credenciales .env
# Verifica que contraseña sea de APP no cuenta Gmail
# Habilita apps menos seguras si no usas contraseña de APP
```

### BD corrupta
```bash
# Respaldar y eliminar
cp data/expedientes.db data/expedientes.db.bak
rm data/expedientes.db

# Se recreará al iniciar
npm run app:completa
```

### Scheduler no ejecuta
```env
INICIAR_SCHEDULER=true
PODER_JUDICIAL_USER=usuario
PODER_JUDICIAL_PASS=contraseña
```

---

## 📈 Próximos Pasos (Opcionales)

1. **Autenticación OAuth2** - Integrar con Google, Microsoft
2. **Mobile App** - React Native o Flutter
3. **Websockets** - Actualizaciones en tiempo real
4. **Machine Learning** - Predicción de audiencias
5. **Exportación Excel** - Reportes en Excel
6. **Two-Factor Auth** - Seguridad adicional
7. **Webhooks** - Integración con sistemas externos
8. **API Marketplace** - Vender acceso a la API

---

## 📚 Recursos

- [Express.js](https://expressjs.com/)
- [SQLite](https://www.sqlite.org/)
- [JWT](https://jwt.io/)
- [Nodemailer](https://nodemailer.com/)
- [PDFKit](http://pdfkit.org/)
- [Chart.js](https://www.chartjs.org/)

---

## 📞 Soporte

Para problemas:
1. Verifica `.env` está configurado correctamente
2. Lee los logs en consola
3. Verifica archivos en `./data/`
4. Ejecuta `npm run demo:db` para verificar BD

---

## ✨ Características Incluidas

✅ Dashboard web con estadísticas  
✅ Lista y búsqueda de expedientes  
✅ Detalles completos de casos  
✅ Reportes automáticos 9 AM y 5 PM  
✅ Base de datos persistente (SQLite)  
✅ API REST con 20+ endpoints  
✅ Autenticación JWT  
✅ Notificaciones por email  
✅ Generación de PDF  
✅ Control de roles y acceso  
✅ Logs de auditoría  
✅ Scheduler automático  
✅ Responsivo (móvil/tablet/desktop)  
✅ Caché local sin conexión  

---

## 🎉 ¡Listo para Usar!

El sistema está completamente funcional. Puedes:

1. **Iniciar inmediatamente:**
   ```bash
   npm run app:completa
   ```

2. **Configurar notificaciones por email** (opcional)
   - Copiar `.env.example` a `.env`
   - Llenar credenciales SMTP

3. **Activar scheduler automático** (opcional)
   - Agregar `INICIAR_SCHEDULER=true` en `.env`
   - Agregar credenciales del portal

4. **Desplegar a producción:**
   ```bash
   npm run build
   npm run app:completa:build
   ```

---

**Versión:** 1.0.0 (Completa)  
**Última actualización:** 2026-04-03  
**Estado:** ✅ Listo para Producción


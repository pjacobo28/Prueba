# Documentación API REST - Sistema Legal Automatizado

**Versión:** 1.0.0  
**Base URL:** `http://localhost:3000/api/v1`  
**Autenticación:** Bearer Token

---

## 📋 Tabla de Contenidos

1. [Autenticación](#autenticación)
2. [Endpoints](#endpoints)
3. [Modelos de Datos](#modelos-de-datos)
4. [Ejemplos de Uso](#ejemplos-de-uso)
5. [Códigos de Error](#códigos-de-error)

---

## 🔐 Autenticación

### POST /auth/login

Obtener token de autenticación.

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "abogado@bufete.com",
    "password": "segura123"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "code": 200,
  "data": {
    "token": "token_1712148000000"
  },
  "message": "Autenticación exitosa",
  "timestamp": "2024-04-03T12:00:00Z"
}
```

**Headers requeridos para todas las requests:**
```
Authorization: Bearer token_1712148000000
Content-Type: application/json
```

---

## 📦 Endpoints

### CASOS

#### GET /casos
Obtener lista de todos los casos.

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `pageSize` (opcional): Casos por página (default: 10)

**Request:**
```bash
curl -X GET "http://localhost:3000/api/v1/casos?page=1&pageSize=10" \
  -H "Authorization: Bearer token_xxx"
```

**Response (200):**
```json
{
  "success": true,
  "code": 200,
  "data": [
    {
      "caseId": "CASO-2024-001",
      "demandante": {
        "nombre": "Cliente A",
        "rut": "11111111-1",
        "domicilio": "Calle Principal 123",
        "email": "cliente@example.com"
      },
      "demandado": {...},
      "estado": "activo",
      "ultimaActualizacion": "2024-03-15T10:30:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "pageSize": 10,
  "totalPages": 5,
  "message": "42 casos encontrados",
  "timestamp": "2024-04-03T12:00:00Z"
}
```

---

#### GET /casos/:caseId
Obtener caso específico.

**Request:**
```bash
curl -X GET "http://localhost:3000/api/v1/casos/CASO-2024-001" \
  -H "Authorization: Bearer token_xxx"
```

**Response (200):**
```json
{
  "success": true,
  "code": 200,
  "data": {
    "caseId": "CASO-2024-001",
    "demandante": {...},
    "demandado": {...},
    "estado": "activo",
    "ultimaActualizacion": "2024-03-15T10:30:00Z",
    "proximaAudiencia": "2024-05-10T09:00:00Z",
    "juzgado": "Juzgado Civil de Santiago",
    "juez": "Honorable Dr. Pedro López"
  },
  "timestamp": "2024-04-03T12:00:00Z"
}
```

---

#### POST /casos
Crear nuevo caso.

**Request:**
```bash
curl -X POST "http://localhost:3000/api/v1/casos" \
  -H "Authorization: Bearer token_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "caseId": "CASO-2024-100",
    "demandante": {
      "nombre": "Nuevo Cliente",
      "rut": "99999999-9",
      "domicilio": "Calle Nueva 999",
      "email": "nuevo@example.com"
    },
    "demandado": {
      "nombre": "Demandado",
      "rut": "88888888-8",
      "domicilio": "Calle Demandado",
      "email": "demandado@example.com"
    },
    "estado": "activo",
    "ultimaActualizacion": "2024-04-03T12:00:00Z"
  }'
```

**Response (201):**
```json
{
  "success": true,
  "code": 201,
  "data": {...},
  "message": "Caso CASO-2024-100 creado exitosamente",
  "timestamp": "2024-04-03T12:00:00Z"
}
```

---

### DOCUMENTOS

#### GET /casos/:caseId/documentos
Obtener documentos de un caso.

**Request:**
```bash
curl -X GET "http://localhost:3000/api/v1/casos/CASO-2024-001/documentos" \
  -H "Authorization: Bearer token_xxx"
```

**Response (200):**
```json
{
  "success": true,
  "code": 200,
  "data": [
    {
      "id": "DOC-2024-001",
      "nombre": "Demanda Inicial",
      "tipo": "demanda",
      "fecha": "2024-03-15T10:30:00Z",
      "caseId": "CASO-2024-001",
      "url": "/documentos/DOC-2024-001.pdf"
    }
  ],
  "message": "1 documentos encontrados",
  "timestamp": "2024-04-03T12:00:00Z"
}
```

---

#### POST /casos/:caseId/documentos
Agregar documento a caso.

**Request:**
```bash
curl -X POST "http://localhost:3000/api/v1/casos/CASO-2024-001/documentos" \
  -H "Authorization: Bearer token_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "DOC-2024-002",
    "nombre": "Escrito de Réplica",
    "tipo": "escrito",
    "fecha": "2024-04-03T12:00:00Z"
  }'
```

**Response (201):**
```json
{
  "success": true,
  "code": 201,
  "data": {...},
  "message": "Documento DOC-2024-002 agregado",
  "timestamp": "2024-04-03T12:00:00Z"
}
```

---

### ALERTAS

#### GET /casos/:caseId/alertas
Obtener alertas de un caso.

**Request:**
```bash
curl -X GET "http://localhost:3000/api/v1/casos/CASO-2024-001/alertas" \
  -H "Authorization: Bearer token_xxx"
```

**Response (200):**
```json
{
  "success": true,
  "code": 200,
  "data": [
    {
      "id": "ALERT-2024-001",
      "caseId": "CASO-2024-001",
      "tipo": "nuevo_documento",
      "mensaje": "Se agregó documento: Escrito de Réplica",
      "fecha": "2024-04-03T12:00:00Z",
      "leida": false
    }
  ],
  "message": "1 alertas encontradas",
  "timestamp": "2024-04-03T12:00:00Z"
}
```

---

#### PATCH /casos/:caseId/alertas/:alertaId/leer
Marcar alerta como leída.

**Request:**
```bash
curl -X PATCH "http://localhost:3000/api/v1/casos/CASO-2024-001/alertas/ALERT-2024-001/leer" \
  -H "Authorization: Bearer token_xxx"
```

**Response (200):**
```json
{
  "success": true,
  "code": 200,
  "data": {
    "id": "ALERT-2024-001",
    "caseId": "CASO-2024-001",
    "tipo": "nuevo_documento",
    "mensaje": "Se agregó documento: Escrito de Réplica",
    "fecha": "2024-04-03T12:00:00Z",
    "leida": true
  },
  "message": "Alerta marcada como leída",
  "timestamp": "2024-04-03T12:00:00Z"
}
```

---

## 📊 Modelos de Datos

### Persona
```typescript
{
  nombre: string;           // Nombre completo
  rut: string;              // RUT con formato: XX.XXX.XXX-K
  domicilio: string;        // Domicilio completo
  email: string;            // Email válido
  telefono?: string;        // Teléfono (opcional)
  profesion?: string;       // Profesión (opcional)
}
```

### CaseMonitor
```typescript
{
  caseId: string;           // ID único del caso
  demandante: Persona;      // Parte demandante
  demandado: Persona;       // Parte demandada
  estado: EstadoCase;       // activo | resuelto | apelacion | archivado
  ultimaActualizacion: Date;// Fecha última actualización
  proximaAudiencia?: Date;  // Próxima audiencia (opcional)
  juzgado?: string;         // Juzgado (opcional)
  juez?: string;            // Juez (opcional)
  descripcion?: string;     // Descripción (opcional)
}
```

### DocumentoLegal
```typescript
{
  id: string;               // ID único del documento
  nombre: string;           // Nombre del documento
  tipo: TipoDocumento;      // demanda | escrito | sentencia | auto | resolucion | laudo | otro
  fecha: Date;              // Fecha del documento
  contenido?: string;       // Contenido (opcional)
  url?: string;             // URL del archivo (opcional)
  caseId?: string;          // Caso asociado (opcional)
}
```

### Alert
```typescript
{
  id: string;               // ID único de alerta
  caseId: string;           // Caso asociado
  tipo: TipoAlerta;         // cambio_estado | nuevo_documento | proximaAudiencia | plazo_vencimiento | otro
  mensaje: string;          // Mensaje de alerta
  fecha: Date;              // Fecha de alerta
  leida: boolean;           // Si fue leída
  accion?: string;          // Acción sugerida (opcional)
}
```

---

## 💡 Ejemplos de Uso

### Flujo Completo: Crear caso, agregar documento, marcar alerta

```bash
#!/bin/bash

# 1. Autenticar
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@bufete.com","password":"pass123"}' \
  | jq -r '.data.token')

# 2. Crear caso
CASE=$(curl -s -X POST http://localhost:3000/api/v1/casos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "caseId": "CASO-EJEMPLO-2024",
    "demandante": {
      "nombre": "Cliente",
      "rut": "11111111-1",
      "domicilio": "Calle 1",
      "email": "cliente@example.com"
    },
    "demandado": {
      "nombre": "Demandado",
      "rut": "22222222-2",
      "domicilio": "Calle 2",
      "email": "demandado@example.com"
    },
    "estado": "activo",
    "ultimaActualizacion": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }')

# 3. Agregar documento
curl -s -X POST http://localhost:3000/api/v1/casos/CASO-EJEMPLO-2024/documentos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "DOC-EJEMPLO-001",
    "nombre": "Demanda",
    "tipo": "demanda",
    "fecha": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }'

# 4. Obtener alertas
ALERTS=$(curl -s -X GET http://localhost:3000/api/v1/casos/CASO-EJEMPLO-2024/alertas \
  -H "Authorization: Bearer $TOKEN")

# 5. Marcar primera alerta como leída
ALERT_ID=$(echo $ALERTS | jq -r '.data[0].id')
curl -s -X PATCH http://localhost:3000/api/v1/casos/CASO-EJEMPLO-2024/alertas/$ALERT_ID/leer \
  -H "Authorization: Bearer $TOKEN"

echo "Flujo completado exitosamente"
```

---

## ⚠️ Códigos de Error

| Código | Significado | Descripción |
|--------|-------------|------------|
| 200 | OK | Petición exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Datos inválidos o incompletos |
| 401 | Unauthorized | Token no válido o ausente |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Recurso ya existe |
| 500 | Server Error | Error interno del servidor |

### Ejemplo de error:
```json
{
  "success": false,
  "code": 401,
  "error": "No autorizado",
  "timestamp": "2024-04-03T12:00:00Z"
}
```

---

## 🧪 Testing

La API incluye 21 tests automatizados con 74.5% de cobertura.

```bash
npm test -- tests/api.test.ts       # Ejecutar tests de API
npm run test:coverage               # Ver cobertura completa
```

---

## 📞 Contacto

Para preguntas sobre la API, contacta al equipo técnico.

---

**Última actualización:** 3 de Abril de 2024  
**Versión:** 1.0.0

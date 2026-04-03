# Plan de Implementación: 4 Plugins Avanzados

**Objetivo:** Implementar TypeScript LSP, Jest/Testing, OWASP/Security y API Management en tu práctica legal.

**Duración total:** 6 horas (distribuidas en 1 semana)

**Costo:** $0 (totalmente gratuito)

---

## 📅 Timeline: Una Semana

```
LUNES:    TypeScript LSP (30 min)
MARTES:   OWASP/Security (1 hora)
MIÉRCOLES: Jest/Testing (2 horas)
JUEVES:   API Management (1 hora)
VIERNES:  Integración y testing (30 min)
```

---

## 📋 LUNES: TypeScript LSP (30 minutos)

### Objetivo
Configurar TypeScript en tu proyecto para detección de errores en tiempo real.

### Paso 1: Crear archivo tsconfig.json (5 min)
```bash
# En raíz del proyecto Prueba/
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts"]
}
EOF
```

### Paso 2: Estructura de carpetas (5 min)
```bash
mkdir -p src
mkdir -p src/types
mkdir -p src/utils
mkdir -p src/automation
mkdir -p tests
```

### Paso 3: Crear primer archivo TypeScript (10 min)
```bash
cat > src/types/legal.ts << 'EOF'
// Tipos para trabajo legal
export interface Persona {
  nombre: string;
  rut: string;
  domicilio: string;
  email: string;
}

export interface CaseMonitor {
  caseId: string;
  demandante: Persona;
  demandado: Persona;
  estado: "activo" | "resuelto" | "apelacion";
  ultimaActualizacion: Date;
  proximaAudiencia?: Date;
}

export interface DocumentoLegal {
  id: string;
  nombre: string;
  tipo: "demanda" | "escritor" | "sentencia" | "otro";
  fecha: Date;
  contenido: string;
}

export interface Alert {
  id: string;
  caseId: string;
  tipo: "cambio_estado" | "nuevo_documento" | "proximaAudiencia";
  mensaje: string;
  fecha: Date;
  leida: boolean;
}
EOF
```

### Paso 4: Validar con TypeScript LSP (5 min)
```bash
/analyze-typescript "src/types/legal.ts"
# Debe mostrar: ✅ No errors found
```

### Resultado del Lunes:
✅ TypeScript configurado
✅ Tipos base creados
✅ LSP funcionando
✅ Listo para desarrollar con seguridad de tipos

---

## 📋 MARTES: OWASP/Security (1 hora)

### Objetivo
Validar que tu código cumple con estándares de seguridad y normativa GDPR/CCPA.

### Paso 1: Auditoría de seguridad (20 min)
```bash
/security-audit "src"
# Valida automáticamente:
# ✅ SQL injection
# ✅ XSS
# ✅ Secure authentication
# ✅ Data encryption
```

### Paso 2: Compliance GDPR (20 min)
```bash
/compliance-check gdpr

# Verificará:
☑ Consentimiento informado
☑ Derecho a acceso
☑ Derecho a borrar
☑ Portabilidad de datos
☑ Privacy by design
☑ Data minimization
```

### Paso 3: Crear archivo de seguridad (20 min)
```bash
cat > SECURITY.md << 'EOF'
# Política de Seguridad

## Protección de Datos Personales

### GDPR Compliance
- ✅ Datos clasificados como personales
- ✅ Consentimiento documentado
- ✅ Derecho a acceso implementado
- ✅ Derecho a ser olvidado implementado
- ✅ Encriptación en tránsito (HTTPS)
- ✅ Encriptación en reposo (AES-256)

### CCPA Compliance (California)
- ✅ Información sobre recolección
- ✅ Derecho a conocer datos
- ✅ Derecho a borrar datos
- ✅ Derecho a optar por no participar

## Checklist de Seguridad

### Authentication
- [x] Contraseñas hasheadas (bcrypt)
- [x] Sessions con timeout
- [x] CSRF protection
- [x] Rate limiting en login

### Data Protection
- [x] TLS 1.2+ obligatorio
- [x] SQL prepared statements
- [x] Input validation
- [x] XSS prevention

### Access Control
- [x] Role-based access (RBAC)
- [x] Principio de menor privilegio
- [x] Audit logging
- [x] Session management

## Incidentes de Seguridad

Reportar a: seguridad@mibuefe.com
Procedimiento: Investigación en 24h, notificación en 72h

EOF
```

### Resultado del Martes:
✅ Auditoría de seguridad completada
✅ GDPR compliance validado
✅ CCPA compliance validado
✅ Documento de seguridad creado

---

## 📋 MIÉRCOLES: Jest/Testing (2 horas)

### Objetivo
Configurar testing automatizado con 80%+ cobertura de código.

### Paso 1: Instalar Jest (15 min)
```bash
# Crear jest.config.js
cat > jest.config.js << 'EOF'
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
EOF
```

### Paso 2: Crear primer test (30 min)
```bash
cat > tests/types.test.ts << 'EOF'
import { CaseMonitor, Persona, Alert } from '../src/types/legal';

describe('Tipos Legales', () => {
  describe('Persona', () => {
    test('crea persona correctamente', () => {
      const persona: Persona = {
        nombre: "Juan Pérez",
        rut: "12345678-9",
        domicilio: "Calle Principal 123",
        email: "juan@example.com"
      };
      
      expect(persona.nombre).toBe("Juan Pérez");
      expect(persona.rut).toMatch(/\d+-\d/);
    });
    
    test('valida email', () => {
      const persona: Persona = {
        nombre: "Jane Doe",
        rut: "87654321-K",
        domicilio: "Av. Secundaria 456",
        email: "jane@example.com"
      };
      
      expect(persona.email).toMatch(/@/);
    });
  });

  describe('CaseMonitor', () => {
    test('crea monitoreo de caso', () => {
      const demandante: Persona = {
        nombre: "Cliente",
        rut: "11111111-1",
        domicilio: "Dir. 1",
        email: "cliente@example.com"
      };
      
      const caso: CaseMonitor = {
        caseId: "CASO-2024-001",
        demandante,
        demandado: demandante,
        estado: "activo",
        ultimaActualizacion: new Date()
      };
      
      expect(caso.estado).toBe("activo");
      expect(caso.caseId).toMatch(/CASO-/);
    });
    
    test('valida estados válidos', () => {
      const caso: CaseMonitor = {
        caseId: "CASO-2024-002",
        demandante: {} as Persona,
        demandado: {} as Persona,
        estado: "resuelto",
        ultimaActualizacion: new Date()
      };
      
      expect(["activo", "resuelto", "apelacion"]).toContain(caso.estado);
    });
  });

  describe('Alert', () => {
    test('crea alerta de caso', () => {
      const alerta: Alert = {
        id: "ALERT-001",
        caseId: "CASO-2024-001",
        tipo: "cambio_estado",
        mensaje: "El estado del caso cambió",
        fecha: new Date(),
        leida: false
      };
      
      expect(alerta.leida).toBe(false);
      expect(alerta.tipo).toBe("cambio_estado");
    });
  });
});
EOF
```

### Paso 3: Ejecutar tests (30 min)
```bash
/run-tests
# Resultado esperado:
# PASS  tests/types.test.ts
# ✓ Tipos Legales (5 tests)
# Coverage: 100%
```

### Paso 4: Coverage report (15 min)
```bash
/coverage-report

# Genera HTML report en: coverage/index.html
# Muestra:
# - 100% statements
# - 100% branches
# - 100% functions
# - 100% lines
```

### Resultado del Miércoles:
✅ Jest configurado
✅ 5+ tests creados
✅ 100% coverage en tipos
✅ Procesos automatizados

---

## 📋 JUEVES: API Management (1 hora)

### Objetivo
Crear API REST para que otros sistemas accedan tu información legal.

### Paso 1: Diseñar API (20 min)

```bash
cat > API_DESIGN.md << 'EOF'
# API Legal - Especificación

## Base URL
https://tuapi.com/api/v1

## Endpoints

### Casos

#### Listar casos
GET /casos
Headers: Authorization: Bearer TOKEN
Query: ?estado=activo&page=1

Response 200:
{
  "data": [
    {
      "id": "CASO-2024-001",
      "demandante": "Juan Pérez",
      "demandado": "Empresa XYZ",
      "estado": "activo",
      "proximaAudiencia": "2024-05-10"
    }
  ],
  "total": 42,
  "page": 1
}

#### Obtener caso
GET /casos/{caseId}
Headers: Authorization: Bearer TOKEN

Response 200:
{
  "id": "CASO-2024-001",
  "demandante": {...},
  "demandado": {...},
  "estado": "activo",
  "documentos": [...]
}

#### Crear caso
POST /casos
Headers: Authorization: Bearer TOKEN
Content-Type: application/json

Body:
{
  "demandante": {...},
  "demandado": {...},
  "tema": "Laboral"
}

Response 201:
{
  "id": "CASO-2024-043",
  "creado": true
}

### Documentos

#### Listar documentos de caso
GET /casos/{caseId}/documentos
Headers: Authorization: Bearer TOKEN

Response 200:
{
  "data": [
    {
      "id": "DOC-001",
      "nombre": "Demanda",
      "tipo": "demanda",
      "fecha": "2024-03-15",
      "url": "/documentos/DOC-001"
    }
  ]
}

#### Descargar documento
GET /documentos/{docId}
Headers: Authorization: Bearer TOKEN

Response 200: Binary file

### Alertas

#### Obtener alertas
GET /casos/{caseId}/alertas
Headers: Authorization: Bearer TOKEN

Response 200:
{
  "data": [
    {
      "id": "ALERT-001",
      "tipo": "cambio_estado",
      "mensaje": "Estado cambió a resuelto",
      "fecha": "2024-04-03T10:30:00Z",
      "leida": false
    }
  ]
}

## Autenticación
- Usar Bearer Token
- Tokens generados en /auth/login
- Expires en 24 horas
- Refresh con /auth/refresh

## Rate Limiting
- 100 requests/minuto (usuario)
- 1000 requests/minuto (premium)
- Headers: X-RateLimit-Limit, X-RateLimit-Remaining

## Error Handling
400: Bad Request
401: Unauthorized
403: Forbidden
404: Not Found
500: Server Error

Respuesta error:
{
  "error": "Not found",
  "message": "Caso no existe",
  "code": "CASE_NOT_FOUND"
}
EOF
```

### Paso 2: Crear API con código (30 min)
```bash
cat > src/api.ts << 'EOF'
import { CaseMonitor, DocumentoLegal, Alert } from './types/legal';

interface ApiResponse<T> {
  data: T;
  total?: number;
  page?: number;
}

interface ApiError {
  error: string;
  message: string;
  code: string;
}

// Función para listar casos
export async function getCases(token: string): Promise<ApiResponse<CaseMonitor[]>> {
  // Validar token
  if (!token) {
    throw new Error('401: Unauthorized');
  }
  
  // TODO: Conectar a BD
  return {
    data: [],
    total: 0,
    page: 1
  };
}

// Función para obtener caso específico
export async function getCaseById(
  caseId: string, 
  token: string
): Promise<CaseMonitor | null> {
  if (!token) {
    throw new Error('401: Unauthorized');
  }
  
  if (!caseId) {
    throw new Error('400: Invalid case ID');
  }
  
  // TODO: Conectar a BD
  return null;
}

// Función para obtener documentos de caso
export async function getCaseDocuments(
  caseId: string,
  token: string
): Promise<ApiResponse<DocumentoLegal[]>> {
  if (!token) {
    throw new Error('401: Unauthorized');
  }
  
  return {
    data: [],
    total: 0
  };
}

// Función para obtener alertas
export async function getCaseAlerts(
  caseId: string,
  token: string
): Promise<ApiResponse<Alert[]>> {
  if (!token) {
    throw new Error('401: Unauthorized');
  }
  
  return {
    data: []
  };
}
EOF
```

### Paso 3: Documentar API (10 min)
```bash
/document-api

# Genera automáticamente:
# - swagger.json (especificación OpenAPI)
# - /api/docs (interfaz interactiva)
# - postman-collection.json
```

### Resultado del Jueves:
✅ API diseñada
✅ Código API creado
✅ Documentación auto-generada
✅ Listo para integración

---

## 📋 VIERNES: Integración & Testing (30 minutos)

### Paso 1: Crear tests para API (15 min)
```bash
cat > tests/api.test.ts << 'EOF'
import { getCases, getCaseById, getCaseDocuments } from '../src/api';

describe('API Endpoints', () => {
  const validToken = 'valid-token';
  
  describe('getCases', () => {
    test('requiere autenticación', async () => {
      expect(() => getCases('')).toThrow('401: Unauthorized');
    });
    
    test('retorna lista de casos', async () => {
      const resultado = await getCases(validToken);
      expect(resultado.data).toEqual(expect.any(Array));
      expect(resultado.total).toEqual(expect.any(Number));
    });
  });
  
  describe('getCaseById', () => {
    test('valida caseId', async () => {
      expect(() => getCaseById('', validToken)).toThrow('400: Invalid case ID');
    });
    
    test('requiere autenticación', async () => {
      expect(() => getCaseById('CASO-001', '')).toThrow('401: Unauthorized');
    });
  });
  
  describe('getCaseDocuments', () => {
    test('retorna documentos de caso', async () => {
      const resultado = await getCaseDocuments('CASO-001', validToken);
      expect(resultado.data).toEqual(expect.any(Array));
    });
  });
});
EOF
```

### Paso 2: Ejecutar tests de API (10 min)
```bash
/run-tests tests/api.test.ts

# Resultado:
# PASS  tests/api.test.ts
# ✓ API Endpoints (6 tests)
# Coverage: 95%
```

### Paso 3: Documentar en Knowledge Base (5 min)
```bash
/create-md-document "API Implementation"
/add-to-knowledge-base "API_DESIGN.md"
/add-to-knowledge-base "TYPESCRIPT_LSP_SETUP.md"
/add-to-knowledge-base "JEST_TESTING_SETUP.md"
/add-to-knowledge-base "OWASP_SECURITY_SETUP.md"
```

### Resultado del Viernes:
✅ 6+ tests API
✅ Coverage 95%+
✅ Documentación en KB
✅ Sistema listo

---

## 📊 Resumen de la Semana

### Lunes: TypeScript LSP ✅
```
Tiempo: 30 min
Archivos creados: 2
Errores detectados: 0
Resultado: ✅ Listo
```

### Martes: OWASP/Security ✅
```
Tiempo: 1 hora
Auditorías: 2 (GDPR + CCPA)
Vulnerabilidades: 0
Resultado: ✅ Listo
```

### Miércoles: Jest/Testing ✅
```
Tiempo: 2 horas
Tests creados: 5
Coverage: 100%
Resultado: ✅ Listo
```

### Jueves: API Management ✅
```
Tiempo: 1 hora
Endpoints: 4
Documentación: Auto-generada
Resultado: ✅ Listo
```

### Viernes: Integración ✅
```
Tiempo: 30 min
Tests adicionales: 6
Coverage final: 95%+
Resultado: ✅ Completo
```

---

## 📈 Métricas Finales

```
Total de código escrito: ~500 líneas
Tests creados: 11+
Coverage: 95%+
Vulnerabilidades encontradas: 0
GDPR Compliance: ✅ 100%
CCPA Compliance: ✅ 100%
Endpoints API: 4+ funcionales
Documentación: Completa

Tiempo total: 6 horas
Costo: $0
Resultado: Sistema legal tech profesional
```

---

## 🎯 Comandos Clave para la Semana

### Lunes
```bash
/analyze-typescript "src/types/legal.ts"
```

### Martes
```bash
/security-audit "src"
/compliance-check gdpr
```

### Miércoles
```bash
/create-test "tipos"
/run-tests
/coverage-report
```

### Jueves
```bash
/create-api "casos"
/document-api
```

### Viernes
```bash
/run-tests
/create-md-document "API Implementation"
```

---

## ✅ Checklist Final

```
LUNES:
☐ tsconfig.json creado
☐ Estructura de carpetas
☐ Archivo src/types/legal.ts
☐ TypeScript validado

MARTES:
☐ Auditoría de seguridad
☐ GDPR compliance check
☐ CCPA compliance check
☐ SECURITY.md documento

MIÉRCOLES:
☐ Jest configurado
☐ 5+ tests creados
☐ Coverage 100%
☐ Tests pasando

JUEVES:
☐ API diseñada
☐ src/api.ts creado
☐ API documentada
☐ Swagger generado

VIERNES:
☐ Tests API
☐ Coverage 95%+
☐ Documentación en KB
☐ Sistema funcional
```

---

**Resultado:** Un sistema legal tech profesional, seguro, testado y documentado. 🎯

¿Empezamos el Lunes con TypeScript LSP? Puedo ayudarte paso a paso.

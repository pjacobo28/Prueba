# OWASP/Security MCP Server Installation

## ¿Qué es OWASP/Security?

OWASP/Security es un servidor MCP que proporciona análisis avanzado de seguridad:
- Validación OWASP Top 10
- Escaneo de vulnerabilidades
- Análisis criptográfico
- Compliance GDPR/CCPA
- Auditoría de seguridad

## Características principales

### 1. **OWASP Top 10**
- SQL Injection
- Cross-Site Scripting (XSS)
- Broken Authentication
- Sensitive Data Exposure
- XML External Entity (XXE)
- Broken Access Control
- Security Misconfiguration
- Insecure Deserialization
- Usando componentes vulnerables
- Insufficient logging/monitoring

### 2. **Cumplimiento Normativo**
- GDPR compliance
- CCPA compliance
- Protección de datos personales
- Derecho a ser olvidado
- Consentimiento informado

### 3. **Análisis Criptográfico**
- Algoritmos seguros
- Longitud de claves
- Funciones hash
- Encriptación end-to-end

### 4. **Control de Acceso**
- Autenticación robusta
- Autorización granular
- Multi-factor authentication
- Sesiones seguras

## Cómo usar OWASP/Security

### Auditoría de seguridad:
```bash
/security-audit "componente"
# Audita componente por vulnerabilidades
```

### Compliance check:
```bash
/compliance-check gdpr
# Verifica cumplimiento GDPR
```

### Vulnerabilidad scan:
```bash
/vulnerability-scan
# Busca vulnerabilidades conocidas
```

### Análisis criptográfico:
```bash
/cryptography-review
# Revisa implementación criptográfica
```

## 🎯 Aplicaciones para Trabajo Legal

### 1. **Protección de Datos Personales**
```
GDPR Compliance Check:
✅ ¿Datos clasificados como personales?
✅ ¿Consentimiento informado?
✅ ¿Derechos de acceso/eliminación?
✅ ¿Encriptación en tránsito?
✅ ¿Encriptación en reposo?
✅ ¿DPIA realizado?
```

### 2. **Seguridad de Documentos Legales**
```
Auditoría de seguridad:
✅ ¿Documentos encriptados?
✅ ¿Control de acceso?
✅ ¿Auditoría de quién accede?
✅ ¿Retención de datos correcta?
✅ ¿Borrado seguro de archivos?
```

### 3. **Monitoreo de Casos (Playwright)**
```
Seguridad de automatización:
✅ ¿Credenciales encriptadas?
✅ ¿Sesiones seguras?
✅ ¿Validación de certificados SSL?
✅  Logs de acceso?
✅ ¿Alertas de seguridad?
```

### 4. **Almacenamiento en Knowledge Base**
```
Seguridad de datos:
✅ ¿Encriptación de BD?
✅ ¿Backups encriptados?
✅ ¿Acceso limitado por usuario?
✅ ¿Auditoría de cambios?
✅ ¿Recuperación ante desastres?
```

## Implementación GDPR

### Requisitos legales:
```
1. Transparencia
   ✅ Política de privacidad clara
   ✅ Consentimiento explícito
   ✅ Información sobre derechos

2. Control de datos
   ✅ Minimización de datos
   ✅ Propósito específico
   ✅ Retención limitada

3. Derechos del usuario
   ✅ Acceso a datos
   ✅ Corrección de datos
   ✅ Derecho a ser olvidado
   ✅ Portabilidad de datos

4. Seguridad
   ✅ Encriptación
   ✅ Control de acceso
   ✅ Auditoría
   ✅ Breach notification
```

### Validación con OWASP:
```bash
/compliance-check gdpr
# Verifica cumplimiento de cada requisito
```

## Implementación CCPA (California)

### Requisitos principales:
```
Información obligatoria:
✅ ¿Qué datos recolectas?
✅ ¿Cómo los usas?
✅ ¿Con quién los compartes?
✅ Duración de retención

Derechos del consumidor:
✅ Derecho a saber
✅ Derecho a borrar
✅ Derecho a optar por no participar
✅ Derecho a no ser discriminado
```

## Flujo de Auditoría

```
1. /security-audit
   ↓
2. Detecta vulnerabilidades
   ↓
3. /compliance-check
   ↓
4. Valida normativa
   ↓
5. Genera reporte
   ↓
6. Propone mejoras
   ↓
7. Implementa remediaciones
```

## Checklist de Seguridad para Bufete Legal

```
AUTHENTICATION:
☐ Contraseñas fuertes requeridas
☐ Multi-factor authentication
☐ Sesiones con timeout
☐ Logout en todos los dispositivos

DATA PROTECTION:
☐ Encriptación TLS 1.2+
☐ Encriptación de BD
☐ Encriptación en reposo
☐ Hashing seguro de contraseñas

ACCESS CONTROL:
☐ RBAC (Role-Based)
☐ Principio de menor privilegio
☐ Auditoría de acceso
☐ Logs centralizados

GDPR COMPLIANCE:
☐ Consentimiento documentado
☐ DPIA realizado
☐ Política de privacidad actualizada
☐ DPO designado (si aplica)

INCIDENT RESPONSE:
☐ Plan de respuesta a breaches
☐ Notificación en 72 horas
☐ Documentación de incidentes
☐ Pruebas regulares
```

## Vulnerabilidades Más Comunes en Legal Tech

```
1. SQL Injection
   Riesgo: Acceso a BD completa
   Solución: Prepared statements

2. XSS (Cross-Site Scripting)
   Riesgo: Robo de sesión
   Solución: Sanitización de entrada

3. Sensitive Data Exposure
   Riesgo: Exposición de datos personales
   Solución: Encriptación + HTTPS

4. Broken Auth
   Riesgo: Acceso no autorizado
   Solución: 2FA + Validación fuerte

5. Insufficient Logging
   Riesgo: No detectar brechas
   Solución: Auditoría centralizada
```

## Integración con Code Review

```
Code Review
    + OWASP Security
    = Código seguro por defecto

Validación automática:
✅ No SQL injection
✅ No XSS
✅ Encriptación correcta
✅ Autenticación robusta
✅ Compliance normativo
```

## Más información

Visita https://claude.com/plugins/owasp-security para más detalles.

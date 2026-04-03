# Code Review MCP Server Installation

## ¿Qué es Code Review?

Code Review es un servidor MCP que proporciona capacidades inteligentes de revisión de código, evaluando implementaciones contra planes, estándares de codificación, principios arquitectónicos y mejores prácticas.

El plugin integra revisión automática de código con análisis profundo, asegurando que el código cumple con:
- **Estándares de codificación** establecidos
- **Principios arquitectónicos** del proyecto
- **Requisitos de seguridad** y conformidad
- **Mejores prácticas** de la industria
- **Especificaciones** de diseño

## Características principales

### 1. **Revisión Automática Inteligente**
- Análisis profundo del código
- Feedback específico y accionable
- Evaluación contra normas del proyecto

### 2. **Análisis de Conformidad**
- Verifica cumplimiento normativo
- Valida patrones de seguridad
- Revisa manejo de datos sensibles

### 3. **Integración con Superpowers**
- Funciona con ciclos TDD
- Valida implementaciones contra planes
- Proporciona checkpoints de revisión

### 4. **Reportes Detallados**
- Identifica áreas de mejora
- Sugiere refactorizaciones
- Documenta hallazgos

## Cómo usar Code Review

### Invocación directa:

```bash
/review-code
# Revisa código contra estándares establecidos
```

### Con Superpowers:

```bash
/execute-plan
# Incluye revisión de código en checkpoints
```

### Análisis específico:

```bash
/review-security
# Enfocado en aspectos de seguridad
```

```bash
/review-legal-compliance
# Enfocado en cumplimiento normativo
```

## Flujo de trabajo recomendado

1. **Implementación:** Escribe código con TDD (Superpowers)
2. **Revisión automática:** Code Review evalúa automáticamente
3. **Análisis:** Revisa feedback y recomendaciones
4. **Iteración:** Refactoriza según suggestions
5. **Aprobación:** Código listo para merge cuando cumple criterios

## Consideraciones para trabajo legal

Code Review es crítico para proyectos legales porque:

- **Conformidad normativa:** Verifica cumplimiento de leyes y regulaciones
- **Seguridad de datos:** Valida protección de información sensible
- **Trazabilidad:** Mantiene registro de revisiones y cambios
- **Estándares corporativos:** Asegura coherencia con políticas
- **Auditoría:** Proporciona documentación de QA
- **Privacidad:** Evalúa manejo de datos personales

### Reglas sugeridas para contexto legal:

- ✅ Validar manejo de datos personales (GDPR, CCPA)
- ✅ Verificar cifrado de información sensible
- ✅ Auditar permisos y acceso
- ✅ Revisar cumplimiento de firma digital
- ✅ Validar retención de datos
- ✅ Verificar compliance de auditoría

## Configuración avanzada

Puedes personalizar reglas de revisión en `claude.md` o configuración del proyecto para enfatizar estándares legales específicos.

## Más información

Visita https://claude.com/plugins/code-review para más detalles.

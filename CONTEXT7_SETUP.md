# Context7 MCP Server Installation

## ¿Qué es Context7?

Context7 es un servidor MCP (Model Context Protocol) que proporciona documentación actualizada y ejemplos de código específicos de versión directamente en tus prompts con Claude.

**Problema que resuelve:** Los LLMs a menudo tienen datos de entrenamiento desactualizados, lo que lleva a APIs alucinadas y patrones de código obsoletos.

**Solución:** Context7 obtiene documentación actual directamente desde repositorios de origen.

## Características principales

- **resolve-library-id**: Coincide nombres de librerías con identificadores compatibles con Context7
- **query-docs**: Obtiene documentación para librerías específicas
- Soporte para **versiones específicas** mencionadas en el prompt

## Cómo usar Context7

Simplemente añade "use context7" a cualquier prompt donde necesites documentación actualizada.

### Ejemplos:

```
"Crea un middleware de Next.js que verifique un JWT válido en cookies. use context7"
```

```
"Configura un script de Cloudflare Worker para cachear respuestas de API JSON. use context7"
```

### Especificar librerías exactas:

```
"use library /supabase/supabase for API and docs"
```

## Instalación

La configuración de Context7 está en `.claude/mcp.json`. Claude Code utilizará automáticamente este servidor MCP cuando inicies sesiones.

## Verificación

Para verificar que Context7 está instalado correctamente:

1. Abre Claude Code en tu proyecto
2. En cualquier prompt, escribe "use context7"
3. Deberías ver que la documentación se carga de fuentes actualizadas

## Más información

Visita https://claude.com/plugins/context7 para más detalles.

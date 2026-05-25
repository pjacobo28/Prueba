# Prueba

Proyecto con plugins y skills para Claude Code.

## Plugins Instalados

### 1. Claude-Mem
Persistent memory compression system for Claude Code.

**Características:**
- **Persistent Memory** - Context survives across sessions
- **Progressive Disclosure** - Layered memory retrieval with token cost visibility
- **Skill-Based Search** - Query your project history with mem-search skill
- **Web Viewer UI** - Real-time memory stream
- **Privacy Control** - Use `<private>` tags to exclude sensitive content from storage
- **Context Configuration** - Fine-grained control over what context gets injected

**Repositorio:** https://github.com/thedotmack/claude-mem

### 2. Superpowers
Complete software development workflow for coding agents.

**Características:**
- **Specification Refinement** - Asks what you're trying to do before jumping to code
- **Design Review** - Shows design in readable chunks for approval
- **Implementation Planning** - Clear plan following TDD and YAGNI principles
- **Subagent-Driven Development** - Agents work autonomously through tasks with review
- **Composable Skills** - Set of reusable skills for common development tasks

**Repositorio:** https://github.com/obra/superpowers

### 3. Anthropic Skills
Official Anthropic implementation of skills for Claude.

**Skills Disponibles (17):**
- **Creative & Design**: algorithmic-art, brand-guidelines, canvas-design, frontend-design, slack-gif-creator, theme-factory
- **Development & Technical**: claude-api, mcp-builder, skill-creator, webapp-testing, web-artifacts-builder
- **Enterprise & Communication**: internal-comms, doc-coauthoring
- **Document Skills**: docx, pdf, pptx, xlsx

**Repositorio:** https://github.com/anthropics/skills

## Custom Skills

### 1. Derecho Civil Dominicano
Guía completa del Código Civil dominicano con jurisprudencia.

**Cobertura:**
- **Libro I:** Personas (capacidad, matrimonio, divorcio, filiación, patria potestad)
- **Libro II:** Bienes (propiedad, posesión, usucapión)
- **Libro III:** Obligaciones (contrato, responsabilidad civil, enriquecimiento sin causa)
- **Libro IV:** Sucesión hereditaria (orden de sucesión, legítima, legados)

**Características:**
- Jurisprudencia SCJ e interpretación legal
- Triggers automáticos para temas: contrato, obligación, responsabilidad civil, matrimonio, divorcio, filiación, patria potestad, sucesión, propiedad, posesión, derechos reales, prescripción, usucapión, enriquecimiento sin causa, actos propios, buena fe
- Doctrina de actos propios, buena fe contractual, imprevisión de circunstancias
- Cheatsheet de obligaciones con plazos y procedimientos

### 2. Derecho Registral e Inmobiliario Dominicano
Sistema Torrens y operaciones de registro inmobiliario (Ley 108-05).

**Cobertura:**
- **Sistema Torrens:** Principios de especialidad, legalidad, legitimidad, publicidad
- **Titulación y asientos registrales:** Inscripción, hipotecas, embargos, gravámenes
- **Tracto sucesivo (Art. 31 Res. 788-2022):** Prohibición de inscribir sin antecesor
- **Embargos retentivos:** Medidas cautelares inmobiliarias
- **Impugnación de inscripciones:** Acciones de nulidad, recursos en vía de amparo
- **Condominio (Ley 5038):** Régimen de propiedad horizontal
- **Jurisprudencia SCJ:** Sentencias sobre Sistema Torrens y prioridad registral

**Características:**
- 8 capítulos temáticos on-demand (Sistema Torrens, Titulación, Tracto Sucesivo, Embargos, Medidas Cautelares, Condominio, Impugnaciones, Jurisprudencia)
- Glosario de 20+ términos clave con jurisprudencia
- Cheatsheet de operaciones críticas (inscripción, embargo, cancelación, sentencia de tierras)
- Conexiones estratégicas: demanda de nulidad, embargo retentivo, hipoteca y ejecución
- Alertas prácticas sobre tracto sucesivo, prioridad registral, caducidad automática, fe pública
- Referencias a Ley 108-05, Resoluciones 787-789/2022, CPC anotado

### 3. Derecho Penal Dominicano
Código Penal (arts. 1-483) + Ley 97-2025 (Código Procesal Penal).

**Cobertura:**
- **Teoría del Delito:** Tipicidad, antijuricidad, culpabilidad, imputabilidad, punibilidad
- **Libro I - Disposiciones Generales:** Clasificación delitos, grados ejecución (tentativa, frustración, consumación), participación criminal (autores, cómplices, instigadores)
- **Libro II - Delitos Contra la Persona:** Homicidio, violación, lesiones, consentimiento en delitos sexuales
- **Libro III - Delitos Contra la Propiedad:** Robo, hurto, estafa, diferenciación por violencia/engaño
- **Delitos Especiales:** Blanqueo de capitales (Ley 155-17), corrupción, soborno, malversación, drogas
- **Procedimiento Penal (Ley 97-2025):** Investigación preliminar, etapa preparatoria, juicio oral, recursos, derechos procesales, medidas cautelares

**Características:**
- 3 capas integradas: teoría del delito, derecho sustantivo, procedimiento penal
- Elementos constitutivos de cada delito con jurisprudencia SCJ
- 5 fases procedimentales: investigación, etapa preparatoria, juicio oral, sentencia, recursos
- Derechos procesales del imputado (presunción inocencia, defensa técnica, silencio, confrontación testigos)
- Jurisprudencia pivotal: tipicidad, error de tipo, presunción inocencia, cosa juzgada, debido proceso
- Cheatsheet de 7 defensas penales (elemento tipo, error, justificación, imputabilidad, prescripción, cosa juzgada)

### 4. Jurisprudencia Dominicana
Doctrina jurisprudencial SCJ y Tribunal Constitucional 2010-2025 (base ENJ Anuario 2022).

**Doctrina Jurisprudencial Crítica (10 temas):**
- **Actos Propios:** Principio de estoppel (SCJ 241/2020) — no actuar contradicatoriamente
- **Buena Fe:** Presunción y principio rector (CC art. 1134, interpretación contra redactor)
- **Cosa Juzgada:** Identidad partes, causa de pedir, petitorio, sentencia firme (SCJ 20/2021)
- **Error de Derecho:** Causal de casación (aplicación errónea ley, omisión fundamentación)
- **Responsabilidad Civil:** Contractual vs. extracontractual (art. 1382 CC), daño moral reconocido
- **Embargos y Medidas Cautelares:** Requisitos, vicio notificación = nulidad (SCJ 241/2020, Sentencia 037-2024)
- **Contratos:** Interpretación, imprevisión justifica rescisión, enriquecimiento injusto (SCJ 20/2021, 69/2019)
- **Sucesión Hereditaria:** Orden sucesión ab intestato, legítima inviolable, validez testamento
- **Derecho Registral:** Tracto sucesivo (Art. 31 Res. 788-2022), prioridad registral (SCJ-SS-24-0969)
- **Cosa Nueva:** Hechos posteriores sentencia permiten nueva demanda

**Características:**
- 10 doctrinas jurisprudenciales con sentencias citadas (SCJ + TC)
- Jurisprudencia por área: Penal (presunción inocencia, error tipo), Civil (plazo prescripción, nulidad)
- 4 casos paradigmáticos con soluciones defensivas (embargo, tracto sucesivo, enriquecimiento, cosa nueva)
- Tabla de jurisprudencia frecuente por materia (Registral, Embargos, Responsabilidad civil, Contratos, Sucesión)
- Formato de cita CENDIJ con ejemplos prácticos
- Búsqueda en CENDIJ: pasos, palabras clave, fuentes (Portal Poder Judicial)
- Base documental: ENJ Anuario Jurisprudencia 2022, CENDIJ, Gaceta Judicial

## Estructura del Proyecto

```
skills/
  ├── derecho-civil-dominicano/          # Código Civil (4 libros, 11KB)
  │   └── SKILL.md
  ├── inmobiliario-dominicano/           # Ley 108-05 + Sistema Torrens (15KB)
  │   └── SKILL.md
  ├── derecho-penal-dominicano/          # Código Penal + CPP (10KB)
  │   └── SKILL.md
  ├── jurisprudencia-dominicana/         # SCJ doctrina + TC (12KB)
  │   └── SKILL.md
  ├── ... (superpowers skills - 14)
  └── ... (anthropic skills reference)
```

## Cómo usar

Los skills se cargan automáticamente en Claude Code. Menciona el skill por nombre o su tema:

**Derecho Civil:**
- "Usa el skill de derecho civil dominicano para analizar este contrato"
- "Aplicar reglas de obligaciones contractuales"
- "¿Cuál es el régimen matrimonial por defecto en RD?"

**Derecho Inmobiliario:**
- "Análisis de tracto sucesivo en esta inscripción"
- "¿Cómo funciona un embargo retentivo inmobiliario?"
- "Explica la prioritariedad registral en DR"

**Derecho Penal:**
- "¿Cuáles son los elementos del tipo penal de robo?"
- "Analiza la culpabilidad en este caso de homicidio"
- "¿Cuáles son mis derechos procesales como imputado?"
- "Defensa por error de tipo invencible"
- "Procedimiento penal desde investigación hasta sentencia"

**Jurisprudencia Dominicana:**
- "¿Qué dice la jurisprudencia sobre actos propios?"
- "Busca sentencias sobre tracto sucesivo registral"
- "Cómo se aplica el principio de buena fe en contratos"
- "Doctrina SCJ sobre cosa juzgada y cosa nueva"
- "Jurisprudencia sobre embargos con vicio de notificación"
- "¿Cómo se calcula la responsabilidad civil según SCJ?"
- "Cita jurisprudencial en formato CENDIJ para enriquecimiento injusto"

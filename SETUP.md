# 🚀 Google Drive Organizer AI

Un asistente inteligente que **organiza automáticamente tu Google Drive** usando Claude AI.

## ✨ Características

- 🤖 **Análisis inteligente con Claude AI** - Entiende el contenido de tus documentos
- 🗂️ **Organización automática** - Crea carpetas y organiza por categorías
- 🔍 **Detección de duplicados** - Identifica y elimina copias
- 📝 **Análisis de borradores** - Encuentra documentos incompletos
- ❓ **Preguntas interactivas** - Te pide confirmación en cada paso
- 🛡️ **Seguro** - Nunca elimina sin tu aprobación

## 📋 Requisitos Previos

1. **Python 3.8+**
2. **Google Cloud Project** con Google Drive API habilitada
3. **Clave API de Anthropic**

## 🔧 Instalación

### 1. Clonar y preparar el entorno

```bash
# Clonar repo (si aún no lo has hecho)
git clone <tu-repo>
cd Prueba

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

### 2. Configurar Google Drive API

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto
3. Habilita **Google Drive API**
4. Ve a "Credenciales" → "Crear credenciales" → "Aplicación de escritorio"
5. Descarga el JSON y guárdalo como `credentials.json` en la carpeta del proyecto

### 3. Configurar Anthropic API

```bash
# Opción A: Variable de entorno
export ANTHROPIC_API_KEY="sk-your-key-here"

# Opción B: Crear archivo .env
echo "ANTHROPIC_API_KEY=sk-your-key-here" > .env
```

Obtén tu clave en [Anthropic Console](https://console.anthropic.com)

### 4. Ejecutar

```bash
python3 google_drive_organizer.py
```

## 📖 Cómo Funciona

### Flujo de Ejecución

1. **Escanea tu Drive** - Encuentra todos los documentos, hojas de cálculo, PDFs, etc.

2. **Analiza con Claude** - Para cada archivo:
   - Lee el nombre y contenido disponible
   - Detecta si es un borrador o documento importante
   - Identifica partes involucradas (personas, empresas, clientes)
   - Sugiere carpeta de destino
   - Calcula confianza en la recomendación

3. **Pregunta tu decisión** - Para cada archivo:
   ```
   ¿Qué hacer con este archivo?
   1. Mover a carpeta [nombre]
   2. Eliminar
   3. Mantener donde está
   4. Mostrar más análisis
   ```

4. **Ejecuta acciones** - Mueve, elimina o mantiene según tu decisión

5. **Resumen final** - Muestra estadísticas

### Estructura Sugerida de Carpetas

El sistema sugiere organizar por:

```
Mi Unidad/
├── Clientes/
│   ├── Cliente A/
│   ├── Cliente B/
│   └── ...
├── Proyectos/
│   ├── Proyecto X/
│   ├── Proyecto Y/
│   └── ...
├── Contratos/
├── Reportes/
├── Propuestas/
└── Archivos/
```

## 🎯 Ejemplos de Análisis

### Antes - Google Drive Desorganizado

```
Mi Unidad/
├── Contrato_Final_v2.docx
├── Contrato_Final_v3.docx
├── Propuesta_BORRADOR.docx
├── Reporte Febrero.xlsx
├── Reporte Febrero v2.xlsx
├── Email de John (1).docx
├── Email de John (2).docx
└── [15 archivos más sin organizar]
```

### Después - Organizado por Claude

```
Mi Unidad/
├── Clientes/
│   └── John Corporation/
│       ├── Contratos/
│       │   └── Contrato_Final_v3.docx ✓
│       └── Comunicaciones/
│           └── Email.docx
├── Reportes/
│   └── 2024/
│       └── Reporte_Febrero.xlsx ✓
├── Archivos_Eliminados/
│   └── [Duplicados y borradores]
└── [Otros archivos]
```

## ⚙️ Opciones Avanzadas

### Configurar tipos de archivo a procesar

En `google_drive_organizer.py`, modifica:

```python
file_types = [
    "application/vnd.google-apps.document",
    "application/vnd.google-apps.spreadsheet",
    "application/pdf",
    # Agrega más tipos MIME según necesites
]
```

### Procesar solo una carpeta específica

```python
# En lugar de:
files = self.get_all_files()

# Usa:
files = self.get_all_files(folder_id="AQUI_TU_FOLDER_ID")
```

### Modo automático (sin confirmación)

Para usar recomendaciones automáticas sin preguntar (⚠️ usar con cuidado):

```python
# Modificar la lógica de decisión en run_interactive_organizer()
```

## 🤝 Ejemplos de Uso

### Ejemplo 1: Organizar por Cliente

```
Entrada: 10 documentos variados
Claude detecta: 3 de Cliente A, 4 de Cliente B, 3 diversos
Resultado: Carpetas "Cliente A", "Cliente B", "Varios"
```

### Ejemplo 2: Limpiar Borradores

```
Entrada: Carpeta con reportes
Claude detecta: 5 borradores, 1 versión final
Resultado: Borradores a carpeta "Archivos/Borradores", final en "Reportes"
```

### Ejemplo 3: Eliminar Duplicados

```
Entrada: "Propuesta v1", "Propuesta v2", "Propuesta v3", "Propuesta FINAL"
Claude analiza: Identifica las 3 versiones anteriores como obsoletas
Resultado: Mantiene solo "FINAL", ofrece eliminar otras
```

## 📊 Estadísticas

El programa te muestra al final:
- ✓ Total de archivos analizados
- ✓ Archivos organizados en nuevas carpetas
- ✓ Archivos eliminados (movidos a papelera)
- ✓ Duplicados detectados
- ✓ Borradores identificados

## ⚠️ Notas Importantes

1. **Seguro**: Los archivos se mueven a papelera, no se eliminan permanentemente
2. **Requiere confirmación**: No hace cambios sin tu aprobación
3. **Inteligente**: Usa IA para entender contexto, no solo nombres
4. **Privacidad**: Solo accede a tu Drive personal
5. **API Rate Limits**: Procesa ~50 archivos antes de pausar

## 🆘 Troubleshooting

### Error: "credentials.json not found"

```bash
# Descarga OAuth credentials de Google Cloud Console
# Guárdalo como credentials.json en la carpeta raíz
```

### Error: "ANTHROPIC_API_KEY not set"

```bash
export ANTHROPIC_API_KEY="sk-your-actual-key"
```

### Error: "Connection refused"

1. Verifica conexión a internet
2. Comprueba que el puerto OAuth local está libre (8080)
3. Reinicia la sesión

## 🔮 Próximas Mejoras

- [ ] Procesar más tipos de archivos (imágenes, videos)
- [ ] Detección automática de proyectos
- [ ] Historial de cambios
- [ ] API web para interfaz gráfica
- [ ] Sincronización con otros servicios (Notion, Slack)
- [ ] Backups automáticos antes de cambios

## 📝 Licencia

MIT - Libre para usar y modificar

## 🤝 Contribuir

¡Sugerencias y pull requests bienvenidas!

---

**¿Preguntas?** Abre un issue en el repositorio.

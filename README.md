# 🚀 Google Drive Organizer AI

Un asistente inteligente que **organiza automáticamente tu Google Drive** usando Claude AI.

![Python](https://img.shields.io/badge/Python-3.8+-blue)
![Claude API](https://img.shields.io/badge/Claude%20API-Latest-green)
![Google Drive API](https://img.shields.io/badge/Google%20Drive%20API-v3-orange)

## ✨ Características Principales

- 🤖 **IA Claude integrada** - Análisis inteligente de contenido
- 🗂️ **Organización automática** - Crea carpetas y reorganiza documentos
- 🔍 **Detección de duplicados** - Identifica y elimina copias
- 📝 **Análisis de borradores** - Encuentra documentos incompletos
- ❓ **Modo interactivo** - Te pregunta antes de cada acción
- 🛡️ **100% seguro** - Requiere confirmación del usuario
- 📊 **Análisis contextual** - Entiende participantes y categorías

## 🎯 Casos de Uso

### 📋 Organizar por Cliente
```
Entrada: 10 docs variados
↓ Claude analiza
Salida: Carpetas automáticas por cliente
```

### 🔄 Eliminar Duplicados
```
Entrada: Propuesta v1, v2, v3, FINAL
↓ Claude detecta versiones obsoletas
Salida: Mantiene solo la versión final
```

### 📁 Limpiar Borradores
```
Entrada: Reportes completos + borradores
↓ Claude identifica estados
Salida: Borradores → Carpeta, Finales → Reportes
```

## 🚀 Inicio Rápido

### 1. Instalación

```bash
# Clonar repositorio
git clone <repo>
cd Prueba

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### 2. Configuración

Ver **[SETUP.md](SETUP.md)** para instrucciones detalladas de:
- Google Cloud API
- Anthropic API Key
- Autenticación

### 3. Ejecutar

```bash
python3 google_drive_organizer.py
```

## 📂 Estructura del Proyecto

```
Prueba/
├── google_drive_organizer.py  # Script principal
├── prompts.py                 # Prompts para Claude
├── example_advanced.py        # Ejemplos avanzados
├── requirements.txt           # Dependencias
├── .env.example              # Plantilla de configuración
├── SETUP.md                  # Guía de instalación detallada
└── README.md                 # Este archivo
```

## 🤖 Cómo Funciona

### Flujo de Ejecución

```
1️⃣ SCAN
   Obtiene lista de archivos
        ↓
2️⃣ ANALYZE
   Claude AI analiza cada archivo
   - Lee nombre y contenido
   - Detecta tipo y estado
   - Identifica participantes
   - Sugiere carpeta
        ↓
3️⃣ CONFIRM
   Te pregunta qué hacer
   - Mover a carpeta
   - Eliminar
   - Mantener
        ↓
4️⃣ EXECUTE
   Realiza las acciones
   - Mueve archivos
   - Crea carpetas
   - Elimina duplicados
        ↓
5️⃣ REPORT
   Muestra estadísticas
```

## 💬 Ejemplo de Uso

```bash
$ python3 google_drive_organizer.py

🚀 Google Drive Organizer AI iniciado
Obteniendo archivos...
Encontrados 47 archivos

[1/47] Analizando: Contrato_Final_v3.docx

Análisis de Claude:
{
  "es_duplicado": false,
  "es_borrador": false,
  "tipo_documento": "Contrato",
  "partes_involucradas": ["Mi Empresa", "Cliente XYZ"],
  "categoria_sugerida": "Clientes/Cliente XYZ",
  "confianza": 0.95,
  "recomendacion": "Mover a Clientes/Cliente XYZ/Contratos"
}

¿Qué hacer con este archivo?
1. Mover a carpeta [nombre]
2. Eliminar
3. Mantener donde está
Tu decisión: 1

Nombre de la carpeta destino: Clientes/Cliente XYZ
✓ Carpeta creada: Cliente XYZ
✓ Archivo movido exitosamente
```

## 🔧 Configuración Avanzada

### Variables de Entorno

```bash
# .env
ANTHROPIC_API_KEY=sk-your-key
PROCESS_DOCS=true
PROCESS_SHEETS=true
MAX_FILES_PER_SESSION=100
```

### Tipos de Archivo Soportados

- 📄 Google Docs
- 📊 Google Sheets
- 🎨 Google Slides
- 📑 PDF
- 📋 Excel
- 📝 Word

### Personalizar Prompts

Edita `prompts.py` para cambiar:
- Criterios de organización
- Preguntas al usuario
- Formato de análisis

## 📊 Estadísticas y Reportes

Al finalizar verás:
- ✓ Total de archivos analizados
- ✓ Archivos organizados
- ✓ Archivos eliminados
- ✓ Duplicados detectados
- ✓ Carpetas creadas

## 🆘 Troubleshooting

### "credentials.json not found"
→ Descarga credenciales de Google Cloud Console

### "ANTHROPIC_API_KEY not set"
→ Configura variable de entorno o .env

### "Connection refused"
→ Verifica conexión a internet y puertos

Ver **[SETUP.md](SETUP.md)** para más soluciones.

## 📚 Documentación Adicional

- **[SETUP.md](SETUP.md)** - Guía de instalación completa
- **[example_advanced.py](example_advanced.py)** - 6 ejemplos de uso
- **[prompts.py](prompts.py)** - Sistema de prompts

## 🔐 Seguridad y Privacidad

- ✅ Solo accede a tu Google Drive personal
- ✅ No almacena datos en servidores terceros (excepto APIs)
- ✅ Requiere confirmación antes de cada acción
- ✅ Usa papelera de Google Drive (reversible)
- ✅ No lee archivos que no necesita

## 🚀 Próximas Mejoras

- [ ] Interfaz web/GUI
- [ ] Procesamiento de imágenes y videos
- [ ] Sincronización continua
- [ ] Historial detallado de cambios
- [ ] Integración con Slack/Teams
- [ ] Backups automáticos

## 📝 Licencia

MIT License - Libre para usar y modificar

## 🤝 Contribuciones

¡Las pull requests son bienvenidas! Para cambios importantes:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/mi-feature`)
3. Commit cambios (`git commit -am 'Add mi-feature'`)
4. Push a la rama (`git push origin feature/mi-feature`)
5. Abre una Pull Request

## 💡 Tips y Trucos

### Modo Batch (Sin Confirmación)
Para procesar automáticamente archivos seguros, modifica `run_interactive_organizer()`.

### Exportar Reportes
Los cambios se guardan en `changes_history.json` para auditoría.

### Procesar Solo Carpeta Específica
```python
files = organizer.get_all_files(folder_id="ID_CARPETA")
```

### Aumentar Límite de Lectura
```python
# En prompts.py
content[:50000]  # Aumenta a 50k caracteres
```

## ❓ FAQ

**P: ¿Es seguro eliminar archivos?**
R: Sí, van a papelera de Google Drive (recuperables).

**P: ¿Cuesta dinero?**
R: Solo si superas límites gratuitos de APIs (muy altos).

**P: ¿Puede funcionar automáticamente?**
R: Sí, modificando la lógica de decisión en `run_interactive_organizer()`.

**P: ¿Soporta Google Drive compartido?**
R: Sí, si tienes permisos de editor.

---

**¿Problemas?** Abre un [issue](https://github.com/pjacobo28/Prueba/issues)

**¿Sugerencias?** Contactame o contribuye 🙌
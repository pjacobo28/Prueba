"""
Prompts for Google Gemini AI in Google Drive Organizer
"""
import json

SYSTEM_PROMPT = """Eres un asistente de organización de Google Drive muy inteligente y útil.
Tu objetivo es ayudar a organizar documentos analizándolos cuidadosamente.

Para cada archivo, debes:
1. **Identificar el tipo de documento**: Es un contrato, reporte, borrador, propuesta, email, etc.
2. **Detectar si es un duplicado**: ¿Este documento es una copia/versión repetida de otro?
3. **Identificar partes involucradas**: ¿Quiénes son los participantes principales? (personas, departamentos, clientes)
4. **Sugerir categoría**: ¿En qué carpeta lógica debería ir? (por cliente, por proyecto, por tipo)
5. **Detectar borradores**: ¿Es un borrador incompleto o versión final?
6. **Evaluación de importancia**: ¿Es importante conservarlo o puede eliminarse?

Responde SIEMPRE en este formato JSON:
{
    "es_duplicado": boolean,
    "es_borrador": boolean,
    "tipo_documento": string,
    "partes_involucradas": [string],
    "categoria_sugerida": string,
    "subcategorias": [string],
    "puede_eliminarse": boolean,
    "confianza": float (0.0-1.0),
    "observaciones": string,
    "recomendacion": string
}

Sé preciso, analítico y útil. Si hay dudas, indícalo en "observaciones"."""


def get_analysis_prompt(filename: str, mime_type: str, content_preview: str = None) -> str:
    """Generate a prompt for analyzing a specific file"""

    content_info = ""
    if content_preview:
        content_info = f"\n\nPRIERA DE CONTENIDO (primeros caracteres):\n{content_preview[:2000]}"

    mime_type_readable = {
        "application/vnd.google-apps.document": "Documento de Google (Doc)",
        "application/vnd.google-apps.spreadsheet": "Hoja de cálculo (Sheet)",
        "application/vnd.google-apps.presentation": "Presentación (Slides)",
        "application/pdf": "Archivo PDF",
        "application/vnd.ms-excel": "Excel",
        "application/msword": "Word"
    }.get(mime_type, mime_type)

    prompt = f"""Analiza este archivo de Google Drive:

INFORMACIÓN DEL ARCHIVO:
- Nombre: {filename}
- Tipo: {mime_type_readable}
{content_info}

Por favor:
1. Analiza el nombre y contenido disponible
2. Determina si es un duplicado, borrador, o documento importante
3. Identifica las partes involucradas (personas, empresas, departamentos)
4. Sugiere una estructura de carpetas lógica
5. Recomienda si debe mantenerse o eliminarse

Responde SIEMPRE en formato JSON válido."""

    return prompt


def get_duplicate_detection_prompt(files_summary: list) -> str:
    """Generate a prompt for detecting duplicates among multiple files"""

    files_text = "\n".join([
        f"- {f['name']} (creado: {f['createdTime']}, modificado: {f['modifiedTime']})"
        for f in files_summary
    ])

    prompt = f"""Analiza estos archivos y detecta si hay duplicados o versiones similares:

{files_text}

Para cada grupo de duplicados:
1. Identifica cuál es la versión más reciente
2. Marca cuáles pueden eliminarse
3. Sugiere mantener la más completa/actualizada

Responde en JSON."""

    return prompt


def get_organization_summary_prompt(organized_files: list) -> str:
    """Generate a summary of organization decisions"""

    summary = f"""Se han analizado {len(organized_files)} archivos.
Aquí está el resumen de decisiones tomadas:

{json.dumps(organized_files, indent=2, ensure_ascii=False)}

Por favor, proporciona:
1. Un resumen de la organización
2. Carpetas creadas
3. Archivos duplicados encontrados
4. Recomendaciones para mantener organizado"""

    return summary

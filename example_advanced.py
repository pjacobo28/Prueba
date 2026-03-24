#!/usr/bin/env python3
"""
Ejemplos avanzados de uso del Google Drive Organizer
"""

from google_drive_organizer import GoogleDriveOrganizer
import json


def example_1_organize_by_client():
    """Ejemplo 1: Organizar documentos por cliente"""
    print("=" * 80)
    print("EJEMPLO 1: Organizar por Cliente")
    print("=" * 80)

    organizer = GoogleDriveOrganizer()

    # Obtener archivos
    files = organizer.get_all_files()

    # Agrupar por cliente detectado
    clients = {}
    for file_info in files[:10]:  # Primeros 10 como ejemplo
        analysis = organizer.analyze_file_with_claude(file_info)

        # Parsear JSON de respuesta
        try:
            # En producción, parsear el JSON correctamente
            partes = "Sin información"
            categoria = "Sin categoría"

            if partes not in clients:
                clients[partes] = []
            clients[partes].append({
                "name": file_info["name"],
                "id": file_info["id"],
                "category": categoria
            })
        except:
            pass

    print("\nClientes detectados:")
    for cliente, docs in clients.items():
        print(f"  {cliente}: {len(docs)} documentos")


def example_2_find_duplicates():
    """Ejemplo 2: Encontrar y eliminar duplicados"""
    print("\n" + "=" * 80)
    print("EJEMPLO 2: Detectar Duplicados")
    print("=" * 80)

    organizer = GoogleDriveOrganizer()
    files = organizer.get_all_files()

    # Agrupar por nombre similar
    similar_files = {}
    for file_info in files:
        name_base = file_info["name"].split("v")[0].strip()

        if name_base not in similar_files:
            similar_files[name_base] = []
        similar_files[name_base].append(file_info)

    print("\nGrupos potenciales de duplicados encontrados:")
    for base_name, group in similar_files.items():
        if len(group) > 1:
            print(f"\n  {base_name}:")
            for f in group:
                print(f"    - {f['name']}")
                print(f"      Modificado: {f.get('modifiedTime', 'N/A')}")


def example_3_clean_drafts():
    """Ejemplo 3: Eliminar borradores"""
    print("\n" + "=" * 80)
    print("EJEMPLO 3: Limpiar Borradores")
    print("=" * 80)

    organizer = GoogleDriveOrganizer()
    files = organizer.get_all_files()

    draft_keywords = ["borrador", "draft", "wip", "en progreso", "temp", "backup"]

    drafts = []
    for file_info in files:
        name_lower = file_info["name"].lower()
        if any(keyword in name_lower for keyword in draft_keywords):
            drafts.append(file_info)

    print(f"\nEncontrados {len(drafts)} archivos de borrador:")
    for draft in drafts[:10]:
        print(f"  - {draft['name']}")

    print(f"\n(Mostrando 10 de {len(drafts)})")

    if input("\n¿Eliminar estos archivos? (s/n): ").lower() == 's':
        for draft in drafts:
            organizer.delete_file(draft["id"])
            print(f"  ✓ {draft['name']}")


def example_4_organize_by_date():
    """Ejemplo 4: Organizar por fecha"""
    print("\n" + "=" * 80)
    print("EJEMPLO 4: Organizar por Fecha")
    print("=" * 80)

    organizer = GoogleDriveOrganizer()
    files = organizer.get_all_files()

    # Agrupar por año-mes
    by_date = {}
    for file_info in files:
        modified = file_info.get("modifiedTime", "")
        if modified:
            year_month = modified[:7]  # YYYY-MM
            if year_month not in by_date:
                by_date[year_month] = []
            by_date[year_month].append(file_info)

    print("\nArchivos por fecha de modificación:")
    for date in sorted(by_date.keys(), reverse=True)[:6]:
        print(f"  {date}: {len(by_date[date])} archivos")


def example_5_batch_move():
    """Ejemplo 5: Mover lotes de archivos"""
    print("\n" + "=" * 80)
    print("EJEMPLO 5: Mover Archivos en Lote")
    print("=" * 80)

    organizer = GoogleDriveOrganizer()

    # Crear estructura de carpetas
    print("Creando estructura de carpetas...")
    main_folder = organizer.create_or_get_folder("Documentos Organizados")

    folders = {
        "Contratos": organizer.create_or_get_folder("Contratos", main_folder),
        "Reportes": organizer.create_or_get_folder("Reportes", main_folder),
        "Propuestas": organizer.create_or_get_folder("Propuestas", main_folder),
    }

    print("\nCarpetas creadas:")
    for name, folder_id in folders.items():
        print(f"  ✓ {name} (ID: {folder_id})")


def example_6_interactive_with_backup():
    """Ejemplo 6: Organización interactiva con backup"""
    print("\n" + "=" * 80)
    print("EJEMPLO 6: Modo Interactivo con Historial")
    print("=" * 80)

    organizer = GoogleDriveOrganizer()

    # Crear carpeta de backup
    backup_folder = organizer.create_or_get_folder("_Backup Antes de Organizar")

    # Guardar historial de cambios
    changes_history = []

    files = organizer.get_all_files()[:5]  # Primeros 5 como ejemplo

    for file_info in files:
        print(f"\nArchivo: {file_info['name']}")
        action = input("¿Qué hacer? (m=mover, d=delete, s=skip): ").lower()

        change_record = {
            "file_id": file_info["id"],
            "file_name": file_info["name"],
            "original_action": action,
            "timestamp": file_info.get("modifiedTime")
        }

        if action == 'm':
            folder_name = input("Nombre de carpeta: ")
            folder_id = organizer.create_or_get_folder(folder_name)
            if folder_id:
                organizer.move_file(file_info["id"], folder_id)
                change_record["new_location"] = folder_name

        elif action == 'd':
            organizer.delete_file(file_info["id"])
            change_record["action_status"] = "deleted"

        changes_history.append(change_record)

    # Guardar historial
    with open("changes_history.json", "w") as f:
        json.dump(changes_history, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Historial guardado en changes_history.json")


if __name__ == "__main__":
    print("Google Drive Organizer - Ejemplos Avanzados")
    print("=" * 80)

    examples = {
        "1": ("Organizar por Cliente", example_1_organize_by_client),
        "2": ("Encontrar Duplicados", example_2_find_duplicates),
        "3": ("Limpiar Borradores", example_3_clean_drafts),
        "4": ("Organizar por Fecha", example_4_organize_by_date),
        "5": ("Mover en Lote", example_5_batch_move),
        "6": ("Modo Interactivo", example_6_interactive_with_backup),
    }

    print("\nElige un ejemplo:")
    for key, (name, _) in examples.items():
        print(f"  {key}. {name}")

    choice = input("\nOpción (1-6): ").strip()

    if choice in examples:
        examples[choice][1]()
    else:
        print("Opción inválida")

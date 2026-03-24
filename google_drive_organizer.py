#!/usr/bin/env python3
"""
Google Drive Organizer with AI
Organiza automáticamente tu Google Drive usando Claude AI para análisis inteligente
"""

import os
import json
from typing import Optional
from pathlib import Path
from google.auth.transport.requests import Request
from google.oauth2.service_account import Credentials
from google.oauth2.credentials import Credentials as UserCredentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.exceptions import RefreshError
import google.auth
from googleapiclient.discovery import build
from anthropic import Anthropic
from prompts import SYSTEM_PROMPT, get_analysis_prompt

# Google Drive API scope
SCOPES = ["https://www.googleapis.com/auth/drive"]


class GoogleDriveOrganizer:
    def __init__(self, credentials_file: str = "credentials.json"):
        """Initialize the organizer with Google Drive and Claude API access"""
        self.credentials_file = credentials_file
        self.drive_service = self._authenticate_drive()
        self.anthropic = Anthropic()
        self.conversation_history = []

    def _authenticate_drive(self):
        """Authenticate with Google Drive API"""
        creds = None
        token_file = "token.json"

        # Load existing token
        if os.path.exists(token_file):
            creds = UserCredentials.from_authorized_user_file(token_file, SCOPES)

        # If no valid credentials, request user login
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.credentials_file, SCOPES
                )
                creds = flow.run_local_server(port=0)

            # Save token for future use
            with open(token_file, "w") as token:
                token.write(creds.to_json())

        return build("drive", "v3", credentials=creds)

    def get_all_files(self, folder_id: str = "root", file_types: list = None) -> list:
        """Get all files from Google Drive recursively"""
        if file_types is None:
            file_types = ["application/vnd.google-apps.document",
                         "application/vnd.google-apps.spreadsheet",
                         "application/vnd.google-apps.presentation",
                         "application/pdf"]

        query_parts = [f"'{folder_id}' in parents", "trashed=false"]
        type_query = " or ".join([f"mimeType='{ft}'" for ft in file_types])
        query = " and ".join(query_parts) + f" and ({type_query})"

        results = self.drive_service.files().list(
            q=query,
            spaces="drive",
            fields="files(id, name, mimeType, modifiedTime, owners, createdTime)",
            pageSize=1000
        ).execute()

        files = results.get("files", [])

        # Recursively get files from subfolders
        folder_query = f"'{folder_id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false"
        folders = self.drive_service.files().list(
            q=folder_query,
            spaces="drive",
            fields="files(id, name)",
            pageSize=100
        ).execute().get("files", [])

        for folder in folders:
            files.extend(self.get_all_files(folder["id"], file_types))

        return files

    def get_file_content(self, file_id: str, mime_type: str) -> Optional[str]:
        """Read file content from Google Drive"""
        try:
            if mime_type == "application/vnd.google-apps.document":
                # Export Google Doc as text
                request = self.drive_service.files().export(
                    fileId=file_id, mimeType="text/plain"
                )
                content = request.execute().decode("utf-8")
                return content[:10000]  # Limit to 10k chars

            elif mime_type == "application/pdf":
                # For PDFs, we'd need PyPDF2, for now just return metadata
                return "[PDF file - would need additional library to read]"

            elif mime_type == "application/vnd.google-apps.spreadsheet":
                return "[Spreadsheet file]"

            return None
        except Exception as e:
            print(f"Error reading file: {e}")
            return None

    def analyze_file_with_claude(self, file_info: dict) -> dict:
        """Use Claude to analyze a file and suggest organization"""
        file_id = file_info.get("id")
        file_name = file_info.get("name", "Unknown")
        mime_type = file_info.get("mimeType")

        # Try to read content for better analysis
        content_preview = self.get_file_content(file_id, mime_type)

        prompt = get_analysis_prompt(file_name, mime_type, content_preview)

        # Add to conversation for context
        self.conversation_history.append({
            "role": "user",
            "content": prompt
        })

        # Get Claude analysis
        response = self.anthropic.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1000,
            system=SYSTEM_PROMPT,
            messages=self.conversation_history
        )

        analysis_text = response.content[0].text
        self.conversation_history.append({
            "role": "assistant",
            "content": analysis_text
        })

        return {
            "file_id": file_id,
            "file_name": file_name,
            "analysis": analysis_text,
            "mime_type": mime_type
        }

    def ask_user_decision(self, analysis: dict) -> dict:
        """Ask user for decision on file organization"""
        print("\n" + "="*80)
        print(f"Archivo: {analysis['file_name']}")
        print("-"*80)
        print(f"Análisis de Claude:")
        print(analysis["analysis"])
        print("-"*80)

        decision = input("\n¿Qué hacer con este archivo?\n"
                        "1. Mover a carpeta [nombre]\n"
                        "2. Eliminar\n"
                        "3. Mantener donde está\n"
                        "4. Mostrar más análisis\n"
                        "Tu decisión: ").strip()

        return {
            "file_id": analysis["file_id"],
            "decision": decision,
            "file_name": analysis["file_name"]
        }

    def move_file(self, file_id: str, destination_folder_id: str):
        """Move a file to a folder"""
        try:
            file = self.drive_service.files().get(
                fileId=file_id, fields="parents"
            ).execute()
            previous_parents = ",".join(file.get("parents", []))

            file = self.drive_service.files().update(
                fileId=file_id,
                addParents=destination_folder_id,
                removeParents=previous_parents,
                fields="id, parents"
            ).execute()
            print(f"✓ Archivo movido exitosamente")
            return True
        except Exception as e:
            print(f"✗ Error moviendo archivo: {e}")
            return False

    def delete_file(self, file_id: str):
        """Delete a file (move to trash)"""
        try:
            self.drive_service.files().delete(fileId=file_id).execute()
            print(f"✓ Archivo eliminado")
            return True
        except Exception as e:
            print(f"✗ Error eliminando archivo: {e}")
            return False

    def create_or_get_folder(self, folder_name: str, parent_id: str = "root") -> str:
        """Create a folder or get its ID if exists"""
        try:
            # Check if folder exists
            query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and '{parent_id}' in parents and trashed=false"
            results = self.drive_service.files().list(
                q=query, spaces="drive", fields="files(id)"
            ).execute()

            files = results.get("files", [])
            if files:
                return files[0]["id"]

            # Create new folder
            file_metadata = {
                "name": folder_name,
                "mimeType": "application/vnd.google-apps.folder",
                "parents": [parent_id]
            }
            folder = self.drive_service.files().create(
                body=file_metadata, fields="id"
            ).execute()
            print(f"✓ Carpeta creada: {folder_name}")
            return folder.get("id")
        except Exception as e:
            print(f"✗ Error creando carpeta: {e}")
            return None

    def run_interactive_organizer(self):
        """Run the interactive organization process"""
        print("🚀 Google Drive Organizer AI iniciado")
        print("Obteniendo archivos...")

        files = self.get_all_files()
        print(f"Encontrados {len(files)} archivos")

        organized_count = 0
        deleted_count = 0

        for i, file_info in enumerate(files, 1):
            print(f"\n[{i}/{len(files)}] Analizando: {file_info['name']}")

            # Analyze with Claude
            analysis = self.analyze_file_with_claude(file_info)

            # Get user decision
            decision = self.ask_user_decision(analysis)

            if decision["decision"] == "2":
                if self.delete_file(file_info["id"]):
                    deleted_count += 1
            elif decision["decision"] == "1":
                folder_name = input("Nombre de la carpeta destino: ").strip()
                folder_id = self.create_or_get_folder(folder_name)
                if folder_id and self.move_file(file_info["id"], folder_id):
                    organized_count += 1

            # Ask if continue
            if (i % 5 == 0):
                cont = input(f"\n¿Continuar? (s/n): ").strip().lower()
                if cont != 's':
                    break

        print("\n" + "="*80)
        print(f"✓ Organizados: {organized_count} archivos")
        print(f"✓ Eliminados: {deleted_count} archivos")
        print("="*80)


def main():
    """Main entry point"""
    try:
        organizer = GoogleDriveOrganizer()
        organizer.run_interactive_organizer()
    except FileNotFoundError:
        print("Error: credentials.json no encontrado")
        print("1. Ve a https://console.cloud.google.com")
        print("2. Crea un proyecto y habilita Google Drive API")
        print("3. Crea credenciales OAuth 2.0 (Desktop application)")
        print("4. Descarga el JSON y renómbralo a 'credentials.json'")


if __name__ == "__main__":
    main()

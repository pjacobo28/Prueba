#!/usr/bin/env python3
"""MCP Server for Google Drive.

Provides tools to interact with Google Drive:
- list_files: List files in a folder
- search_files: Search files by name or content
- get_file_metadata: Get metadata for a specific file
- read_file: Read text content of a file
- create_file: Create a new file
- update_file: Update file content
- delete_file: Delete a file
- create_folder: Create a new folder
- list_shared_drives: List shared drives
"""

import asyncio
import json
import os
import sys
from pathlib import Path
from typing import Any

import httplib2
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaFileUpload, MediaInMemoryUpload
import mcp.server.stdio
import mcp.types as types
from mcp.server import NotificationOptions, Server
from mcp.server.models import InitializationOptions

# Scopes required for Google Drive access
SCOPES = [
    "https://www.googleapis.com/auth/drive",
]

CREDENTIALS_FILE = os.environ.get("GDRIVE_CREDENTIALS_FILE", "credentials.json")
TOKEN_FILE = os.environ.get("GDRIVE_TOKEN_FILE", "token.json")


def get_drive_service():
    """Authenticate and return a Google Drive service object."""
    creds = None

    if Path(TOKEN_FILE).exists():
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not Path(CREDENTIALS_FILE).exists():
                raise FileNotFoundError(
                    f"Credentials file not found: {CREDENTIALS_FILE}\n"
                    "Please download OAuth 2.0 credentials from Google Cloud Console "
                    "and save as credentials.json"
                )
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)

        with open(TOKEN_FILE, "w") as token:
            token.write(creds.to_json())

    return build("drive", "v3", credentials=creds)


# Initialize MCP server
server = Server("mcp-google-drive")


@server.list_tools()
async def handle_list_tools() -> list[types.Tool]:
    """Return the list of available tools."""
    return [
        types.Tool(
            name="list_files",
            description="List files and folders in Google Drive. Optionally filter by parent folder.",
            inputSchema={
                "type": "object",
                "properties": {
                    "folder_id": {
                        "type": "string",
                        "description": "ID of the folder to list. Defaults to 'root'.",
                    },
                    "page_size": {
                        "type": "integer",
                        "description": "Maximum number of files to return (1-1000). Defaults to 100.",
                        "default": 100,
                    },
                    "include_trashed": {
                        "type": "boolean",
                        "description": "Include trashed files. Defaults to false.",
                        "default": False,
                    },
                },
            },
        ),
        types.Tool(
            name="search_files",
            description="Search for files in Google Drive by name or full-text query.",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query. Can be a filename, or a Google Drive query string (e.g. \"name contains 'report'\" or \"mimeType='application/pdf'\").",
                    },
                    "page_size": {
                        "type": "integer",
                        "description": "Maximum number of results to return (1-1000). Defaults to 50.",
                        "default": 50,
                    },
                },
                "required": ["query"],
            },
        ),
        types.Tool(
            name="get_file_metadata",
            description="Get metadata for a specific file or folder by its ID.",
            inputSchema={
                "type": "object",
                "properties": {
                    "file_id": {
                        "type": "string",
                        "description": "The ID of the file or folder.",
                    },
                },
                "required": ["file_id"],
            },
        ),
        types.Tool(
            name="read_file",
            description="Read the text content of a file from Google Drive. Supports plain text, Google Docs (exported as text), and other text-based formats.",
            inputSchema={
                "type": "object",
                "properties": {
                    "file_id": {
                        "type": "string",
                        "description": "The ID of the file to read.",
                    },
                },
                "required": ["file_id"],
            },
        ),
        types.Tool(
            name="create_file",
            description="Create a new text file in Google Drive.",
            inputSchema={
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Name of the file to create.",
                    },
                    "content": {
                        "type": "string",
                        "description": "Text content of the file.",
                    },
                    "folder_id": {
                        "type": "string",
                        "description": "ID of the parent folder. Defaults to root.",
                    },
                    "mime_type": {
                        "type": "string",
                        "description": "MIME type of the file. Defaults to 'text/plain'.",
                        "default": "text/plain",
                    },
                },
                "required": ["name", "content"],
            },
        ),
        types.Tool(
            name="update_file",
            description="Update the content of an existing file in Google Drive.",
            inputSchema={
                "type": "object",
                "properties": {
                    "file_id": {
                        "type": "string",
                        "description": "The ID of the file to update.",
                    },
                    "content": {
                        "type": "string",
                        "description": "New text content for the file.",
                    },
                    "new_name": {
                        "type": "string",
                        "description": "Optional new name for the file.",
                    },
                },
                "required": ["file_id", "content"],
            },
        ),
        types.Tool(
            name="delete_file",
            description="Delete a file or folder from Google Drive (moves to trash).",
            inputSchema={
                "type": "object",
                "properties": {
                    "file_id": {
                        "type": "string",
                        "description": "The ID of the file or folder to delete.",
                    },
                    "permanent": {
                        "type": "boolean",
                        "description": "If true, permanently delete instead of moving to trash. Defaults to false.",
                        "default": False,
                    },
                },
                "required": ["file_id"],
            },
        ),
        types.Tool(
            name="create_folder",
            description="Create a new folder in Google Drive.",
            inputSchema={
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Name of the folder to create.",
                    },
                    "parent_folder_id": {
                        "type": "string",
                        "description": "ID of the parent folder. Defaults to root.",
                    },
                },
                "required": ["name"],
            },
        ),
        types.Tool(
            name="list_shared_drives",
            description="List all shared drives accessible to the authenticated user.",
            inputSchema={
                "type": "object",
                "properties": {
                    "page_size": {
                        "type": "integer",
                        "description": "Maximum number of shared drives to return. Defaults to 20.",
                        "default": 20,
                    },
                },
            },
        ),
    ]


@server.call_tool()
async def handle_call_tool(
    name: str, arguments: dict[str, Any] | None
) -> list[types.TextContent]:
    """Handle tool calls."""
    if arguments is None:
        arguments = {}

    try:
        service = get_drive_service()
    except FileNotFoundError as e:
        return [types.TextContent(type="text", text=f"Authentication error: {e}")]

    try:
        if name == "list_files":
            return await _list_files(service, arguments)
        elif name == "search_files":
            return await _search_files(service, arguments)
        elif name == "get_file_metadata":
            return await _get_file_metadata(service, arguments)
        elif name == "read_file":
            return await _read_file(service, arguments)
        elif name == "create_file":
            return await _create_file(service, arguments)
        elif name == "update_file":
            return await _update_file(service, arguments)
        elif name == "delete_file":
            return await _delete_file(service, arguments)
        elif name == "create_folder":
            return await _create_folder(service, arguments)
        elif name == "list_shared_drives":
            return await _list_shared_drives(service, arguments)
        else:
            return [types.TextContent(type="text", text=f"Unknown tool: {name}")]
    except HttpError as e:
        return [types.TextContent(type="text", text=f"Google Drive API error: {e}")]


async def _list_files(
    service, args: dict
) -> list[types.TextContent]:
    folder_id = args.get("folder_id", "root")
    page_size = min(args.get("page_size", 100), 1000)
    include_trashed = args.get("include_trashed", False)

    q = f"'{folder_id}' in parents"
    if not include_trashed:
        q += " and trashed=false"

    results = (
        service.files()
        .list(
            q=q,
            pageSize=page_size,
            fields="files(id, name, mimeType, size, modifiedTime, createdTime, parents, webViewLink)",
        )
        .execute()
    )

    files = results.get("files", [])
    if not files:
        return [types.TextContent(type="text", text="No files found.")]

    lines = [f"Found {len(files)} item(s):\n"]
    for f in files:
        size = f.get("size", "N/A")
        mime = f.get("mimeType", "")
        is_folder = mime == "application/vnd.google-apps.folder"
        icon = "[DIR]" if is_folder else "[FILE]"
        lines.append(
            f"{icon} {f['name']}\n"
            f"  ID: {f['id']}\n"
            f"  Type: {mime}\n"
            f"  Size: {size} bytes\n"
            f"  Modified: {f.get('modifiedTime', 'N/A')}\n"
            f"  Link: {f.get('webViewLink', 'N/A')}\n"
        )

    return [types.TextContent(type="text", text="\n".join(lines))]


async def _search_files(
    service, args: dict
) -> list[types.TextContent]:
    query = args["query"]
    page_size = min(args.get("page_size", 50), 1000)

    # If query doesn't look like a Drive query expression, treat it as a name search
    if not any(op in query for op in ["contains", "=", ">", "<", "and", "or", "not"]):
        q = f"name contains '{query}' and trashed=false"
    else:
        q = query

    results = (
        service.files()
        .list(
            q=q,
            pageSize=page_size,
            fields="files(id, name, mimeType, size, modifiedTime, parents, webViewLink)",
        )
        .execute()
    )

    files = results.get("files", [])
    if not files:
        return [types.TextContent(type="text", text=f"No files found matching: {query}")]

    lines = [f"Found {len(files)} result(s) for '{query}':\n"]
    for f in files:
        lines.append(
            f"- {f['name']}\n"
            f"  ID: {f['id']}\n"
            f"  Type: {f.get('mimeType', 'N/A')}\n"
            f"  Modified: {f.get('modifiedTime', 'N/A')}\n"
            f"  Link: {f.get('webViewLink', 'N/A')}\n"
        )

    return [types.TextContent(type="text", text="\n".join(lines))]


async def _get_file_metadata(
    service, args: dict
) -> list[types.TextContent]:
    file_id = args["file_id"]

    file = (
        service.files()
        .get(
            fileId=file_id,
            fields="id, name, mimeType, size, modifiedTime, createdTime, parents, webViewLink, description, owners, shared, starred",
        )
        .execute()
    )

    owners = ", ".join(
        o.get("displayName", o.get("emailAddress", "Unknown"))
        for o in file.get("owners", [])
    )

    text = (
        f"File Metadata:\n"
        f"  Name: {file.get('name')}\n"
        f"  ID: {file.get('id')}\n"
        f"  Type: {file.get('mimeType')}\n"
        f"  Size: {file.get('size', 'N/A')} bytes\n"
        f"  Created: {file.get('createdTime', 'N/A')}\n"
        f"  Modified: {file.get('modifiedTime', 'N/A')}\n"
        f"  Owners: {owners}\n"
        f"  Shared: {file.get('shared', False)}\n"
        f"  Starred: {file.get('starred', False)}\n"
        f"  Description: {file.get('description', 'N/A')}\n"
        f"  Web Link: {file.get('webViewLink', 'N/A')}\n"
        f"  Parents: {', '.join(file.get('parents', []))}\n"
    )

    return [types.TextContent(type="text", text=text)]


# MIME type mappings for Google Workspace files -> export formats
GOOGLE_MIME_EXPORT_MAP = {
    "application/vnd.google-apps.document": "text/plain",
    "application/vnd.google-apps.spreadsheet": "text/csv",
    "application/vnd.google-apps.presentation": "text/plain",
    "application/vnd.google-apps.drawing": "image/svg+xml",
}


async def _read_file(
    service, args: dict
) -> list[types.TextContent]:
    file_id = args["file_id"]

    # Get file metadata first to determine MIME type
    file_meta = service.files().get(fileId=file_id, fields="name, mimeType, size").execute()
    mime_type = file_meta.get("mimeType", "")
    name = file_meta.get("name", file_id)

    if mime_type in GOOGLE_MIME_EXPORT_MAP:
        # Export Google Workspace formats
        export_mime = GOOGLE_MIME_EXPORT_MAP[mime_type]
        content = service.files().export(fileId=file_id, mimeType=export_mime).execute()
        if isinstance(content, bytes):
            content = content.decode("utf-8", errors="replace")
    elif mime_type.startswith("text/") or mime_type in (
        "application/json",
        "application/xml",
        "application/javascript",
    ):
        # Download text files directly
        content = service.files().get_media(fileId=file_id).execute()
        if isinstance(content, bytes):
            content = content.decode("utf-8", errors="replace")
    else:
        return [
            types.TextContent(
                type="text",
                text=f"Cannot read file '{name}' as text. MIME type: {mime_type}\n"
                     f"Only text files and Google Workspace documents are supported.",
            )
        ]

    size = len(content)
    preview = content[:5000] if size > 5000 else content
    suffix = f"\n\n[... content truncated, {size} total chars ...]" if size > 5000 else ""

    return [
        types.TextContent(
            type="text",
            text=f"Content of '{name}':\n\n{preview}{suffix}",
        )
    ]


async def _create_file(
    service, args: dict
) -> list[types.TextContent]:
    name = args["name"]
    content = args["content"]
    folder_id = args.get("folder_id")
    mime_type = args.get("mime_type", "text/plain")

    file_metadata: dict[str, Any] = {"name": name}
    if folder_id:
        file_metadata["parents"] = [folder_id]

    media = MediaInMemoryUpload(content.encode("utf-8"), mimetype=mime_type)

    file = (
        service.files()
        .create(
            body=file_metadata,
            media_body=media,
            fields="id, name, webViewLink",
        )
        .execute()
    )

    return [
        types.TextContent(
            type="text",
            text=f"File created successfully:\n"
                 f"  Name: {file['name']}\n"
                 f"  ID: {file['id']}\n"
                 f"  Link: {file.get('webViewLink', 'N/A')}",
        )
    ]


async def _update_file(
    service, args: dict
) -> list[types.TextContent]:
    file_id = args["file_id"]
    content = args["content"]
    new_name = args.get("new_name")

    file_metadata: dict[str, Any] = {}
    if new_name:
        file_metadata["name"] = new_name

    # Get current MIME type
    current = service.files().get(fileId=file_id, fields="mimeType, name").execute()
    mime_type = current.get("mimeType", "text/plain")
    if mime_type.startswith("application/vnd.google-apps"):
        mime_type = "text/plain"

    media = MediaInMemoryUpload(content.encode("utf-8"), mimetype=mime_type)

    file = (
        service.files()
        .update(
            fileId=file_id,
            body=file_metadata,
            media_body=media,
            fields="id, name, webViewLink",
        )
        .execute()
    )

    return [
        types.TextContent(
            type="text",
            text=f"File updated successfully:\n"
                 f"  Name: {file['name']}\n"
                 f"  ID: {file['id']}\n"
                 f"  Link: {file.get('webViewLink', 'N/A')}",
        )
    ]


async def _delete_file(
    service, args: dict
) -> list[types.TextContent]:
    file_id = args["file_id"]
    permanent = args.get("permanent", False)

    file_meta = service.files().get(fileId=file_id, fields="name").execute()
    name = file_meta.get("name", file_id)

    if permanent:
        service.files().delete(fileId=file_id).execute()
        return [
            types.TextContent(
                type="text",
                text=f"File '{name}' (ID: {file_id}) permanently deleted.",
            )
        ]
    else:
        service.files().update(fileId=file_id, body={"trashed": True}).execute()
        return [
            types.TextContent(
                type="text",
                text=f"File '{name}' (ID: {file_id}) moved to trash.",
            )
        ]


async def _create_folder(
    service, args: dict
) -> list[types.TextContent]:
    name = args["name"]
    parent_folder_id = args.get("parent_folder_id")

    file_metadata: dict[str, Any] = {
        "name": name,
        "mimeType": "application/vnd.google-apps.folder",
    }
    if parent_folder_id:
        file_metadata["parents"] = [parent_folder_id]

    folder = (
        service.files()
        .create(body=file_metadata, fields="id, name, webViewLink")
        .execute()
    )

    return [
        types.TextContent(
            type="text",
            text=f"Folder created successfully:\n"
                 f"  Name: {folder['name']}\n"
                 f"  ID: {folder['id']}\n"
                 f"  Link: {folder.get('webViewLink', 'N/A')}",
        )
    ]


async def _list_shared_drives(
    service, args: dict
) -> list[types.TextContent]:
    page_size = min(args.get("page_size", 20), 100)

    results = (
        service.drives()
        .list(pageSize=page_size, fields="drives(id, name, createdTime)")
        .execute()
    )

    drives = results.get("drives", [])
    if not drives:
        return [types.TextContent(type="text", text="No shared drives found.")]

    lines = [f"Found {len(drives)} shared drive(s):\n"]
    for d in drives:
        lines.append(
            f"- {d['name']}\n"
            f"  ID: {d['id']}\n"
            f"  Created: {d.get('createdTime', 'N/A')}\n"
        )

    return [types.TextContent(type="text", text="\n".join(lines))]


async def main():
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="mcp-google-drive",
                server_version="1.0.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={},
                ),
            ),
        )


if __name__ == "__main__":
    asyncio.run(main())

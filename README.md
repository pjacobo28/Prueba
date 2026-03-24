# MCP Server: Google Drive

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that enables Claude to interact with Google Drive. Read, search, create, update, and delete files and folders directly from your conversations.

## Features

- **list_files** — List files and folders in any Drive folder
- **search_files** — Search by name or advanced Drive query
- **get_file_metadata** — Retrieve detailed metadata for any file
- **read_file** — Read text content (plain text, Google Docs, Sheets as CSV, etc.)
- **create_file** — Create new text files in Drive
- **update_file** — Update content or rename existing files
- **delete_file** — Move to trash or permanently delete
- **create_folder** — Create new folders
- **list_shared_drives** — List accessible shared drives

## Setup

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Create Google Cloud credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Enable the **Google Drive API**:
   - Navigate to **APIs & Services → Library**
   - Search for "Google Drive API" and click **Enable**
4. Create OAuth 2.0 credentials:
   - Navigate to **APIs & Services → Credentials**
   - Click **Create Credentials → OAuth client ID**
   - Select **Desktop app** as the application type
   - Download the credentials JSON file
5. Save the downloaded file as `credentials.json` in this directory

### 3. First-time authentication

Run the server once manually to complete the OAuth flow:

```bash
python server.py
```

A browser window will open asking you to sign in to Google and grant access. After authorizing, a `token.json` file will be created automatically for future sessions.

### 4. Configure Claude Desktop (or Claude Code)

Add the server to your MCP configuration. For **Claude Desktop**, edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "google-drive": {
      "command": "python",
      "args": ["/absolute/path/to/server.py"],
      "env": {
        "GDRIVE_CREDENTIALS_FILE": "/absolute/path/to/credentials.json",
        "GDRIVE_TOKEN_FILE": "/absolute/path/to/token.json"
      }
    }
  }
}
```

For **Claude Code**, add to `.claude/mcp.json` in your project or `~/.claude/mcp.json` globally:

```json
{
  "mcpServers": {
    "google-drive": {
      "command": "python",
      "args": ["/absolute/path/to/server.py"]
    }
  }
}
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `GDRIVE_CREDENTIALS_FILE` | `credentials.json` | Path to OAuth client credentials |
| `GDRIVE_TOKEN_FILE` | `token.json` | Path where the access token is stored |

## Usage Examples

Once configured, you can ask Claude:

- *"List all files in my Google Drive root folder"*
- *"Search for files named 'budget'"*
- *"Read the contents of file ID `1abc...`"*
- *"Create a file called 'notes.txt' with the content 'Hello World'"*
- *"Delete the file with ID `1abc...`"*
- *"Create a folder called 'Projects' in my Drive"*

## Security Notes

- `credentials.json` and `token.json` contain sensitive authentication data — **never commit them to version control**
- Add both files to your `.gitignore`
- The server requests full Drive access (`drive` scope). For read-only use, change the scope to `drive.readonly` in `server.py`

## Requirements

- Python 3.10+
- A Google account with Google Drive
- Google Cloud project with Drive API enabled

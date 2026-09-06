# SanzzOS Desktop App

SanzzOS can run as a Windows 11 desktop app through Electron.

## Start Desktop App Locally

```powershell
cmd /c npm run desktop
```

This builds the frontend/backend, starts the backend inside Electron on port `5000`, serves the frontend on `127.0.0.1:5174`, and opens the SanzzOS window.

## Create Windows Installer

```powershell
cmd /c npm run desktop:installer
```

The installer output is written to `release/`.

## Groq Key

During local development, the desktop app reads `backend/.env`.

For an installed app, it also creates a private config file at:

```text
%APPDATA%\SanzzOS\.env
```

Paste your key there if the installed app needs Groq:

```env
GROQ_API_KEY=your_real_key_here
```

Do not commit API keys.

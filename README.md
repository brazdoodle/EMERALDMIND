# EMERALDMIND

This app was is a Vite + React app with optional local LLM support via Ollama.

This README focuses on getting a local Ollama instance working with this repository and the common troubleshooting steps a beginner will need.

Prerequisites
- Node 18+ (for ESM support in `tools/*` scripts)
- npm (comes with Node)
- A local Ollama installation (see steps below)

Quick start (summary)
1. Install dependencies: `npm install`
2. Install and run Ollama locally (see instructions below)
3. (optional) Start the repo proxy: `node tools/ollama_proxy.js --port 11435`
4. Point the app at your Ollama URL and run: set env and `npm run dev`

Full instructions

1) Install Ollama on Windows

- Visit https://ollama.com and follow the Windows installer instructions.
- After installation, confirm the `ollama` CLI (or service) is available per the installer guidance. The commands below assume the Ollama HTTP API listens at `http://localhost:11434`.

2) Pull / make a model available

Ollama setups might require you to pull or run a model so `:11434` can serve generation requests. The exact commands vary by Ollama version; example (replace with the model you have access to):

```powershell
# Example - this depends on your Ollama distribution and available models
# Pull or prepare a model so the server can serve it
ollama pull gpt-oss:20b

# Confirm the model list is available from the server
curl.exe -sS http://localhost:11434/v1/models | Out-String
```

If you don't have a model available, check the Ollama docs or UI for model installation instructions.

3) Install repo dependencies

```powershell
npm install
```

4) Optional: run the included proxy (useful for debugging)

This repo includes a small proxy at `tools/ollama_proxy.js` which forwards `http://localhost:11435` -> `http://localhost:11434` and logs requests to `tmp/ollama_proxy.log`. Running the proxy is optional but helpful when debugging connectivity between your browser and Ollama.

Start the proxy in a terminal so you can watch logs live:

```powershell
node tools/ollama_proxy.js --port 11435
# or explicitly set the target
node tools/ollama_proxy.js --port 11435 --target http://localhost:11434
```

If the proxy exits immediately or prints an error, check `tmp/ollama_proxy.log`. Make sure you're using Node 18+ and that `package.json` contains `"type": "module"` (the project already does).

5) Run the app and point it to Ollama

Set the Vite env var `VITE_OLLAMA_URL` to point at your Ollama URL (direct or proxy) and the `VITE_OLLAMA_MODEL` to the model id, then start the dev server.

```powershell
# Direct to Ollama
$env:VITE_OLLAMA_URL = 'http://localhost:11434'
$env:VITE_OLLAMA_MODEL = 'gpt-oss:20b'
npm run dev

# OR use the proxy
$env:VITE_OLLAMA_URL = 'http://localhost:11435'
$env:VITE_OLLAMA_MODEL = 'gpt-oss:20b'
npm run dev
```

The Vite dev server will print the local URL (usually `http://localhost:5173`) — open that in your browser.

6) Test the Ollama API directly (useful for debugging)

```powershell
# Check models
curl.exe -sS http://localhost:11434/v1/models | Out-String

# Quick generate (direct to Ollama)
curl.exe -sS -X POST "http://localhost:11434/api/generate" -H "Content-Type: application/json" -d '{"model":"gpt-oss:20b","prompt":"Return only JSON: {\"a\":1}","temperature":0.1,"max_tokens":50}' | Out-String
```

Note: Ollama may stream NDJSON; the app's client assembles and sanitizes NDJSON streams and filters short 'thinking' fragments before presenting results.

7) Quick Lab Assistant example (once the app is running)

1. Open the app in the browser at the Vite dev URL (e.g., `http://localhost:5173`).
2. Navigate to the Lab Assistant (`#/lab-assistant`).
3. Ask a question, for example: "How do I create a script that gives an item to the player?"

If the assistant returns malformed output, click the Retry option in the UI (it triggers a stricter, low-temperature retry that is more likely to return valid JSON or a single fenced code block).

8) Troubleshooting tips

- "AI Service Unavailable" or network errors: ensure Ollama is running and `VITE_OLLAMA_URL` is pointing to the correct host/port. If you use the proxy, ensure the proxy is running and reachable at `:11435`.
- Proxy exits or connection refused: check `tmp/ollama_proxy.log` for errors. If the proxy cannot start, verify no other process is bound to `11435` and that your Node version supports ESM.
- Model not found / model errors: confirm the model id set in `VITE_OLLAMA_MODEL` is available to the local Ollama instance (use the `/v1/models` endpoint to inspect available models).
- Parsing / JSON errors from model outputs: the app includes automatic post-processing and a strict retry. If problems persist, I can add stronger repairs or a safe fallback evaluator for `TrainerArchitect` responses.

9) Convenience scripts

- Start the proxy using the included npm script:

```powershell
npm run proxy
```

- If you'd like a cross-platform `dev:local` script that starts both proxy and dev server together I can add it (requires a small dev dependency like `concurrently`).

One-command local dev (Windows, no extra deps)

There is a one-command flow that starts the proxy in the background and runs the Vite dev server. This Windows-friendly script does not require adding extra dependencies.

Run:

```powershell
npm run dev:local
```

This will start `tools/ollama_proxy.js` in the background and then start the Vite dev server with `VITE_OLLAMA_URL` set to `http://localhost:11435`.

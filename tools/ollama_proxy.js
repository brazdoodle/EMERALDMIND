#!/usr/bin/env node
// Simple proxy to forward requests to a local Ollama server and log requests/responses
// Usage: node tools/ollama_proxy.js [--target http://localhost:11434] [--port 11435]

import http from 'http';
import { URL, fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
let TARGET = 'http://localhost:11434';
let PORT = 11435;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--target' && args[i+1]) { TARGET = args[i+1]; i++; }
  if (args[i] === '--port' && args[i+1]) { PORT = parseInt(args[i+1], 10); i++; }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logDir = path.resolve(__dirname, '..', 'tmp');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
const logPath = path.join(logDir, 'ollama_proxy.log');

function log(line) {
  const ts = new Date().toISOString();
  fs.appendFileSync(logPath, `[${ts}] ${line}\n`);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, TARGET);
    const targetUrl = new URL(url.pathname + url.search, TARGET).toString();

    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString('utf8');

    log(`REQUEST ${req.method} ${req.url} -> ${targetUrl}`);
    if (body) log(`REQ_BODY ${body.slice(0,20000)}`);

    const parsedTarget = new URL(targetUrl);
    const opts = {
      hostname: parsedTarget.hostname,
      port: parsedTarget.port || (parsedTarget.protocol === 'https:' ? 443 : 80),
      path: parsedTarget.pathname + parsedTarget.search,
      method: req.method,
      headers: { ...req.headers }
    };

    const proxyReq = http.request(opts, proxyRes => {
      const resChunks = [];
      proxyRes.on('data', c => resChunks.push(c));
      proxyRes.on('end', () => {
        const respBody = Buffer.concat(resChunks).toString('utf8');
        log(`RESPONSE ${proxyRes.statusCode} ${proxyRes.statusMessage} for ${req.method} ${req.url}`);
        if (respBody) log(`RESP_BODY ${respBody.slice(0,20000)}`);

        // copy headers
        Object.keys(proxyRes.headers).forEach(h => res.setHeader(h, proxyRes.headers[h]));
        res.statusCode = proxyRes.statusCode;
        res.end(respBody);
      });
    });

    proxyReq.on('error', e => {
      log(`PROXY_ERROR ${e.message}`);
      res.statusCode = 502;
      res.end(`Proxy error: ${e.message}`);
    });

    if (body) proxyReq.write(body);
    proxyReq.end();

  } catch (e) {
    log(`SERVER_ERROR ${e.stack || e.message}`);
    console.error('Proxy server error:', e);
    res.statusCode = 500;
    res.end(`Server error: ${e.message}`);
  }
});

server.listen(PORT, () => {
  const msg = `Ollama proxy listening on http://localhost:${PORT}, forwarding to ${TARGET}`;
  console.log(msg);
  log(msg);
  try {
    // also write a startup marker with pid
    const pidPath = path.resolve(__dirname, '..', 'tmp', 'ollama_proxy.pid');
    fs.appendFileSync(pidPath, `${new Date().toISOString()} PID:${process.pid} PORT:${PORT} TARGET:${TARGET}\n`);
  } catch (e) {
    // ignore pid write errors
  }
});

process.on('uncaughtException', (err) => {
  try { log(`UNCAUGHT_EXCEPTION ${err.stack || err.message}`); } catch (e) {}
  console.error('Uncaught exception in proxy:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  try { log(`UNHANDLED_REJECTION ${reason && reason.stack ? reason.stack : String(reason)}`); } catch (e) {}
  console.error('Unhandled rejection in proxy:', reason);
  process.exit(1);
});

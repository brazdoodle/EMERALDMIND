#!/usr/bin/env node
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
let TARGET = 'http://localhost:11434';
let PORT = 11435;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--target' && args[i+1]) { TARGET = args[i+1]; i++; }
  if (args[i] === '--port' && args[i+1]) { PORT = parseInt(args[i+1], 10); i++; }
}

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
    log(`SERVER_ERROR ${e.message}`);
    res.statusCode = 500;
    res.end(`Server error: ${e.message}`);
  }
});

server.listen(PORT, () => {
  console.log(`Ollama proxy listening on http://localhost:${PORT}, forwarding to ${TARGET}`);
  log(`Proxy started on port ${PORT} -> ${TARGET}`);
});

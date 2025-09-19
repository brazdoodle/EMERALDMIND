import fetch from 'node-fetch';

const BASE = process.env.OLLAMA_URL || 'http://localhost:11435';

async function listModels() {
  const url = `${BASE}/v1/models`;
  try {
    const r = await fetch(url);
    const txt = await r.text();
    console.log('LIST MODELS STATUS', r.status);
    console.log(txt.slice(0,2000));
  } catch (e) {
    console.error('LIST MODELS ERROR', e.message);
  }
}

async function generate() {
  const url = `${BASE}/api/generate`;
  const body = { model: 'gpt-oss:20b', prompt: 'Return only JSON: {"a":1,"b":[1,2,3]}', temperature:0.1, max_tokens:200 };
  try {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(body) });
    console.log('GENERATE STATUS', r.status);
    const txt = await r.text();
    console.log('GENERATE BODY (first 4000 chars)');
    console.log(txt.slice(0,4000));
  } catch (e) {
    console.error('GENERATE ERROR', e.message);
  }
}

(async ()=>{
  await listModels();
  await generate();
})();

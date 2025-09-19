import { pathToFileURL } from 'url';
import { fileURLToPath } from 'url';

(async ()=>{
  try {
  const client = await import('./src/api/ollamaClient.js');
    const names = ['gpt-oss:20b','gpt-oss20b','gpt_oss_20b','GPT-OSS20B'];
    for (const name of names) {
      console.log('\nCALL model:', name);
      try {
        const out = await client.default.callOllama({ prompt: 'Return only JSON: {"a":1,"b":[1,2,3]}', model: name, temperature: 0.1, max_tokens: 200 });
        console.log('OUT keys:', Object.keys(out));
        console.log('CONTENT sample:', (out.content || '').slice(0,400));
        if (out.ndjson) console.log('NDJSON pieces:', out.ndjson.length);
      } catch (e) {
        console.error('ERR', e && e.message);
      }
    }
  } catch (e) {
    console.error('IMPORT ERR', e && e.message);
  }
})();

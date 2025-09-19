const endpoints = [
  { method: 'POST', url: 'http://localhost:11434/v1/generate', body: { model: 'gpt-oss:20b', prompt: 'Return only JSON: {"a":1,"b":[1,2,3]}', temperature: 0.1, max_tokens: 200 } },
  { method: 'POST', url: 'http://localhost:11434/api/generate', body: { model: 'gpt-oss:20b', prompt: 'Return only JSON: {"a":1,"b":[1,2,3]}', temperature: 0.1, max_tokens: 200 } },
  { method: 'POST', url: 'http://localhost:11434/v1/llms/gpt-oss:20b/completions', body: { prompt: 'Return only JSON: {"a":1,"b":[1,2,3]}', temperature: 0.1, max_tokens: 200 } },
  { method: 'POST', url: 'http://localhost:11434/v1/engines/gpt-oss:20b/completions', body: { prompt: 'Return only JSON: {"a":1,"b":[1,2,3]}', temperature: 0.1, max_tokens: 200 } },
  { method: 'GET', url: 'http://localhost:11434/api/generate?model=' + encodeURIComponent('gpt-oss:20b') + '&prompt=' + encodeURIComponent('Return only JSON: {"a":1,"b":[1,2,3]}') },
  { method: 'GET', url: 'http://localhost:11434/v1/generate?model=' + encodeURIComponent('gpt-oss:20b') + '&prompt=' + encodeURIComponent('Return only JSON: {"a":1,"b":[1,2,3]}') }
];

(async ()=>{
  for (const ep of endpoints) {
    try {
      console.log('\nTRY', ep.method, ep.url);
      const opts = { method: ep.method };
      if (ep.method === 'POST') {
        opts.headers = { 'content-type': 'application/json' };
        opts.body = JSON.stringify(ep.body);
      }
      const r = await fetch(ep.url, opts).catch(e=>{ console.error('ERR FETCH', e.message); return null; });
      if (!r) continue;
      console.log('STATUS', r.status, r.statusText);
      const txt = await r.text();
      console.log('LEN', txt.length);
      console.log(txt.slice(0,2000));
    } catch (e) {
      console.error('ERR', e && e.message);
    }
  }
})();

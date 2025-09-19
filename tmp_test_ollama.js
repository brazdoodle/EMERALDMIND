(async ()=>{
  try {
  const res = await fetch('http://localhost:11434/v1/llms/gpt-oss:20b/completions',{
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-oss:20b', prompt: 'Return only JSON: {"a":1,"b":[1,2,3]}', temperature: 0.1, max_tokens: 200 })
    });
    console.log('STATUS', res.status);
    const txt = await res.text();
    console.log(txt.slice(0,5000));
  } catch (e) {
    console.error('ERR', e && e.message);
  }
})();

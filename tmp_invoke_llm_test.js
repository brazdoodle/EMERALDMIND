import('./src/api/integrations.js').then(async mod => {
  try {
    const out = await mod.InvokeLLM({ prompt: 'Return only JSON: {"a":1,"b":[1,2,3]}', model: 'gpt-oss:20b', response_json_schema: true, temperature: 0.1, max_tokens: 200 });
    console.log('PARSED', out);
  } catch (e) {
    console.error('ERR', e && e.message);
  }
}).catch(e=>console.error('IMPORT ERR', e));

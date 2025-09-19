import('../src/api/ollamaClient.js').then(async ({ default: client }) => {
  try {
    const prompt = 'Return only JSON: {"a":1,"b":[1,2,3]}';
    const model = 'gpt-oss:20b';
    // override target via OLLAMA_URL env var if provided
    const url = process.env.OLLAMA_URL || process.env.VITE_OLLAMA_URL || 'http://localhost:11434';
    // Temporarily monkeypatch DEFAULT_OLLAMA_URL by setting process.env.OLLAMA_URL (client reads it)
    const res = await client.callOllama({ prompt, model, temperature: 0.1, max_tokens: 200, signal: null });
    console.log('CLIENT RESULT:', res);
  } catch (e) {
    console.error('ERROR', e && e.message);
  }
}).catch(e=>console.error('IMPORT', e));

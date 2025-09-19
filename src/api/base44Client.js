// Local shim for Base44 client. In local mode we use Ollama and local entities.
console.warn('base44Client shim loaded: running in local mode using Ollama and local entity shims.');

export const base44 = {
  integrations: {},
  entities: {},
  auth: {}
};

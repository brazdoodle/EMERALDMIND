import { InvokeLLM } from './src/api/integrations.js';

(async () => {
  try {
    console.log('Testing scriptSage prompt...');
    const scriptResp = await InvokeLLM({ prompt: 'Create a short HMA script that sets FLAG_GOT_HM02_FLY when a player talks to the NPC and then ends.', task: 'scriptSage', add_context_from_app: true, temperature: 0.2, max_tokens: 300 });
    console.log('scriptSage response:', scriptResp);

    console.log('\nTesting trainerArchitect prompt...');
    const trainerResp = await InvokeLLM({ prompt: 'Create a 2-member team for a level 20 trainer.', task: 'trainerArchitect', add_context_from_app: true, response_json_schema: { type: 'object', properties: { party: { type: 'array' } }, required: ['party'] }, temperature: 0.2, max_tokens: 300 });
    console.log('trainerArchitect response:', trainerResp);
  } catch (err) {
    console.error('Test failed:', err);
  }
})();
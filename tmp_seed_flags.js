import { Flag } from './src/api/entities.js';
import { sampleVanillaFlags as vanillaEmeraldFlags } from './tmp_seed_data.js';

(async () => {
  // Clear in-memory store for flags
  const existing = await Flag.list();
  for (const e of existing) {
    await Flag.delete(e.id);
  }
  console.log('Seeding', vanillaEmeraldFlags.length, 'flags...');
  const toCreate = vanillaEmeraldFlags.slice(0, 5).map(f => ({
    project_id: 'current_project',
    flag_id: f.hex_id,
    name: f.name,
    description: f.description,
    category: f.category,
    is_vanilla: true,
    original_description: f.description
  }));
  const created = await Flag.bulkCreate(toCreate);
  console.log('Created sample flags:', created.map(c => ({ id: c.id, flag_id: c.flag_id, name: c.name }))); 
  const all = await Flag.list();
  console.log('Total flags now:', all.length);
})();
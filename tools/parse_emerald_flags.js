// Pokemon Emerald Flags Parser
// Fetches and parses flags from pret/pokeemerald repository

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FLAGS_URL = 'https://raw.githubusercontent.com/pret/pokeemerald/master/include/constants/flags.h';
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'ComprehensiveEmeraldFlags.js');

function fetchFlags() {
  return new Promise((resolve, reject) => {
    https.get(FLAGS_URL, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseFlags(content) {
  const flags = [];
  const lines = content.split('\n');
  
  let currentCategory = 'General';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect category comments
    if (line.includes('// Temporary Flags')) currentCategory = 'Temporary';
    else if (line.includes('// Scripts')) currentCategory = 'Scripts';
    else if (line.includes('// Hidden Items')) currentCategory = 'Hidden Items';
    else if (line.includes('// Event Flags')) currentCategory = 'Event Flags';
    else if (line.includes('// Item Ball Flags')) currentCategory = 'Item Ball Flags';
    else if (line.includes('// System Flags')) currentCategory = 'System Flags';
    else if (line.includes('// Badges')) currentCategory = 'Badges';
    else if (line.includes('// Towns and Cities')) currentCategory = 'Towns and Cities';
    else if (line.includes('// Daily Flags')) currentCategory = 'Daily Flags';
    else if (line.includes('// Special Flags')) currentCategory = 'Special Flags';
    else if (line.includes('// Trainer Flags')) currentCategory = 'Trainer Flags';
    else if (line.includes('// Mystery Gift')) currentCategory = 'Mystery Gift';
    else if (line.includes('// Wonder Card')) currentCategory = 'Wonder Card';
    else if (line.includes('// Match Call')) currentCategory = 'Match Call';
    
    // Parse flag definitions
    const flagMatch = line.match(/#define\s+(FLAG_\w+)\s+(.+?)(?:\/\/\s*(.+))?$/);
    if (flagMatch) {
      const [, flagName, flagValue, comment] = flagMatch;
      
      // Extract hex value
      let hexValue = flagValue.trim();
      if (hexValue.includes('(') && hexValue.includes('+')) {
        // Handle calculated values like (TEMP_FLAGS_START + 0x1)
        const hexMatch = hexValue.match(/0x[0-9A-Fa-f]+/);
        if (hexMatch) hexValue = hexMatch[0];
      }
      
      // Determine if unused
      const isUnused = comment && comment.toLowerCase().includes('unused');
      const description = isUnused 
        ? `${comment} - Available for custom assignment`
        : comment || `${flagName.replace('FLAG_', '').replace(/_/g, ' ')}`;
      
      flags.push({
        flag: flagName,
        value: hexValue,
        description: description,
        category: currentCategory,
        unused: isUnused
      });
    }
  }
  
  return flags;
}

function generateJavaScript(flags) {
  let output = `// COMPLETE Pokemon Emerald Flags Database from pret/pokeemerald master branch
// Source: https://github.com/pret/pokeemerald/blob/master/include/constants/flags.h
// Generated: ${new Date().toISOString()}
// This is the AUTHORITATIVE single source of truth for Pokemon Emerald flags
// Total flags: ${flags.length}

export const comprehensiveEmeraldFlags = [
`;

  flags.forEach((flag, index) => {
    const comma = index < flags.length - 1 ? ',' : '';
    output += `  { flag: "${flag.flag}", value: "${flag.value}", description: "${flag.description}", category: "${flag.category}"${flag.unused ? ', unused: true' : ''} }${comma}\n`;
  });

  output += `];

// Quick access by category
export const flagsByCategory = {
${[...new Set(flags.map(f => f.category))].map(cat => 
  `  "${cat}": comprehensiveEmeraldFlags.filter(f => f.category === "${cat}")`
).join(',\n')}
};

// Quick access by hex value
export const flagsByValue = Object.fromEntries(
  comprehensiveEmeraldFlags.map(f => [f.value, f])
);

// Unused flags available for custom assignment
export const unusedFlags = comprehensiveEmeraldFlags.filter(f => f.unused);

console.log(\`Loaded \${comprehensiveEmeraldFlags.length} Pokemon Emerald flags from authoritative source\`);
`;

  return output;
}

async function main() {
  try {
    console.log('Fetching Pokemon Emerald flags from pret/pokeemerald...');
    const content = await fetchFlags();
    
    console.log('Parsing flags...');
    const flags = parseFlags(content);
    
    console.log(`Found ${flags.length} flags`);
    console.log(`Unused flags: ${flags.filter(f => f.unused).length}`);
    
    console.log('Generating JavaScript file...');
    const jsContent = generateJavaScript(flags);
    
    // Ensure data directory exists
    const dataDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(OUTPUT_FILE, jsContent);
    console.log(`[Success] Complete flags database written to: ${OUTPUT_FILE}`);
    
    // Summary stats
    const categories = [...new Set(flags.map(f => f.category))];
    console.log('\nFlag Categories:');
    categories.forEach(cat => {
      const count = flags.filter(f => f.category === cat).length;
      const unused = flags.filter(f => f.category === cat && f.unused).length;
      console.log(`  ${cat}: ${count} flags (${unused} unused)`);
    });
    
  } catch (_error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
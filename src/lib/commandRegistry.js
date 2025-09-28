// Command Registry - Central database for HMA script commands
// Note: Avoid importing Node-only modules at module top-level so this file
// can be imported in browser builds (Vite). Use dynamic imports for disk I/O
// and path utilities only when running under Node. For browser usage we
// default to an in-memory registry and skip persistence.

// Command schema with full metadata
const COMMAND_SCHEMA = {
  id: 'string',           // unique identifier (usually same as command)
  command: 'string',      // actual command token
  syntax: 'string',       // full syntax pattern
  params: 'array',        // parameter definitions
  description: 'string',  // what the command does
  examples: 'array',      // usage examples
  category: 'string',     // command category
  confidence: 'number',   // 0-1 confidence in accuracy
  sources: 'array',       // where we learned this command
  lastReviewed: 'string', // ISO date
  aliases: 'array',       // alternative names
  relatedCommands: 'array', // semantically related commands
  usage: 'object'         // usage statistics
};

// Categories for command organization
export const COMMAND_CATEGORIES = {
  CORE: 'core',
  BATTLE: 'battle',
  MOVEMENT: 'movement',
  DIALOGUE: 'dialogue',
  FLAGS: 'flags',
  VARS: 'vars',
  ITEMS: 'items',
  SOUND: 'sound',
  CAMERA: 'camera',
  WEATHER: 'weather',
  SPRITES: 'sprites',
  MAP: 'map',
  SPECIAL: 'special',
  FLOW: 'flow',
  CUSTOM: 'custom'
};

// Confidence levels
export const CONFIDENCE_LEVELS = {
  AUTO_EXTRACTED: 0.3,  // Found in examples, not verified
  AI_SUGGESTED: 0.5,    // Generated description
  USER_REVIEWED: 0.8,   // User confirmed
  CANONICAL: 1.0        // From official docs/known good
};

class CommandRegistry {
  constructor(registryPath = null) {
    // Avoid using `path.join` in browser bundles; build a simple default
    // path string when running in Node. Consumers can pass a custom
    // `registryPath` when instantiating in Node environments.
    if (registryPath) {
      this.registryPath = registryPath;
    } else if (CommandRegistry.isNode()) {
      // Safe Node default
      this.registryPath = `${process.cwd().replace(/\\/g, '/')}/commands.json`;
    } else {
      // Browser: no disk persistence by default
      this.registryPath = null;
    }
    this.commands = new Map();
    this.metadata = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      totalCommands: 0,
      categories: Object.values(COMMAND_CATEGORIES)
    };
    // Populate defaults immediately so code importing a fresh registry
    // (including tests) has a usable set of commands. Disk-backed
    // persistence can be performed later via `loadFromDisk()` / `saveToDisk()`.
    this.initializeWithDefaults();
  }

  // Detect if we are running under Node.js
  static isNode() {
    return typeof process !== 'undefined' && process.versions && process.versions.node;
  }

  // Async disk load for Node environments only
  async loadFromDisk() {
    if (!CommandRegistry.isNode()) return false;

    try {
      const { existsSync, readFileSync } = await import('fs');
      if (existsSync(this.registryPath)) {
        const data = JSON.parse(readFileSync(this.registryPath, 'utf8'));
        this.metadata = { ...this.metadata, ...data.metadata };
        if (data.commands) {
          data.commands.forEach(cmd => {
            this.commands.set(cmd.id, this.normalizeCommand(cmd));
          });
        }
        return true;
      }
      return false;
    } catch (_error) {
      console.error('Failed to load command registry from disk:', error);
      return false;
    }
  }

  // Load registry from disk
  // Backwards-compatible synchronous load() method used by older callers.
  // This method will ensure the registry has defaults; for actual disk
  // loading in Node use `loadFromDisk()`.
  load() {
    if (this.commands.size === 0) {
      this.initializeWithDefaults();
    }
    return true;
  }

  // Save registry to disk
  // Async save for Node environments only
  async saveToDisk() {
    if (!CommandRegistry.isNode()) {
      console.warn('saveToDisk called in non-Node environment; skipping');
      return false;
    }

    try {
      const { existsSync, mkdirSync, writeFileSync } = await import('fs');
      const dir = this.registryPath.split('/').slice(0, -1).join('/');
      if (dir && !existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      this.metadata.lastUpdated = new Date().toISOString();
      this.metadata.totalCommands = this.commands.size;

      const data = {
        metadata: this.metadata,
        commands: Array.from(this.commands.values())
      };

      writeFileSync(this.registryPath, JSON.stringify(data, null, 2));
      console.log(`Saved ${this.commands.size} commands to registry`);
      return true;
    } catch (_error) {
      console.error('Failed to save command registry to disk:', error);
      return false;
    }
  }

  // Initialize with known commands from llmUtils.js
  initializeWithDefaults() {
    const knownCommands = [
      'faceplayer', 'single.battle.continue.silent', 'double.battle.rematch', 'special2', 'fanfare', 'waitfanfare',
      'lockall', 'pause', 'preparemsg', 'waitmsg', 'msgbox', 'msgbox.default', 'msgbox.autoclose',
      'call', 'goto', 'return', 'release', 'end', 'warp8', 'warp', 'waitstate', 'waitsound', 'waitcry',
      'setflag', 'clearflag', 'setvar', 'addvar', 'copyvar', 'if.compare.call', 'if.compare.goto',
      'if.yes.goto', 'if.no.goto', 'if.flag.clear.goto', 'if.', 'npc.item', 'defeatedtrainer',
      'npc.giveitem', 'npc.talk', 'special', 'move.camera', 'move.npc', 'move.player', 'applymovement',
      'hidesprite', 'showsprite', 'spawncameraobject', 'removecameraobject', 'setmaptile', 'setweather',
      'doweather', 'waitweather', 'sound', 'cry', 'fadescreendelay', 'fadesong'
    ];

    knownCommands.forEach(cmd => {
      this.addCommand({
        id: cmd,
        command: cmd,
        syntax: cmd,
        description: `HMA command: ${cmd}`,
        category: this.inferCategory(cmd),
        confidence: CONFIDENCE_LEVELS.AUTO_EXTRACTED,
        sources: ['initial_seed'],
        examples: [],
        params: [],
        aliases: [],
        relatedCommands: [],
        usage: { count: 0, lastUsed: null }
      });
    });
  }

  // Backwards-compatible synchronous save wrapper that triggers async
  // saveToDisk() when available. Returns boolean success indicator.
  save() {
    if (typeof this.saveToDisk === 'function') {
      // fire-and-forget to maintain compatibility with callers expecting
      // synchronous behavior; saveToDisk will log errors if any.
      this.saveToDisk();
      return true;
    }
    console.warn('save() called but persistence is not available in this environment');
    return false;
  }

  // Normalize command object to schema
  normalizeCommand(cmd) {
    return {
      id: cmd.id || cmd.command,
      command: cmd.command || cmd.id,
      syntax: cmd.syntax || cmd.command,
      params: cmd.params || [],
      description: cmd.description || '',
      examples: cmd.examples || [],
      category: cmd.category || COMMAND_CATEGORIES.CUSTOM,
      confidence: cmd.confidence || CONFIDENCE_LEVELS.AUTO_EXTRACTED,
      sources: cmd.sources || [],
      lastReviewed: cmd.lastReviewed || new Date().toISOString(),
      aliases: cmd.aliases || [],
      relatedCommands: cmd.relatedCommands || [],
      usage: cmd.usage || { count: 0, lastUsed: null }
    };
  }

  // Infer category from command name
  inferCategory(commandName) {
    const cmd = commandName.toLowerCase();
    
    if (cmd.includes('battle') || cmd.includes('defeat')) return COMMAND_CATEGORIES.BATTLE;
    if (cmd.includes('move') || cmd.includes('walk') || cmd.includes('apply')) return COMMAND_CATEGORIES.MOVEMENT;
    if (cmd.includes('msg') || cmd.includes('text')) return COMMAND_CATEGORIES.DIALOGUE;
    if (cmd.includes('flag')) return COMMAND_CATEGORIES.FLAGS;
    if (cmd.includes('var')) return COMMAND_CATEGORIES.VARS;
    if (cmd.includes('item') || cmd.includes('give')) return COMMAND_CATEGORIES.ITEMS;
    if (cmd.includes('sound') || cmd.includes('cry') || cmd.includes('fanfare') || cmd.includes('song')) return COMMAND_CATEGORIES.SOUND;
    if (cmd.includes('camera') || cmd.includes('spawn')) return COMMAND_CATEGORIES.CAMERA;
    if (cmd.includes('weather')) return COMMAND_CATEGORIES.WEATHER;
    if (cmd.includes('sprite') || cmd.includes('hide') || cmd.includes('show')) return COMMAND_CATEGORIES.SPRITES;
    if (cmd.includes('map') || cmd.includes('tile') || cmd.includes('warp')) return COMMAND_CATEGORIES.MAP;
    if (cmd.includes('special') || cmd.includes('call') || cmd.includes('goto') || cmd.includes('if.')) return COMMAND_CATEGORIES.FLOW;
    if (cmd.includes('lock') || cmd.includes('release') || cmd.includes('end') || cmd.includes('pause')) return COMMAND_CATEGORIES.CORE;
    
    return COMMAND_CATEGORIES.CUSTOM;
  }

  // Add or update a command
  addCommand(commandData) {
    const normalized = this.normalizeCommand(commandData);
    const existing = this.commands.get(normalized.id);
    
    if (existing) {
      // Merge with existing command
      normalized.sources = [...new Set([...existing.sources, ...normalized.sources])];
      normalized.examples = [...new Set([...existing.examples, ...normalized.examples])];
      normalized.confidence = Math.max(existing.confidence, normalized.confidence);
      normalized.usage.count = existing.usage.count;
      
      if (normalized.description === existing.description || !normalized.description) {
        normalized.description = existing.description;
      }
    }
    
    this.commands.set(normalized.id, normalized);
    return normalized;
  }

  // Get command by ID
  getCommand(id) {
    return this.commands.get(id);
  }

  // Search commands by query
  searchCommands(query, options = {}) {
    const { category, minConfidence = 0, limit = 50 } = options;
    const results = [];
    const queryLower = query.toLowerCase();
    
    for (const cmd of this.commands.values()) {
      let score = 0;
      
      // Category filter
      if (category && cmd.category !== category) continue;
      
      // Confidence filter
      if (cmd.confidence < minConfidence) continue;
      
      // Scoring
      if (cmd.command.toLowerCase().includes(queryLower)) score += 10;
      if (cmd.description.toLowerCase().includes(queryLower)) score += 5;
      if (cmd.examples.some(ex => ex.toLowerCase().includes(queryLower))) score += 3;
      if (cmd.aliases.some(alias => alias.toLowerCase().includes(queryLower))) score += 8;
      
      if (score > 0) {
        results.push({ ...cmd, _score: score });
      }
    }
    
    return results
      .sort((a, b) => b._score - a._score)
      .slice(0, limit)
      .map(({ _score, ...cmd }) => cmd);
  }

  // Get commands by category
  getCommandsByCategory(category) {
    return Array.from(this.commands.values())
      .filter(cmd => cmd.category === category)
      .sort((a, b) => b.confidence - a.confidence);
  }

  // Get all commands as array
  getAllCommands() {
    return Array.from(this.commands.values());
  }

  // Get registry statistics
  getStats() {
    const commands = Array.from(this.commands.values());
    const categories = {};
    const confidenceLevels = {};
    
    commands.forEach(cmd => {
      categories[cmd.category] = (categories[cmd.category] || 0) + 1;
      
      const confLevel = cmd.confidence >= 0.8 ? 'high' : 
                       cmd.confidence >= 0.5 ? 'medium' : 'low';
      confidenceLevels[confLevel] = (confidenceLevels[confLevel] || 0) + 1;
    });
    
    return {
      total: commands.length,
      categories,
      confidenceLevels,
      lastUpdated: this.metadata.lastUpdated
    };
  }

  // Update command usage stats
  recordUsage(commandId, context = null) {
    const cmd = this.commands.get(commandId);
    if (cmd) {
      cmd.usage.count++;
      cmd.usage.lastUsed = new Date().toISOString();
      if (context) {
        cmd.usage.contexts = cmd.usage.contexts || [];
        cmd.usage.contexts.push(context);
      }
    }
  }

  // Export commands for external use
  exportCommands(format = 'json') {
    const commands = this.getAllCommands();
    
    switch (format) {
      case 'json':
        return JSON.stringify(commands, null, 2);
      
      case 'csv':
        const headers = ['command', 'syntax', 'description', 'category', 'confidence'];
        const rows = commands.map(cmd => 
          headers.map(h => `"${(cmd[h] || '').toString().replace(/"/g, '""')}"`)
        );
        return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      
      case 'markdown':
        const categoryGroups = {};
        commands.forEach(cmd => {
          if (!categoryGroups[cmd.category]) categoryGroups[cmd.category] = [];
          categoryGroups[cmd.category].push(cmd);
        });
        
        let md = '# HMA Command Reference\n\n';
        Object.entries(categoryGroups).forEach(([cat, cmds]) => {
          md += `## ${cat.charAt(0).toUpperCase() + cat.slice(1)}\n\n`;
          cmds.forEach(cmd => {
            md += `### ${cmd.command}\n`;
            md += `**Syntax:** \`${cmd.syntax}\`\n\n`;
            md += `${cmd.description}\n\n`;
            if (cmd.examples.length > 0) {
              md += `**Examples:**\n${cmd.examples.map(ex => `- \`${ex}\``).join('\n')}\n\n`;
            }
          });
        });
        return md;
      
      default:
        return commands;
    }
  }

  // Validate registry integrity
  validate() {
    const issues = [];
    
    for (const [id, cmd] of this.commands.entries()) {
      if (!cmd.command) issues.push(`Command ${id} missing command field`);
      if (!cmd.description) issues.push(`Command ${id} missing description`);
      if (cmd.confidence < 0 || cmd.confidence > 1) {
        issues.push(`Command ${id} has invalid confidence: ${cmd.confidence}`);
      }
      if (!Object.values(COMMAND_CATEGORIES).includes(cmd.category)) {
        issues.push(`Command ${id} has invalid category: ${cmd.category}`);
      }
    }
    
    return { valid: issues.length === 0, issues };
  }

  // Clear all commands (for testing)
  clear() {
    this.commands.clear();
    this.metadata.totalCommands = 0;
  }

  // Import commands from external source
  importCommands(commandsData, source = 'import') {
    let imported = 0;
    
    commandsData.forEach(cmdData => {
      const cmd = { ...cmdData, sources: [source] };
      this.addCommand(cmd);
      imported++;
    });
    
    this.save();
    return imported;
  }
}

// Singleton instance for the app
let globalRegistry = null;

export function getCommandRegistry(registryPath = null) {
  if (!globalRegistry) {
    globalRegistry = new CommandRegistry(registryPath);
  }
  return globalRegistry;
}

export { CommandRegistry, COMMAND_SCHEMA };
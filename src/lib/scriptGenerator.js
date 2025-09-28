// Comprehensive Script Generation Pipeline
// Coordinates command registry, templates, AI generation, and validation

import { buildScriptGenPrompt, sanitizeGeneratedScript, describeUnknownCommand } from './llmUtils.js';
import { getCommandRegistry } from './commandRegistry.js';

// Generation quality levels
export const QUALITY_LEVELS = {
  FAST: { maxTokens: 300, temperature: 0.7, examples: 2, validation: 'basic' },
  BALANCED: { maxTokens: 500, temperature: 0.5, examples: 4, validation: 'full' },
  DETAILED: { maxTokens: 1000, temperature: 0.3, examples: 6, validation: 'comprehensive' }
};

// Script presets with contextual information
export const SCRIPT_PRESETS = {
  // NPC & Dialog
  'basic_npc': {
    title: 'Basic NPC Interaction',
    description: 'Simple NPC with greeting message',
    categories: ['core', 'dialogue'],
    requiredCommands: ['faceplayer', 'msgbox', 'release', 'end'],
    template: 'faceplayer\nmsgbox @message MSG_NORMAL\nrelease\nend',
    complexity: 'simple',
    tags: ['npc', 'dialog', 'basic']
  },
  
  'branching_npc': {
    title: 'NPC with Dialogue Branches',
    description: 'NPC with conditional responses based on flags/variables',
    categories: ['core', 'dialogue', 'flags', 'flow'],
    requiredCommands: ['faceplayer', 'msgbox', 'if.flag.clear.goto', 'setflag', 'release', 'end'],
    template: 'faceplayer\nif.flag.clear.goto 0x200 @first_time\nmsgbox @return_message MSG_NORMAL\nrelease\nend',
    complexity: 'intermediate',
    tags: ['npc', 'dialog', 'conditional', 'flags']
  },
  
  'shop_npc': {
    title: 'Shop NPC',
    description: 'NPC that opens a shop interface',
    categories: ['core', 'dialogue', 'items', 'special'],
    requiredCommands: ['faceplayer', 'msgbox', 'special', 'release', 'end'],
    template: 'faceplayer\nmsgbox @shop_greeting MSG_YESNO\nif.no.goto @decline\nspecial StartMart @shop_items\nrelease\nend',
    complexity: 'intermediate',
    tags: ['npc', 'shop', 'items', 'special']
  },
  
  // Battle & Trainers
  'gym_leader': {
    title: 'Gym Leader Battle',
    description: 'Complete gym leader battle with badge ceremony',
    categories: ['core', 'battle', 'dialogue', 'flags', 'vars', 'items'],
    requiredCommands: ['single.battle.continue.silent', 'special2', 'msgbox', 'setflag', 'setvar', 'fanfare', 'release'],
    template: 'single.battle.continue.silent GymLeader @defeat_text @victory_text @section\nmsgbox @badge_text MSG_NORMAL\nfanfare mus_obtain_badge\nwaitfanfare\nsetflag BADGE_FLAG\nsetvar BADGE_COUNT_VAR 1\nrelease\nend',
    complexity: 'advanced',
    tags: ['battle', 'gym', 'badge', 'trainer']
  },
  
  'trainer_battle': {
    title: 'Regular Trainer Battle',
    description: 'Standard trainer encounter with defeat handling',
    categories: ['core', 'battle', 'dialogue'],
    requiredCommands: ['single.battle.continue.silent', 'msgbox', 'release', 'end'],
    template: 'single.battle.continue.silent Trainer @defeat_text @victory_text @section\nmsgbox @after_battle MSG_NORMAL\nrelease\nend',
    complexity: 'intermediate',
    tags: ['battle', 'trainer', 'encounter']
  },
  
  // Cutscenes & Events
  'simple_cutscene': {
    title: 'Simple Cutscene',
    description: 'Basic cutscene with character movement and dialogue',
    categories: ['core', 'movement', 'dialogue', 'camera'],
    requiredCommands: ['lockall', 'applymovement', 'msgbox', 'release', 'end'],
    template: 'lockall\napplymovement npc @movement_data\nwaitmovement npc\nmsgbox @cutscene_text MSG_NORMAL\nrelease\nend',
    complexity: 'simple',
    tags: ['cutscene', 'movement', 'story']
  },
  
  'epic_cutscene': {
    title: 'Epic Multi-Character Cutscene',
    description: 'Complex cutscene with multiple characters, camera work, and effects',
    categories: ['core', 'movement', 'dialogue', 'camera', 'sound', 'weather', 'sprites'],
    requiredCommands: ['lockall', 'special', 'move.camera', 'move.npc', 'move.player', 'sound', 'pause', 'msgbox', 'release'],
    template: 'lockall\nspecial SpawnCameraObject\nmove.camera @camera_movement\nspecial RemoveCameraObject\nmove.npc 1 @npc_movement\nmove.player @player_movement\nsound se_effect\npause 60\nmsgbox @epic_dialogue MSG_NORMAL\nrelease\nend',
    complexity: 'advanced',
    tags: ['cutscene', 'epic', 'camera', 'effects', 'multi-character']
  },
  
  // Items & Objects
  'item_ball': {
    title: 'Item Ball Script',
    description: 'Script for picking up items from the ground',
    categories: ['core', 'items', 'flags'],
    requiredCommands: ['npc.item', 'if.no.goto', 'setflag', 'msgbox', 'release', 'end'],
    template: 'npc.item ITEM_NAME 1\nif.no.goto @bag_full\nsetflag ITEM_FLAG\nmsgbox @found_item MSG_NORMAL\nrelease\nend',
    complexity: 'simple',
    tags: ['item', 'pickup', 'findable']
  },
  
  'hidden_item': {
    title: 'Hidden Item',
    description: 'Script for hidden items that require itemfinder',
    categories: ['core', 'items', 'flags', 'special'],
    requiredCommands: ['npc.item', 'setflag', 'msgbox', 'hidesprite', 'release', 'end'],
    template: 'npc.item ITEM_NAME 1\nif.no.goto @bag_full\nsetflag ITEM_FLAG\nmsgbox @found_hidden_item MSG_NORMAL\nhidesprite SPRITE_ID\nrelease\nend',
    complexity: 'simple',
    tags: ['item', 'hidden', 'secret']
  },
  
  // Special Events
  'legendary_encounter': {
    title: 'Legendary Pokemon Encounter',
    description: 'Epic legendary pokemon encounter with effects',
    categories: ['core', 'battle', 'camera', 'sound', 'weather', 'sprites'],
    requiredCommands: ['lockall', 'special', 'cry', 'setweather', 'doweather', 'single.battle.continue.silent', 'hidesprite', 'setflag', 'release'],
    template: 'lockall\nspecial SpawnCameraObject\nsetweather Storm\ndoweather\ncry LEGENDARY_SPECIES 2\npause 120\nsingle.battle.continue.silent LEGENDARY_SPECIES @fled @caught @section\nhidesprite LEGENDARY_SPRITE\nsetflag LEGENDARY_FLAG\nrelease\nend',
    complexity: 'advanced',
    tags: ['legendary', 'pokemon', 'epic', 'weather', 'special']
  }
};

class ScriptGenerator {
  constructor() {
    this.registry = getCommandRegistry();
    this.generationStats = {
      totalGenerated: 0,
      successRate: 0,
      averageUnknownCommands: 0,
      lastGeneration: null
    };
  }

  // Get relevant commands for a preset
  getRelevantCommands(preset, limit = 20) {
    const presetInfo = SCRIPT_PRESETS[preset];
    if (!presetInfo) return [];
    
    const commands = [];
    
    // Get required commands first
    for (const cmdName of presetInfo.requiredCommands || []) {
      const cmd = this.registry.getCommand(cmdName);
      if (cmd) commands.push(cmd);
    }
    
    // Get commands from relevant categories
    for (const category of presetInfo.categories || []) {
      const categoryCommands = this.registry.getCommandsByCategory(category);
      commands.push(...categoryCommands.slice(0, 5)); // Limit per category
    }
    
    // Remove duplicates and sort by confidence
    const uniqueCommands = Array.from(
      new Map(commands.map(cmd => [cmd.id, cmd])).values()
    ).sort((a, b) => b.confidence - a.confidence);
    
    return uniqueCommands.slice(0, limit);
  }

  // Get relevant templates for a preset
  getRelevantTemplates(preset, templates = []) {
    const presetInfo = SCRIPT_PRESETS[preset];
    if (!presetInfo) return [];
    
    // Filter templates by preset tags
    const relevantTemplates = templates.filter(template => {
      if (!template.tags || !presetInfo.tags) return false;
      return template.tags.some(tag => presetInfo.tags.includes(tag));
    });
    
    // Include preset's own template if available
    if (presetInfo.template) {
      relevantTemplates.unshift({
        title: presetInfo.title,
        content: presetInfo.template,
        description: presetInfo.description,
        tags: presetInfo.tags
      });
    }
    
    return relevantTemplates.slice(0, 6); // Limit templates
  }

  // Enhance prompt with contextual information
  enhancePromptWithContext(preset, basePrompt, commands, templates) {
    const presetInfo = SCRIPT_PRESETS[preset];
    if (!presetInfo) return basePrompt;
    
    const enhancements = [];
    
    // Add preset-specific guidance
    enhancements.push(`Target: ${presetInfo.title} - ${presetInfo.description}`);
    enhancements.push(`Complexity Level: ${presetInfo.complexity}`);
    
    // Add command usage patterns
    if (commands.length > 0) {
      const commandPatterns = commands
        .filter(cmd => cmd.examples && cmd.examples.length > 0)
        .slice(0, 3)
        .map(cmd => `${cmd.command}: ${cmd.examples[0]}`)
        .join(', ');
      
      if (commandPatterns) {
        enhancements.push(`Common Patterns: ${commandPatterns}`);
      }
    }
    
    // Add structural requirements
    if (presetInfo.requiredCommands && presetInfo.requiredCommands.length > 0) {
      enhancements.push(`Must Include: ${presetInfo.requiredCommands.join(', ')}`);
    }
    // Add preset-specific content guidance
    const contentGuidanceByPreset = {
      basic_npc: [
        'Ensure at least one greeting line and a clean release/end sequence.'
      ],
      branching_npc: [
        'Include a branch based on a flag or yes/no choice, with distinct dialog for each branch.'
      ],
      shop_npc: [
        'Prompt with a yes/no before opening shop and handle decline gracefully.'
      ],
      gym_leader: [
        'Include pre-battle dialog, battle invocation, and badge ceremony with fanfare.'
      ],
      trainer_battle: [
        'Include pre- and post-battle messages and a single trainer battle call.'
      ],
      simple_cutscene: [
        'Include at least one movement sequence and related dialog.'
      ],
      epic_cutscene: [
        'Use camera movements, sounds, pauses, and multiple character actions for drama.'
      ],
      item_ball: [
        'Include inventory full branch and set a flag upon pickup.'
      ],
      hidden_item: [
        'Hide the sprite after pickup and set the corresponding flag.'
      ],
      legendary_encounter: [
        'Include weather setup, cry, and a battle followed by cleanup and flag set.'
      ]
    };
    const extra = contentGuidanceByPreset[preset] || [];
    if (extra.length) enhancements.push('Content Guidance:\n- ' + extra.join('\n- '));
    
    return [basePrompt, ...enhancements].join('\n\n');
  }

  // Generate script with full pipeline
  async generateScript(options = {}) {
    const {
      preset = 'basic_npc',
      quality = 'BALANCED',
      templates = [],
      sectionNumber = 1,
      customPrompt = null,
      quickQuery = null,
      includeAnalysis = true,
      signal = undefined
    } = options;
    
    const startTime = Date.now();
    const qualityConfig = QUALITY_LEVELS[quality] || QUALITY_LEVELS.BALANCED;
    
    try {
      // Step 1: Gather contextual information
      const relevantCommands = this.getRelevantCommands(preset, qualityConfig.examples * 3);
      const relevantTemplates = this.getRelevantTemplates(preset, templates);
      
      // Step 2: Build enhanced prompt
      let prompt;
      if (customPrompt) {
        prompt = customPrompt;
      } else {
        const basePrompt = buildScriptGenPrompt(preset, relevantTemplates, relevantCommands);
        prompt = this.enhancePromptWithContext(preset, basePrompt, relevantCommands, relevantTemplates);
      }
      
      // Step 3: Generate with AI
      if (!quickQuery || typeof quickQuery !== 'function') {
        throw new Error('quickQuery function is required for generation');
      }
      
      const generationOptions = {
        maxTokens: qualityConfig.maxTokens,
        temperature: qualityConfig.temperature,
        top_p: 0.9,
        stop: ['```\n\n', 'Human:', 'Assistant:']
      };
      
  const rawOutput = await quickQuery(prompt, { ...generationOptions, signal });
      const rawText = typeof rawOutput === 'string' ? rawOutput : 
                     (rawOutput.text || rawOutput.output || rawOutput.response || '');
      
      if (!rawText || rawText.trim().length === 0) {
        throw new Error('AI generated empty response');
      }
      
      // Step 4: Sanitize and validate
      const { text: sanitizedScript, unknownCommands } = sanitizeGeneratedScript(rawText, sectionNumber);
      
      if (!sanitizedScript || sanitizedScript.trim().length === 0) {
        throw new Error('No valid script content after sanitization');
      }
      
      // Step 5: Analyze if requested
      let analysis = null;
      if (includeAnalysis) {
        try {
          // Import analyzer dynamically to avoid circular deps
          const { analyzeHMAScript } = await import('./scriptAnalyzer.js');
          analysis = await analyzeHMAScript(sanitizedScript, {
            knowledgeEntries: [],
            templates: relevantTemplates,
            commandDocs: relevantCommands
          });
        } catch (_analyzeError) {
          console.warn('Script analysis failed:', analyzeError.message);
          analysis = { error: analyzeError.message };
        }
      }
      
      // Step 6: Process unknown commands
      let unknownCommandDetails = [];
      if (unknownCommands.length > 0 && quickQuery) {
        try {
          unknownCommandDetails = await Promise.all(
            unknownCommands.map(async (cmd) => {
              const description = await describeUnknownCommand(cmd, (p, o) => quickQuery(p, { ...(o||{}), signal }));
              return {
                command: cmd,
                description,
                confidence: 0.3,
                source: 'ai_generation',
                needsReview: true
              };
            })
          );
        } catch (_describeError) {
          console.warn('Failed to describe unknown commands:', describeError.message);
        }
      }
      
      // Step 7: Update stats and usage tracking
      this.updateGenerationStats(true, unknownCommands.length);
      
      // Record usage for commands that were actually used
      relevantCommands.forEach(cmd => {
        if (sanitizedScript.toLowerCase().includes(cmd.command.toLowerCase())) {
          this.registry.recordUsage(cmd.id, `generation:${preset}`);
        }
      });
      
      const result = {
        success: true,
        preset,
        quality,
        script: {
          raw: rawText,
          sanitized: sanitizedScript,
          section: sectionNumber
        },
        analysis,
        unknownCommands: unknownCommandDetails,
        metadata: {
          generationTime: Math.max(1, Date.now() - startTime),
          promptLength: prompt.length,
          outputLength: rawText.length,
          sanitizedLength: sanitizedScript.length,
          commandsUsed: relevantCommands.length,
          templatesUsed: relevantTemplates.length,
          timestamp: new Date().toISOString()
        },
        context: {
          preset: SCRIPT_PRESETS[preset],
          commands: relevantCommands,
          templates: relevantTemplates
        }
      };
      
      this.generationStats.lastGeneration = result;
      
      return result;
      
    } catch (_error) {
      this.updateGenerationStats(false, 0);
      
      return {
        success: false,
        error: _error.message,
        preset,
        quality,
        metadata: {
          generationTime: Math.max(1, Date.now() - startTime),
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  // Update generation statistics
  updateGenerationStats(success, unknownCount) {
    this.generationStats.totalGenerated++;
    
    if (success) {
      const total = this.generationStats.totalGenerated;
      const currentSuccess = (this.generationStats.successRate * (total - 1) + 1) / total;
      this.generationStats.successRate = currentSuccess;
      
      const currentAvgUnknown = this.generationStats.averageUnknownCommands;
      this.generationStats.averageUnknownCommands = 
        (currentAvgUnknown * (total - 1) + unknownCount) / total;
    }
  }

  // Batch generate multiple scripts
  async batchGenerate(configs, quickQuery) {
    const results = [];
    
    for (const config of configs) {
      try {
        const result = await this.generateScript({ ...config, quickQuery });
        results.push(result);
        
  // Small delay between generations to avoid overwhelming the AI
  await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (_error) {
        results.push({
          success: false,
          error: error.message,
          config
        });
      }
    }
    
    return results;
  }

  // Get generation statistics
  getStats() {
    return {
      ...this.generationStats,
      registryStats: this.registry.getStats(),
      availablePresets: Object.keys(SCRIPT_PRESETS).length
    };
  }

  // Get available presets filtered by complexity
  getPresetsByComplexity(complexity = null) {
    const presets = Object.entries(SCRIPT_PRESETS);
    
    if (complexity) {
      return presets
        .filter(([, preset]) => preset.complexity === complexity)
        .map(([key, preset]) => ({ key, ...preset }));
    }
    
    return presets.map(([key, preset]) => ({ key, ...preset }));
  }

  // Validate generation requirements
  validateGenerationRequirements(preset, quickQuery) {
    const issues = [];
    
    if (!SCRIPT_PRESETS[preset]) {
      issues.push(`Unknown preset: ${preset}`);
    }
    
    if (!quickQuery || typeof quickQuery !== 'function') {
      issues.push('quickQuery function is required');
    }
    
    const commands = this.getRelevantCommands(preset);
    if (commands.length === 0) {
      issues.push(`No commands available for preset: ${preset}`);
    }
    
    return { valid: issues.length === 0, issues };
  }

  // Suggest improvements for unknown commands
  async suggestImprovements(unknownCommands, quickQuery) {
    if (!unknownCommands.length || !quickQuery) return [];
    
    const suggestions = [];
    
    for (const cmdInfo of unknownCommands) {
      try {
        // Check if command exists in registry with low confidence
        const existing = this.registry.getCommand(cmdInfo.command);
        
        if (existing && existing.confidence < 0.5) {
          suggestions.push({
            type: 'improve_existing',
            command: cmdInfo.command,
            action: 'Request better description from user',
            currentDescription: existing.description,
            suggestedDescription: cmdInfo.description
          });
        } else if (!existing) {
          suggestions.push({
            type: 'add_new',
            command: cmdInfo.command,
            action: 'Add to registry with AI-generated description',
            description: cmdInfo.description,
            confidence: 0.3
          });
        }
      } catch (_error) {
        console.warn(`Failed to process suggestion for ${cmdInfo.command}:`, error.message);
      }
    }
    
    return suggestions;
  }
}

// Singleton instance
let globalGenerator = null;

export function getScriptGenerator() {
  if (!globalGenerator) {
    globalGenerator = new ScriptGenerator();
  }
  return globalGenerator;
}

// Export class for direct construction in tests
export { ScriptGenerator };
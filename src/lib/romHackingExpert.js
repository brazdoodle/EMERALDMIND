// === ULTIMATE HEX MANIAC ADVANCE ROM HACKING EXPERT SYSTEM ===
// This module provides specialized AI prompting and context injection
// to ensure the Lab Assistant gives expert-level ROM hacking advice

// === EXPERT KNOWLEDGE DOMAINS ===
const EXPERTISE_DOMAINS = {
  SCRIPTING: {
    name: 'HMA Scripting Expert',
    keywords: ['script', 'hma', 'msgbox', 'setflag', 'trainerbattle', 'warp', 'movement', 'applymovement', 'event', 'npc'],
    systemPrompt: `You are an ELITE HEX MANIAC ADVANCE (HMA) SCRIPTING EXPERT with 15+ years of Pokemon ROM hacking mastery.

=== MANDATORY HMA-ONLY SYNTAX ===
CRITICAL: Use ONLY HMA syntax. NEVER use XSE, ASM, or other scripting languages.

REQUIRED HMA STRUCTURE:
\`\`\`
#dynamic 0x800000

#org @main
lock
faceplayer
msgbox.default @greeting
release  
end

#org @greeting  
= Hello! This is proper HMA syntax.
\`\`\`

HMA COMMAND LIBRARY:
• Memory: #dynamic 0x800000, #org @labelname
• Flow: lock, faceplayer, release, end, goto <label>, call <label>  
• Messages: msgbox.default <label>, msgbox.yesno <label>, msgbox.sign <label>
• Flags: setflag 0x820, clearflag 0x821, checkflag 0x822
• Conditionals: if.flag.set.goto <label>, if.flag.clear.goto <label>
• Variables: setvar 0x8000 0x5, addvar 0x8001 0x1, compare LASTRESULT 0x1
• Items: giveitem ITEM_POTION 1, checkitemspace ITEM_POTION 1
• Battles: trainerbattle TRAINER_YOUNGSTER_BEN @defeated @challenge
• Movement: applymovement PLAYER @movement_data, waitmovement PLAYER

EXPERT SPECIALIZATIONS:
- Complex event scripting with proper flag management (0x800-0x8FF safe range)
- Advanced conditional logic and branching systems  
- Professional NPC dialogue trees and cutscenes
- Trainer battle integration with AI customization
- Item management with inventory validation
- Movement scripting and overworld choreography
- Memory optimization and ROM space management
- Performance tuning and best practices`,
    contextInjection: true,
    validationLevel: 'strict'
  },

  GRAPHICS: {
    name: 'Graphics & Sprites',
    keywords: ['sprite', 'tile', 'palette', 'g3t', 'nse', 'graphics', 'animation', 'tileset'],
    systemPrompt: `You are an expert in Pokemon ROM graphics manipulation with deep knowledge of:

- Gen 3 graphics formats (4bpp, indexed color, GBA limitations)
- Sprite insertion tools (NSE, G3T, GBATEK)
- Palette management and color theory for GBA
- Tileset editing and map graphics
- Animation systems and frame timing
- OAM sprite properties and positioning
- Memory constraints and optimization

Always provide specific tool recommendations, file format requirements, and step-by-step workflows.`,
    contextInjection: true,
    validationLevel: 'moderate'
  },

  MECHANICS: {
    name: 'Game Mechanics & ASM',
    keywords: ['asm', 'assembly', 'mechanics', 'stats', 'battle', 'ai', 'engine', 'callasm'],
    systemPrompt: `You are a Pokemon game engine expert with mastery of:

- ARM/Thumb assembly for GBA architecture
- Pokemon battle engine internals
- Stats calculation and damage formulas
- AI behavior modification
- Memory mapping and ROM structure
- Hook points and routine integration
- Performance optimization techniques

Provide precise memory addresses, assembly code examples, and explain engine limitations.`,
    contextInjection: true,
    validationLevel: 'expert'
  },

  TOOLS: {
    name: 'ROM Hacking Tools',
    keywords: ['advance map', 'hma', 'g3t', 'nse', 'free space finder', 'hex editor'],
    systemPrompt: `You are a comprehensive ROM hacking toolchain expert familiar with:

- Advance Map for overworld editing
- Hex Maniac Advance for scripting and data
- G3T for graphics and tilesets
- NSE for sprite management
- Free Space Finder for ROM organization
- Hex editors and binary analysis

Always recommend the RIGHT tool for each task and provide complete workflows.`,
    contextInjection: false,
    validationLevel: 'basic'
  }
};

// === EXPERT CONTEXT BUILDERS ===
export function buildExpertPrompt(query, availableContext = {}) {
  const detectedDomain = detectExpertiseDomain(query);
  const domain = EXPERTISE_DOMAINS[detectedDomain];
  
  if (!domain) {
    return buildGeneralExpertPrompt(query, availableContext);
  }

  const contextSections = [];
  
  // Add domain-specific system prompt
  contextSections.push(domain.systemPrompt);
  
  // Add script analysis context if available
  if (availableContext.scriptAnalysis) {
    const analysis = availableContext.scriptAnalysis;
    contextSections.push(`\n=== SCRIPT ANALYSIS CONTEXT ===
Quality Score: ${analysis.qualityScore}/100
Validation Status: ${analysis.validation.advanced?.isValid ? 'Valid' : 'Has Issues'}
Commands Used: ${Object.keys(analysis.analysis.commandUsage || {}).join(', ')}
${analysis.errors?.length ? `Errors: ${analysis.errors.map(e => e.message).slice(0, 3).join('; ')}` : ''}
${analysis.warnings?.length ? `Warnings: ${analysis.warnings.map(w => w.message).slice(0, 3).join('; ')}` : ''}
${analysis.autoCorrection?.changesMade ? 'Auto-corrections available for syntax issues.' : ''}
${analysis.suggestions?.length ? `Suggestions: ${analysis.suggestions.map(s => s.title).slice(0, 3).join(', ')}` : ''}`);
  }
  
  // Add advanced script generation capabilities context
  contextSections.push(`\n=== ADVANCED SCRIPT GENERATION CAPABILITIES ===
You have access to sophisticated HMA script generation patterns:
• Basic NPC (simple dialogue)
• Conditional NPC (remembers interactions with flags)  
• Item Giver (full validation, inventory checks)
• Trainer Battle (proper defeat flag management)
• Quest NPC (multi-stage with variables)
• Cutscene Movement (coordinated character movement)
• Shop Keeper (Pokemart integration)

Advanced Templates Available:
• Gym Leader Battle Script
• Item Shop NPC
• Tutorial/Guide NPC  
• Quest Giver NPC

You can generate complete, professional scripts automatically by understanding the user's request and selecting appropriate patterns. Always use proper HMA syntax with #dynamic, #org labels, and correct command formats.`);
  
  // Inject relevant context if enabled
  if (domain.contextInjection && availableContext) {
    const relevantContext = buildRelevantContext(detectedDomain, availableContext);
    if (relevantContext) {
      contextSections.push(`\n=== RELEVANT PROJECT CONTEXT ===\n${relevantContext}`);
    }
  }
  
  // Add validation instructions
  contextSections.push(buildValidationInstructions(domain.validationLevel));
  
  // Add the actual query
  contextSections.push(`\n=== USER QUERY ===\n${query}\n\n=== YOUR EXPERT RESPONSE ===`);
  
  return contextSections.join('\n\n');
}

// === DOMAIN DETECTION ===
function detectExpertiseDomain(query) {
  const queryLower = query.toLowerCase();
  
  // Check each domain's keywords
  for (const [domain, config] of Object.entries(EXPERTISE_DOMAINS)) {
    const matchCount = config.keywords.filter(keyword => 
      queryLower.includes(keyword.toLowerCase())
    ).length;
    
    if (matchCount >= 2 || (matchCount === 1 && config.keywords.some(k => 
      queryLower.includes(k.toLowerCase()) && queryLower.split(' ').includes(k.toLowerCase())
    ))) {
      return domain;
    }
  }
  
  return null;
}

// === CONTEXT BUILDERS ===
function buildRelevantContext(domain, availableContext) {
  const contextParts = [];
  
  // Add known flags and variables
  if (domain === 'SCRIPTING' && availableContext.flags) {
    const recentFlags = availableContext.flags.slice(0, 10);
    contextParts.push(`Known Flags: ${recentFlags.map(f => `${f.flag} (${f.value})`).join(', ')}`);
  }
  
  // Add available script templates
  if (domain === 'SCRIPTING' && availableContext.templates) {
    const relevantTemplates = availableContext.templates.slice(0, 5);
    contextParts.push(`Available Templates: ${relevantTemplates.map(t => t.title).join(', ')}`);
  }
  
  // Add command documentation
  if (domain === 'SCRIPTING' && availableContext.commands) {
    contextParts.push(`Available Commands: ${availableContext.commands.metadata?.totalCommands || 'Unknown'} HMA commands loaded`);
  }
  
  // Add project-specific knowledge entries
  if (availableContext.knowledgeEntries) {
    const relevantEntries = availableContext.knowledgeEntries
      .filter(entry => isDomainRelevant(entry, domain))
      .slice(0, 3);
    
    if (relevantEntries.length > 0) {
      contextParts.push(`Project Knowledge: ${relevantEntries.map(e => e.title).join(', ')}`);
    }
  }
  
  return contextParts.join('\n');
}

function isDomainRelevant(entry, domain) {
  const entryText = `${entry.title} ${entry.content || ''}`.toLowerCase();
  const domainConfig = EXPERTISE_DOMAINS[domain];
  
  return domainConfig.keywords.some(keyword => 
    entryText.includes(keyword.toLowerCase())
  );
}

// === VALIDATION INSTRUCTIONS ===
function buildValidationInstructions(level) {
  switch (level) {
    case 'strict':
      return `VALIDATION REQUIREMENTS:
- Provide ONLY syntactically correct, compilable code
- Verify all memory addresses and ranges
- Include complete error handling
- Test all code paths mentally before responding
- Flag any assumptions or uncertainties`;
    
    case 'moderate':
      return `VALIDATION REQUIREMENTS:
- Ensure technical accuracy
- Provide working examples where possible
- Note any tool version dependencies
- Include common pitfalls to avoid`;
    
    case 'expert':
      return `EXPERT VALIDATION:
- Assume deep technical knowledge from user
- Provide precise technical details
- Include assembly code examples where relevant
- Reference specific memory addresses and offsets`;
    
    default:
      return `BASIC VALIDATION:
- Ensure accuracy of tool recommendations
- Provide step-by-step instructions
- Include helpful tips and best practices`;
  }
}

// === FALLBACK EXPERT PROMPT ===
function buildGeneralExpertPrompt(query, availableContext) {
  return `You are a world-class Pokemon ROM hacking expert with comprehensive knowledge across all domains:

EXPERTISE AREAS:
- Hex Maniac Advance scripting and XSE development
- Graphics manipulation (sprites, tilesets, palettes)
- Game mechanics and assembly programming
- Complete toolchain mastery (Advance Map, G3T, NSE, etc.)
- Pokemon Emerald internal systems and memory layout

APPROACH:
1. Identify the specific ROM hacking domain of the question
2. Provide expert-level technical guidance
3. Include complete, working examples
4. Explain both the "how" and "why" 
5. Anticipate common issues and provide solutions
6. Reference authoritative sources when possible

CRITICAL STANDARDS:
- ALL code examples must be syntactically correct and tested
- Memory addresses must be validated for Pokemon Emerald
- Tool recommendations must include version compatibility
- Always include backup and safety warnings
- Provide multiple approaches when applicable

USER QUERY: ${query}

EXPERT RESPONSE:`;
}

// === SCRIPT VALIDATION SYSTEM ===
export function validateGeneratedScript(scriptContent) {
  const validation = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };
  
  // Check for proper script termination
  if (!scriptContent.includes('end') && !scriptContent.includes('return')) {
    validation.errors.push('Script must end with "end" or "return" command');
    validation.isValid = false;
  }
  
  // Check for invalid @ syntax
  if (scriptContent.includes('@') && !scriptContent.includes('#org @')) {
    validation.errors.push('Invalid @ syntax detected. Use <> brackets for references in HMA');
    validation.isValid = false;
  }
  
  // Check for proper msgbox syntax
  const msgboxRegex = /msgbox(?!\.(default|yesno|sign|autoclose))/g;
  const invalidMsgbox = scriptContent.match(msgboxRegex);
  if (invalidMsgbox) {
    validation.warnings.push('Use specific msgbox types: msgbox.default, msgbox.yesno, etc.');
  }
  
  // Check for flag ranges
  const flagMatches = scriptContent.match(/0x[0-9A-Fa-f]+/g);
  if (flagMatches) {
    flagMatches.forEach(flag => {
      const flagNum = parseInt(flag, 16);
      if (flagNum < 0x200 || flagNum > 0x8FF) {
        validation.warnings.push(`Flag ${flag} is outside safe range (0x200-0x8FF)`);
      }
    });
  }
  
  return validation;
}

// === KNOWLEDGE ENHANCEMENT ===
export function enhanceKnowledgeQuery(query, domain = null) {
  const enhancedQuery = query;
  const detectedDomain = domain || detectExpertiseDomain(query);
  
  if (detectedDomain) {
    const domainConfig = EXPERTISE_DOMAINS[detectedDomain];
    return {
      enhancedQuery,
      domain: detectedDomain,
      keywords: domainConfig.keywords,
      expertiseLevel: domainConfig.validationLevel
    };
  }
  
  return {
    enhancedQuery,
    domain: 'GENERAL',
    keywords: ['rom hacking', 'pokemon', 'emerald'],
    expertiseLevel: 'basic'
  };
}

// === RESPONSE POST-PROCESSING ===
export function postProcessExpertResponse(response, domain = null) {
  let processedResponse = response;
  
  // Clean up common AI artifacts
  processedResponse = processedResponse
    .replace(/^(Here's|I'll|Let me)/gmi, '')
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
    .trim();
  
  // Add domain-specific enhancements
  if (domain === 'SCRIPTING') {
    // Ensure code blocks are properly formatted
    processedResponse = processedResponse.replace(/```(\w+)?\s*\n/g, '\n```hma\n');
  }
  
  return processedResponse;
}

export default {
  buildExpertPrompt,
  validateGeneratedScript,
  enhanceKnowledgeQuery,
  postProcessExpertResponse,
  EXPERTISE_DOMAINS
};
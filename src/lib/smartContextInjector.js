// === SMART CONTEXT INJECTION SYSTEM ===
// Intelligently provides relevant context based on user queries

import { expertRomHackingKnowledge } from '@/data/expertRomHackingKnowledge.js';

export class SmartContextInjector {
  constructor() {
    this.knowledgeIndex = new Map();
    this.buildKnowledgeIndex();
  }

  // Build searchable index of knowledge entries
  buildKnowledgeIndex() {
    expertRomHackingKnowledge.forEach((entry, index) => {
      const searchableText = `${entry.topic} ${entry.content} ${entry.keywords.join(' ')}`.toLowerCase();
      const words = searchableText.split(/\s+/);
      
      words.forEach(word => {
        if (word.length > 2) { // Ignore very short words
          if (!this.knowledgeIndex.has(word)) {
            this.knowledgeIndex.set(word, []);
          }
          this.knowledgeIndex.get(word).push({ entry, index, relevance: 1 });
        }
      });
    });
  }

  // Find relevant knowledge entries for a query
  findRelevantKnowledge(query, maxResults = 3) {
    const queryWords = query.toLowerCase().split(/\s+/);
    const entryScores = new Map();

    queryWords.forEach(word => {
      if (this.knowledgeIndex.has(word)) {
        this.knowledgeIndex.get(word).forEach(({ entry, index }) => {
          const currentScore = entryScores.get(index) || 0;
          entryScores.set(index, currentScore + 1);
        });
      }
    });

    // Sort by relevance score and return top results
    const sortedEntries = Array.from(entryScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxResults)
      .map(([index]) => expertRomHackingKnowledge[index]);

    return sortedEntries;
  }

  // Build contextual information based on query type
  buildSmartContext(query, availableData = {}) {
    const context = {
      relevantKnowledge: this.findRelevantKnowledge(query),
      queryType: this.detectQueryType(query),
      activeProject: this.extractProjectContext(availableData),
      suggestions: this.generateSmartSuggestions(query)
    };

    return this.formatContextForAI(context);
  }

  // Detect what type of ROM hacking query this is
  detectQueryType(query) {
    const queryLower = query.toLowerCase();
    
    const patterns = {
      SCRIPT_HELP: /script|hma|xse|msgbox|trainerbattle|setflag|movement/i,
      GRAPHICS_HELP: /sprite|tile|palette|graphics|animation|nse|g3t/i,
      BATTLE_HELP: /battle|trainer|pokemon|stats|ai|damage|formula/i,
      TOOL_HELP: /advance map|hex editor|tool|install|setup/i,
      FLAG_HELP: /flag|variable|0x[0-9a-f]+|memory/i,
      GENERAL_HELP: /how|what|why|explain|tutorial/i
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(queryLower)) {
        return type;
      }
    }

    return 'GENERAL';
  }

  // Extract useful context from available project data
  extractProjectContext(availableData) {
    const context = {};

    if (availableData.flags && availableData.flags.length > 0) {
      context.customFlags = availableData.flags
        .filter(f => parseInt(f.value, 16) >= 0x800)
        .slice(0, 5);
    }

    if (availableData.scripts && availableData.scripts.length > 0) {
      context.recentScripts = availableData.scripts.slice(0, 3);
    }

    if (availableData.knowledgeEntries && availableData.knowledgeEntries.length > 0) {
      context.projectKnowledge = availableData.knowledgeEntries
        .filter(entry => entry.category === 'Scripting' || entry.category === 'Custom')
        .slice(0, 3);
    }

    return context;
  }

  // Generate smart suggestions based on query analysis
  generateSmartSuggestions(query) {
    const suggestions = [];
    const queryLower = query.toLowerCase();

    // Script-related suggestions
    if (queryLower.includes('script') || queryLower.includes('hma')) {
      suggestions.push('Consider checking the script templates in Script Sage');
      suggestions.push('Validate your script syntax with the built-in analyzer');
      suggestions.push('Test scripts in small increments with save states');
    }

    // Flag-related suggestions
    if (queryLower.includes('flag') || /0x[0-9a-f]+/i.test(query)) {
      suggestions.push('Use flags in the 0x800-0x8FF range for custom content');
      suggestions.push('Document all custom flags in your project notes');
      suggestions.push('Check existing flags in Flag Forge before adding new ones');
    }

    // Graphics-related suggestions
    if (queryLower.includes('sprite') || queryLower.includes('graphics')) {
      suggestions.push('Always backup your ROM before graphics modifications');
      suggestions.push('Test sprites in both battle and overworld contexts');
      suggestions.push('Verify palette compatibility with existing graphics');
    }

    return suggestions.slice(0, 2); // Limit to most relevant suggestions
  }

  // Format context into AI-readable format
  formatContextForAI(context) {
    const sections = [];

    // Add query type information
    if (context.queryType && context.queryType !== 'GENERAL') {
      sections.push(`QUERY TYPE: ${context.queryType.replace('_HELP', '')} assistance requested`);
    }

    // Add relevant knowledge
    if (context.relevantKnowledge && context.relevantKnowledge.length > 0) {
      const knowledgeSummary = context.relevantKnowledge
        .map(entry => `• ${entry.topic}: ${entry.content.slice(0, 150)}...`)
        .join('\n');
      sections.push(`RELEVANT KNOWLEDGE:\n${knowledgeSummary}`);
    }

    // Add project context
    if (context.activeProject && Object.keys(context.activeProject).length > 0) {
      const projectInfo = [];
      
      if (context.activeProject.customFlags) {
        projectInfo.push(`Custom flags: ${context.activeProject.customFlags.map(f => f.flag).join(', ')}`);
      }
      
      if (context.activeProject.projectKnowledge) {
        projectInfo.push(`Project notes: ${context.activeProject.projectKnowledge.length} relevant entries`);
      }
      
      if (projectInfo.length > 0) {
        sections.push(`PROJECT CONTEXT:\n${projectInfo.join('\n')}`);
      }
    }

    // Add smart suggestions
    if (context.suggestions && context.suggestions.length > 0) {
      sections.push(`SUGGESTIONS:\n${context.suggestions.map(s => `• ${s}`).join('\n')}`);
    }

    return sections.join('\n\n');
  }
}

// Singleton instance for performance
let contextInjector = null;

export function getSmartContextInjector() {
  if (!contextInjector) {
    contextInjector = new SmartContextInjector();
  }
  return contextInjector;
}

// Enhanced context building for Lab Assistant
export function buildEnhancedContext(query, availableData) {
  const injector = getSmartContextInjector();
  return injector.buildSmartContext(query, availableData);
}

export default SmartContextInjector;
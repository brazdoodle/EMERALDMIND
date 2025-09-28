// === ADVANCED SCRIPT VALIDATION AND ANALYSIS SYSTEM ===
// Professional-grade validation for HMA scripts with comprehensive analysis capabilities
// Path: src/lib/scriptAnalyzer.js

import { getCommandRegistry } from './commandRegistry.js';
import { getScriptValidator, validateHMAScript, autoCorrectHMAScript } from './hmaScriptValidator.js';

export function analyzeHMAScript(scriptText, { knowledgeEntries = [], templates = [], commandDocs = [] } = {}) {
  try {
    // Safety check for input
    if (typeof scriptText !== 'string') {
      scriptText = '';
    }
    
    // Get command registry and validator for enhanced analysis
    const commandRegistry = getCommandRegistry();
    const validator = getScriptValidator();
    
    // Perform comprehensive validation first
    const validationResults = validateHMAScript(scriptText);
    
    // Extract script sections
    const scriptSections = parseScriptSections(scriptText);
    const results = {
      sections: scriptSections,
      validation: {
        ...validateScriptStructure(scriptSections, scriptText, commandRegistry),
        advanced: validationResults
      },
      analysis: analyzeScriptContent(scriptSections, { knowledgeEntries, templates, commandRegistry }),
      suggestions: [],
      errors: validationResults.errors || [],
      warnings: validationResults.warnings || [],
      corrections: validationResults.corrections || [],
      qualityScore: 0,
      autoCorrection: null
    };

    // Enhanced command analysis using registry
    const commandAnalysis = analyzeCommandUsage(scriptSections, commandRegistry);
    results.analysis = { ...results.analysis, ...commandAnalysis };

    // Generate auto-correction if needed
    if (validationResults.errors.length > 0) {
      results.autoCorrection = autoCorrectHMAScript(scriptText);
    }

    // Calculate comprehensive quality score
    results.qualityScore = calculateEnhancedQualityScore(results, scriptText, validationResults);

    // Enrich results with common templates
    const relatedTemplates = findRelatedTemplates(scriptText, templates);
    if (relatedTemplates.length) {
      results.suggestions.push({
        type: 'templates',
        title: 'Related Templates',
        items: relatedTemplates
      });
    }

    // Check knowledge entries for relevant context
    const relatedKnowledge = findRelatedKnowledge(scriptText, knowledgeEntries);
    if (relatedKnowledge.length) {
      results.suggestions.push({
        type: 'knowledge',
        title: 'Related Knowledge Base Entries',
        items: relatedKnowledge
      });
    }

    // Generate comprehensive suggestions (best practices + validator suggestions)
    const bestPracticeSuggestions = generateBestPracticeSuggestions(results, scriptText);
    const validatorSuggestions = validationResults.suggestions || [];
    
    if (bestPracticeSuggestions.length) {
      results.suggestions.push({
        type: 'best_practices',
        title: 'Best Practice Recommendations',
        items: bestPracticeSuggestions
      });
    }
    
    if (validatorSuggestions.length) {
      results.suggestions.push({
        type: 'validation_suggestions',
        title: 'Script Validation Suggestions',
        items: validatorSuggestions
      });
    }

    // Attach enhanced command docs to results for UI consumption
    if (commandDocs && commandDocs.length) {
      results.commandDocs = commandDocs;
    } else if (commandAnalysis.commandUsage && commandAnalysis.commandUsage.length) {
      results.commandDocs = commandAnalysis.commandUsage;
    }

    return results;
  } catch (error) {
    return {
      sections: [],
      validation: { 
        isValid: false,
        errors: [error.message],
        warnings: [],
        unknownCommands: [],
        advanced: {
          isValid: false,
          errors: [{ line: 0, message: error.message }],
          warnings: [],
          suggestions: [],
          corrections: [],
          score: 0
        }
      },
      analysis: {
        complexity: 0,
        commandUsage: {},
        textBlockCount: 0,
        flowControl: [],
        flagOperations: [],
        categories: [],
        totalLines: 0,
        scriptSections: 0,
        totalCommands: 0,
        totalUsages: 0
      },
      suggestions: [],
      errors: [error.message],
      warnings: [],
      corrections: [],
      qualityScore: 0,
      autoCorrection: null
    };
  }
}

function parseScriptSections(scriptText) {
  const sections = [];
  let currentSection = { type: null, label: null, content: [], start: 0 };
  const lines = scriptText.split('\n');

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Label definition - handle both traditional labels and ROM hacking format
    if (trimmedLine.match(/^\w+:/)) {
      if (currentSection.content.length) {
        sections.push({ ...currentSection, end: index });
      }
      currentSection = {
        type: 'script',
        label: trimmedLine.replace(':', ''),
        content: [],
        start: index
      };
    }
    // Handle hex address comments (ROM hacking format)
    else if (trimmedLine.match(/^#\s*[0-9A-Fa-f]+/) && currentSection.type === 'script') {
      // This is a hex address comment, add it to content but don't break the section
      currentSection.content.push(line);
    } 
    // Text block start
    else if (trimmedLine === '{') {
      if (currentSection.type === 'script') {
        sections.push({ ...currentSection, end: index });
      }
      currentSection = {
        type: 'text',
        label: sections[sections.length - 1]?.label,
        content: [],
        start: index
      };
    }
    // Text block end
    else if (trimmedLine === '}') {
      currentSection.content.push(line);
      sections.push({ ...currentSection, end: index + 1 });
      currentSection = { type: null, label: null, content: [], start: index + 1 };
    }
    // Line content
    else if (currentSection.type) {
      currentSection.content.push(line);
    }
  });

  // Add final section if it has content
  if (currentSection.content.length) {
    sections.push({ ...currentSection, end: lines.length });
  }

  return sections;
}

function validateScriptStructure(sections, scriptText = '', commandRegistry = null) {
  const validation = {
    isValid: true,
    hasMainScript: false,
    textBlocks: {},
    labelReferences: new Set(),
    errors: [],
    warnings: [],
    unknownCommands: [],
    invalidCommands: []
  };

  // First pass: collect text blocks and label definitions
  sections.forEach(section => {
    if (section.type === 'script') {
      // Accept various entry point patterns:
      // - main_script (traditional)
      // - section1, section2, etc. (ROM hacking standard)
      // - script_XXXXXX (hex addresses)
      // - Any label that starts with 'section' or contains numbers
      if (section.label === 'main_script' || 
          section.label.match(/^section\d+$/) || 
          section.label.match(/^script_[0-9A-Fa-f]+$/) ||
          section.label.match(/^\w*\d+\w*$/)) {
        validation.hasMainScript = true;
      }
    } else if (section.type === 'text') {
      validation.textBlocks[section.label] = true;
    }
  });

  // Second pass: check references and validate commands
  sections.forEach(section => {
    if (section.type === 'script') {
      section.content.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith(';') || trimmedLine === '') return;

        // Check for invalid @ syntax (blacklisted)
        if (trimmedLine.includes('@')) {
          validation.errors.push(`Invalid syntax: '@' symbol is not supported in ROM hacking scripts. Use proper msgbox syntax like 'msgbox.npc', 'msgbox.sign', etc.`);
          validation.isValid = false;
        }

        // Extract command from line
        const commandMatch = trimmedLine.match(/^(\w+(?:\.\w+)*)/);
        if (commandMatch && commandRegistry) {
          const command = commandMatch[1];
          const registryCommand = commandRegistry.getCommand(command);
          
          if (!registryCommand) {
            validation.unknownCommands.push(command);
            validation.warnings.push(`Unknown command: ${command}`);
          } else if (registryCommand.confidence < 0.5) {
            validation.invalidCommands.push(command);
            validation.warnings.push(`Low-confidence command: ${command}`);
          }
        }

        // Check msgbox references
        const msgboxMatch = line.match(/msgbox\.\w+\s+<(\w+)>/);
        if (msgboxMatch && !validation.textBlocks[msgboxMatch[1]]) {
          validation.errors.push(`Missing text block for label: ${msgboxMatch[1]}`);
          validation.isValid = false;
        }

        // Check goto references
        const gotoMatch = line.match(/goto\s+<(\w+)>/);
        if (gotoMatch) validation.labelReferences.add(gotoMatch[1]);
      });
    }
  });

  // Check for entry point - accept various formats
  if (!validation.hasMainScript) {
    const hasHeader = /#dynamic|#org|#\s*[0-9A-Fa-f]+/.test(scriptText);
    const hasAnyLabel = sections.some(s => s.type === 'script' && s.label);
    
    if (hasHeader && hasAnyLabel) {
      // Has both header and labels - this is valid ROM hacking format
      validation.hasMainScript = true;
    } else if (hasAnyLabel) {
      validation.warnings.push('Script has labels but no memory address - consider adding hex address comment');
    } else {
      validation.errors.push('Missing script entry point (label or main_script)');
      validation.isValid = false;
    }
  }

  // Remove duplicates
  validation.unknownCommands = [...new Set(validation.unknownCommands)];
  validation.invalidCommands = [...new Set(validation.invalidCommands)];

  return validation;
}

function analyzeScriptContent(sections, { knowledgeEntries, templates, commandRegistry }) {
  const analysis = {
    complexity: 0,
    commandUsage: {},
    textBlockCount: 0,
    flowControl: [],
    flagOperations: new Set(),
    categories: new Set(),
    totalLines: 0,
    scriptSections: sections.filter(s => s.type === 'script').length
  };

  sections.forEach(section => {
    if (section.type === 'script') {
      section.content.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith(';')) return;
        
        analysis.totalLines++;

        // Count command usage
        const commandMatch = trimmedLine.match(/^(\w+(?:\.\w+)*)/);
        if (commandMatch) {
          const command = commandMatch[1];
          analysis.commandUsage[command] = (analysis.commandUsage[command] || 0) + 1;
          
          // Track categories if we have registry data
          if (commandRegistry) {
            const registryCommand = commandRegistry.getCommand(command);
            if (registryCommand) {
              analysis.categories.add(registryCommand.category);
            }
          }
        }
        
        // Track flow control
        if (line.includes('goto') || line.includes('call')) {
          analysis.flowControl.push({
            from: section.label,
            to: line.match(/<(\w+)>/)?.[1],
            type: line.includes('goto') ? 'goto' : 'call'
          });
        }

        // Track flag operations
        const flagMatch = line.match(/(?:set|clear|check)flag\.(\w+)/);
        if (flagMatch) analysis.flagOperations.add(flagMatch[1]);

        // Increase complexity for various constructs
        if (line.includes('if.') || line.includes('goto')) analysis.complexity += 2;
        if (line.includes('call')) analysis.complexity += 1;
        if (line.includes('battle') || line.includes('special')) analysis.complexity += 3;
        if (flagMatch) analysis.complexity += 1;
      });
    } else if (section.type === 'text') {
      analysis.textBlockCount++;
    }
  });

  // Convert sets to arrays for JSON serialization
  analysis.categories = Array.from(analysis.categories);
  analysis.flagOperations = Array.from(analysis.flagOperations);

  return analysis;
}

function findRelatedTemplates(scriptText, templates) {
  return templates.filter(template => {
    const keywords = extractKeywords(scriptText);
    const templateKeywords = extractKeywords(template.code);
    return hasOverlap(keywords, templateKeywords);
  }).map(t => ({
    title: t.title,
    description: t.description,
    code: t.code
  }));
}

function findRelatedKnowledge(scriptText, knowledgeEntries) {
  return knowledgeEntries.filter(entry => {
    const scriptKeywords = extractKeywords(scriptText);
    const entryKeywords = extractKeywords(entry.content);
    return hasOverlap(scriptKeywords, entryKeywords);
  }).map(e => ({
    title: e.title,
    content: e.content,
    tags: e.tags
  }));
}

function extractKeywords(text) {
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word));
}

function hasOverlap(arrayA, arrayB) {
  const setB = new Set(arrayB);
  return arrayA.some(item => setB.has(item));
}

// Enhanced command usage analysis with registry integration
function analyzeCommandUsage(sections, commandRegistry) {
  const commandUsage = [];
  const usageMap = new Map();

  sections.forEach(section => {
    if (section.type === 'script') {
      section.content.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith(';')) return;

        const commandMatch = trimmedLine.match(/^(\w+(?:\.\w+)*)/);
        if (commandMatch) {
          const command = commandMatch[1];
          
          if (!usageMap.has(command)) {
            usageMap.set(command, {
              command,
              count: 0,
              documentation: null
            });
          }
          
          usageMap.get(command).count++;

          // Get documentation from registry
          if (commandRegistry) {
            const registryCommand = commandRegistry.getCommand(command);
            if (registryCommand) {
              usageMap.get(command).documentation = {
                syntax: registryCommand.syntax,
                description: registryCommand.description,
                category: registryCommand.category,
                confidence: registryCommand.confidence,
                examples: registryCommand.examples,
                notes: registryCommand.confidence < 0.5 ? 'Low confidence - verify usage' : null
              };
            }
          }
        }
      });
    }
  });

  return {
    commandUsage: Array.from(usageMap.values()).sort((a, b) => b.count - a.count),
    totalCommands: usageMap.size,
    totalUsages: Array.from(usageMap.values()).reduce((sum, cmd) => sum + cmd.count, 0)
  };
}

// Enhanced quality score calculation incorporating advanced validation
function calculateEnhancedQualityScore(results, scriptText, validationResults) {
  let score = 0;
  const maxScore = 100;

  // Safety check - ensure results structure exists
  if (!results || !results.analysis || !results.validation) {
    return 0;
  }

  // Use validator score if available (50% weight)
  if (validationResults && typeof validationResults.score === 'number') {
    score += Math.floor(validationResults.score * 0.5);
  }

  // Structure score (20 points)
  if (results.validation.isValid) score += 10;
  if (results.analysis.textBlockCount > 0) score += 5;
  if (results.analysis.scriptSections > 1) score += 5;

  // Complexity and best practices (30 points)
  const totalLines = results.analysis.totalLines || 1;
  const complexity = results.analysis.complexity || 0;
  const complexityRatio = Math.min(complexity / totalLines, 1);
  if (complexityRatio > 0.1 && complexityRatio < 0.5) score += 10; // Balanced complexity
  if (results.analysis.categories.length >= 3) score += 5; // Command diversity
  
  // Advanced validation bonuses
  if (scriptText.includes('faceplayer')) score += 3;
  if (scriptText.includes('release') || scriptText.includes('end')) score += 3;
  if (results.analysis.flagOperations.length > 0) score += 4;
  if (results.validation.errors.length === 0) score += 5;

  return Math.min(score, maxScore);
}

// Legacy function for backward compatibility
function calculateQualityScore(results, scriptText) {
  return calculateEnhancedQualityScore(results, scriptText, null);
}

// Generate best practice suggestions
function generateBestPracticeSuggestions(results, scriptText) {
  const suggestions = [];
  
  // Safety check - ensure results structure exists
  if (!results || !results.analysis || !results.validation) {
    return suggestions;
  }

  // Check for common issues
  if (!scriptText.includes('faceplayer') && scriptText.includes('msgbox')) {
    suggestions.push({
      type: 'missing_faceplayer',
      title: 'Consider adding faceplayer',
      description: 'NPCs should typically face the player before speaking'
    });
  }

  if (!scriptText.includes('release') && !scriptText.includes('end')) {
    suggestions.push({
      type: 'missing_cleanup',
      title: 'Script should end properly',
      description: 'Scripts should end with "release" or "end" for proper cleanup'
    });
  }

  if (results.validation.unknownCommands.length > 0) {
    suggestions.push({
      type: 'unknown_commands',
      title: 'Unknown commands detected',
      description: `Review these commands: ${results.validation.unknownCommands.join(', ')}`
    });
  }

  // Safety check for complexity analysis
  const totalLines = results.analysis?.totalLines || 1;
  const complexity = results.analysis?.complexity || 0;
  if (complexity > totalLines * 0.8) {
    suggestions.push({
      type: 'high_complexity',
      title: 'Script complexity is high',
      description: 'Consider breaking complex logic into smaller sections'
    });
  }

  if (results.analysis.categories.length === 1) {
    suggestions.push({
      type: 'limited_variety',
      title: 'Limited command variety',
      description: 'Consider using commands from different categories for richer interactions'
    });
  }

  return suggestions;
}
// === ADVANCED SCRIPT VALIDATION AND CORRECTION SYSTEM ===
// Professional-grade validation for HMA scripts with auto-correction capabilities

export class HMAScriptValidator {
  constructor() {
    // STRICT HMA-ONLY COMMAND SET - NO XSE OR OTHER LANGUAGES
    this.validCommands = new Set([
      // Core flow control (HMA standard)
      'lock', 'lockall', 'release', 'releaseall', 'end', 'return',
      'faceplayer', 'pause', 'call', 'goto',
      
      // Message system (HMA msgbox variants only)
      'msgbox.default', 'msgbox.yesno', 'msgbox.sign', 'msgbox.autoclose',
      'msgbox.npc', 'msgbox.item', 'msgbox.closeonkeypress',
      'preparemsg', 'waitmsg',
      
      // Flag and variable system (HMA syntax)
      'setflag', 'clearflag', 'checkflag', 'setvar', 'addvar', 'subvar',
      'copyvar', 'compare', 'checkvar', 'random',
      
      // Control flow conditionals (HMA format)
      'if.flag.set.goto', 'if.flag.clear.goto', 'if.flag.set.call', 'if.flag.clear.call',
      'if.var.eq.goto', 'if.var.ne.goto', 'if.var.lt.goto', 'if.var.gt.goto',
      'if.yes.goto', 'if.no.goto', 'if.yes.call', 'if.no.call',
      
      // Movement commands
      'applymovement', 'waitmovement', 'move', 'walk',
      
      // Battle system (HMA trainer battle format)
      'trainerbattle', 'trainerbattle.start', 'trainerbattle.no.intro',
      'trainerbattle.double', 'setwildbattle', 'dowildbattle',
      
      // Items and Pokemon management
      'giveitem', 'takeitem', 'checkitem', 'checkitemspace',
      'givepokemon', 'checkpartysize', 'healparty',
      
      // Audio and effects
      'playbgm', 'playfanfare', 'playsound', 'fadedefaultbgm',
      'sound', 'cry', 'waitcry',
      
      // Warps and maps
      'warp', 'warp8', 'teleport', 'getplayerxy', 'getpartysize',
      'waitstate', 'resetvars',
      
      // Advanced commands (use with caution)
      'special', 'callasm', 'writebytetoaddr', 'loadbytefromaddr'
    ]);

    // FORBIDDEN XSE/OTHER SYNTAX PATTERNS  
    this.forbiddenPatterns = [
      { pattern: /@\w+/, message: '@ symbols not allowed in HMA - use <labelname> format' },
      { pattern: /\bmsgbox\s+@/, message: 'Use msgbox.default <label> instead of msgbox @label' },
      { pattern: /\bmessage\b/, message: 'Use msgbox.default instead of message command' },
      { pattern: /\btext\s+@/, message: 'Use msgbox.default <label> instead of text @label' },
      { pattern: /\$[0-9A-Fa-f]+/, message: 'Use 0x format instead of $ for hex values' },
      { pattern: /\.align\b/, message: 'Assembly directives not allowed in pure HMA scripts' },
      { pattern: /\.thumb\b/, message: 'Assembly directives not allowed in pure HMA scripts' }
    ];

    this.flagRanges = {
      TEMP: { min: 0x200, max: 0x2FF, description: 'Temporary flags (reset on map change)' },
      TRAINER: { min: 0x300, max: 0x3FF, description: 'Trainer defeat flags' },
      ITEM: { min: 0x400, max: 0x4FF, description: 'Item collection flags' },
      STORY: { min: 0x500, max: 0x5FF, description: 'Story progression flags' },
      SYSTEM: { min: 0x600, max: 0x7FF, description: 'System and access flags' },
      CUSTOM: { min: 0x800, max: 0x8FF, description: 'Safe custom flags' }
    };

    this.variableRanges = {
      SYSTEM: { min: 0x4000, max: 0x7FFF, description: 'System variables (read-only)' },
      CUSTOM: { min: 0x8000, max: 0x80FF, description: 'Safe custom variables' }
    };
  }

  // Comprehensive script validation
  validateScript(scriptContent) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      corrections: [],
      score: 0
    };

    const lines = scriptContent.split('\n');
    let hasMainEntry = false;
    let hasEnd = false;
    let lockCount = 0;
    let releaseCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineNum = i + 1;
      
      if (!line || line.startsWith('//') || line.startsWith(';')) continue;
      
      // Check for script entry points
      if (line.match(/^\w+:/)) {
        hasMainEntry = true;
        continue;
      }
      
      // Check for proper script termination
      if (line.includes('end') || line.includes('return')) {
        hasEnd = true;
      }
      
      // Validate commands
      const commandMatch = line.match(/^(\w+(?:\.\w+)*)/);
      if (commandMatch) {
        const command = commandMatch[1];
        
        if (!this.validCommands.has(command)) {
          validation.errors.push({
            line: lineNum,
            message: `Unknown command: ${command}`,
            suggestion: this.suggestCommand(command)
          });
          validation.isValid = false;
        }
        
        // Track lock/release balance
        if (command === 'lock' || command === 'lockall') lockCount++;
        if (command === 'release' || command === 'releaseall') releaseCount++;
      }
      
      // Validate flag usage
      const flagMatch = line.match(/0x([0-9A-Fa-f]+)/);
      if (flagMatch) {
        const flagValue = parseInt(flagMatch[1], 16);
        const flagValidation = this.validateFlag(flagValue);
        
        if (!flagValidation.isValid) {
          validation.warnings.push({
            line: lineNum,
            message: flagValidation.message,
            suggestion: flagValidation.suggestion
          });
        }
      }
      
      // Check for forbidden patterns (XSE/other syntax)
      if (this.forbiddenPatterns) {
        this.forbiddenPatterns.forEach(pattern => {
          if (pattern.pattern.test(line)) {
            validation.errors.push({
              line: lineNum,
              message: `Forbidden syntax: ${pattern.message}`,
              code: line.trim()
            });
            validation.isValid = false;
          }
        });
      }
      
      // Check for deprecated @ syntax (most common issue)
      if (line.includes('@') && !line.includes('#org @')) {
        validation.errors.push({
          line: lineNum,
          message: 'Invalid @ syntax - use HMA format',
          correction: 'Use <labelname> instead of @labelname'
        });
        validation.corrections.push({
          line: lineNum,
          original: line,
          corrected: line.replace(/@(\w+)/g, '<$1>')
        });
        validation.isValid = false;
      }
      
      // Check msgbox syntax
      if (line.includes('msgbox') && !line.match(/msgbox\.(default|yesno|sign|autoclose)/)) {
        validation.warnings.push({
          line: lineNum,
          message: 'Use specific msgbox types (msgbox.default, msgbox.yesno, etc.)',
          suggestion: 'Replace with msgbox.default for basic dialogue'
        });
      }
    }
    
    // Global validations
    if (!hasMainEntry) {
      validation.errors.push({
        line: 0,
        message: 'Script missing entry point (label ending with :)',
        suggestion: 'Add a label like "main_script:" at the beginning'
      });
      validation.isValid = false;
    }
    
    if (!hasEnd) {
      validation.errors.push({
        line: lines.length,
        message: 'Script missing termination command',
        suggestion: 'Add "end" or "return" at the end of script'
      });
      validation.corrections.push({
        line: lines.length + 1,
        original: '',
        corrected: 'end'
      });
      validation.isValid = false;
    }
    
    if (lockCount !== releaseCount) {
      validation.warnings.push({
        line: 0,
        message: `Unbalanced lock/release commands (${lockCount} locks, ${releaseCount} releases)`,
        suggestion: 'Ensure every lock has a corresponding release'
      });
    }
    
    // Calculate quality score
    validation.score = this.calculateScriptScore(validation, lines.length);
    
    return validation;
  }

  // Validate flag values against known ranges
  validateFlag(flagValue) {
    for (const [rangeName, range] of Object.entries(this.flagRanges)) {
      if (flagValue >= range.min && flagValue <= range.max) {
        return {
          isValid: true,
          range: rangeName,
          description: range.description
        };
      }
    }
    
    return {
      isValid: false,
      message: `Flag 0x${flagValue.toString(16).toUpperCase()} is outside known ranges`,
      suggestion: `Consider using custom flag range (0x800-0x8FF) or verify flag purpose`
    };
  }

  // Suggest similar commands for typos
  suggestCommand(invalidCommand) {
    const suggestions = [];
    
    for (const validCommand of this.validCommands) {
      const similarity = this.calculateSimilarity(invalidCommand, validCommand);
      if (similarity > 0.6) {
        suggestions.push({ command: validCommand, similarity });
      }
    }
    
    suggestions.sort((a, b) => b.similarity - a.similarity);
    return suggestions.slice(0, 3).map(s => s.command);
  }
  
  // Calculate string similarity (Levenshtein distance)
  calculateSimilarity(str1, str2) {
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;
    
    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    const distance = matrix[len2][len1];
    const maxLen = Math.max(len1, len2);
    return maxLen > 0 ? (maxLen - distance) / maxLen : 0;
  }
  
  // Calculate overall script quality score
  calculateScriptScore(validation, lineCount) {
    let score = 100;
    
    // Deduct points for errors and warnings
    score -= validation.errors.length * 15;
    score -= validation.warnings.length * 5;
    
    // Bonus points for good practices
    if (lineCount > 5 && validation.errors.length === 0) score += 10;
    if (validation.warnings.length === 0) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }
  
  // Auto-correct common script issues
  autoCorrectScript(scriptContent) {
    let corrected = scriptContent;
    const corrections = [];
    
    // Fix @ syntax
    const atMatches = corrected.match(/@(\w+)/g);
    if (atMatches) {
      atMatches.forEach(match => {
        const replacement = match.replace('@', '<') + '>';
        corrected = corrected.replace(match, replacement);
        corrections.push(`Fixed deprecated syntax: ${match} → ${replacement}`);
      });
    }
    
    // Add missing 'end' command
    const lines = corrected.split('\n');
    const lastLine = lines[lines.length - 1].trim();
    if (lastLine && !lastLine.includes('end') && !lastLine.includes('return')) {
      corrected += '\nend';
      corrections.push('Added missing "end" command');
    }
    
    // Fix common msgbox issues
    corrected = corrected.replace(/\bmsgbox\s+(?!\.)/g, 'msgbox.default ');
    if (corrected !== scriptContent) {
      corrections.push('Fixed msgbox syntax to use specific types');
    }
    
    return {
      corrected,
      corrections,
      changesMade: corrections.length > 0
    };
  }
  
  // Generate best practice suggestions
  generateBestPractices(scriptContent) {
    const suggestions = [];
    
    if (!scriptContent.includes('//') && !scriptContent.includes(';')) {
      suggestions.push('Add comments to explain script logic');
    }
    
    if (scriptContent.includes('0x') && !scriptContent.includes('//')) {
      suggestions.push('Document flag/variable usage with comments');
    }
    
    if (scriptContent.split('\n').length > 20) {
      suggestions.push('Consider breaking large scripts into smaller, reusable functions');
    }
    
    if (scriptContent.includes('trainerbattle') && !scriptContent.includes('checkflag')) {
      suggestions.push('Add flag checks to prevent trainer rematches');
    }
    
    return suggestions;
  }
}

// Singleton validator instance
let validator = null;

export function getScriptValidator() {
  if (!validator) {
    validator = new HMAScriptValidator();
  }
  return validator;
}

// Convenience functions for integration
export function validateHMAScript(scriptContent) {
  const validator = getScriptValidator();
  return validator.validateScript(scriptContent);
}

export function autoCorrectHMAScript(scriptContent) {
  const validator = getScriptValidator();
  return validator.autoCorrectScript(scriptContent);
}

export function getScriptSuggestions(scriptContent) {
  const validator = getScriptValidator();
  return validator.generateBestPractices(scriptContent);
}

export default HMAScriptValidator;
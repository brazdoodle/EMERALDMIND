/**
 * Output Validators - Validate and repair LLM outputs for consistency
 * Handles JSON validation, HMA script validation, and common format repairs
 */

/**
 * JSON Validator with comprehensive repair capabilities
 */
export class JSONValidator {
  /**
   * Validate JSON output against a schema
   * @param {string} output - Raw model output
   * @param {Object} schema - JSON schema to validate against
   * @returns {Object} { valid: boolean, parsed: object|null, errors: string[], repaired: object|null }
   */
  static validate(output, schema = null) {
    const result = {
      valid: false,
      parsed: null,
      errors: [],
      repaired: null
    };

    if (!output || typeof output !== 'string') {
      result.errors.push('Output is empty or not a string');
      return result;
    }

    // Try direct parse first
    try {
      const parsed = JSON.parse(output.trim());
      result.parsed = parsed;
      result.valid = schema ? this.validateSchema(parsed, schema).valid : true;
      if (!result.valid && schema) {
        result.errors = this.validateSchema(parsed, schema).errors;
      }
      return result;
    } catch (directParseError) {
      result.errors.push(`Direct parse failed: ${directParseError.message}`);
    }

    // Try repair strategies
    const repairStrategies = [
      this.stripCodeFences,
      this.extractBalancedJSON,
      this.repairCommonIssues,
      this.repairQuotes,
      this.repairTrailingCommas,
      this.balanceBraces
    ];

    for (const strategy of repairStrategies) {
      try {
        const repaired = strategy(output);
        if (repaired && repaired !== output) {
          try {
            const parsed = JSON.parse(repaired);
            result.repaired = parsed;
            result.valid = schema ? this.validateSchema(parsed, schema).valid : true;
            if (result.valid) {
              return result;
            }
          } catch (repairError) {
            // Continue to next strategy
          }
        }
      } catch (strategyError) {
        // Strategy failed, continue
      }
    }

    // Final attempt with aggressive cleaning
    try {
      const aggressiveRepair = this.aggressiveRepair(output);
      const parsed = JSON.parse(aggressiveRepair);
      result.repaired = parsed;
      result.valid = schema ? this.validateSchema(parsed, schema).valid : true;
      if (!result.valid && schema) {
        result.errors.push(...this.validateSchema(parsed, schema).errors);
      }
    } catch (finalError) {
      result.errors.push(`All repair attempts failed. Final error: ${finalError.message}`);
    }

    return result;
  }

  /**
   * Strip code fences and extract content
   */
  static stripCodeFences(text) {
    const fenceMatch = text.match(/```(?:json|js|javascript)?\s*([\s\S]*?)\s*```/i);
    if (fenceMatch && fenceMatch[1]) {
      return fenceMatch[1].trim();
    }
    return text.replace(/```/g, '').trim();
  }

  /**
   * Extract balanced JSON object/array
   */
  static extractBalancedJSON(text) {
    const start = text.search(/[\{\[]/);
    if (start === -1) return text;

    const stack = [];
    for (let i = start; i < text.length; i++) {
      const ch = text[i];
      if (ch === '{' || ch === '[') {
        stack.push(ch);
      } else if (ch === '}' || ch === ']') {
        const last = stack[stack.length - 1];
        if ((ch === '}' && last === '{') || (ch === ']' && last === '[')) {
          stack.pop();
          if (stack.length === 0) {
            return text.slice(start, i + 1);
          }
        } else {
          return text; // Mismatched, return original
        }
      }
    }
    return text;
  }

  /**
   * Repair common JSON issues
   */
  static repairCommonIssues(text) {
    return text
      // Fix unquoted keys
      .replace(/([\{,\s])(\w+)\s*:/g, '$1"$2":')
      // Fix single quotes to double quotes
      .replace(/'([^']*)'/g, '"$1"')
      // Remove trailing commas
      .replace(/,\s*([\]}])/g, '$1')
      // Fix common boolean/null values
      .replace(/:\s*True\b/g, ': true')
      .replace(/:\s*False\b/g, ': false')
      .replace(/:\s*None\b/g, ': null');
  }

  /**
   * Fix quote issues
   */
  static repairQuotes(text) {
    // Handle mixed quotes
    return text
      .replace(/'/g, '"')
      .replace(/"/g, '"') // Fix smart quotes
      .replace(/"/g, '"');
  }

  /**
   * Remove trailing commas
   */
  static repairTrailingCommas(text) {
    return text.replace(/,(\s*[}\]])/g, '$1');
  }

  /**
   * Balance braces and brackets
   */
  static balanceBraces(text) {
    const openBraces = (text.match(/\{/g) || []).length;
    const closeBraces = (text.match(/\}/g) || []).length;
    const openBrackets = (text.match(/\[/g) || []).length;
    const closeBrackets = (text.match(/\]/g) || []).length;

    let result = text;
    if (openBraces > closeBraces) {
      result += '}'.repeat(openBraces - closeBraces);
    }
    if (openBrackets > closeBrackets) {
      result += ']'.repeat(openBrackets - closeBrackets);
    }

    return result;
  }

  /**
   * Aggressive repair as last resort
   */
  static aggressiveRepair(text) {
    let repaired = text;
    
    // Remove everything before first { or [
    const jsonStart = repaired.search(/[\{\[]/);
    if (jsonStart > 0) {
      repaired = repaired.slice(jsonStart);
    }

    // Remove everything after last } or ]
    const lastBrace = Math.max(repaired.lastIndexOf('}'), repaired.lastIndexOf(']'));
    if (lastBrace > 0 && lastBrace < repaired.length - 1) {
      repaired = repaired.slice(0, lastBrace + 1);
    }

    // Apply all other repairs
    repaired = this.repairCommonIssues(repaired);
    repaired = this.repairQuotes(repaired);
    repaired = this.repairTrailingCommas(repaired);
    repaired = this.balanceBraces(repaired);

    return repaired;
  }

  /**
   * Validate parsed JSON against schema
   */
  static validateSchema(parsed, schema) {
    const result = { valid: true, errors: [] };

    if (!schema) return result;

    try {
      if (schema.type === 'object' && typeof parsed !== 'object') {
        result.valid = false;
        result.errors.push('Expected object, got ' + typeof parsed);
      }

      if (schema.type === 'array' && !Array.isArray(parsed)) {
        result.valid = false;
        result.errors.push('Expected array, got ' + typeof parsed);
      }

      if (schema.required && Array.isArray(schema.required)) {
        for (const req of schema.required) {
          if (!(req in parsed)) {
            result.valid = false;
            result.errors.push(`Missing required field: ${req}`);
          }
        }
      }

      if (schema.properties) {
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          if (key in parsed) {
            const propResult = this.validateSchema(parsed[key], propSchema);
            if (!propResult.valid) {
              result.valid = false;
              result.errors.push(...propResult.errors.map(e => `${key}: ${e}`));
            }
          }
        }
      }
    } catch (validationError) {
      result.valid = false;
      result.errors.push(`Schema validation error: ${validationError.message}`);
    }

    return result;
  }
}

/**
 * HMA Script Validator for Pokemon Emerald scripts
 */
export class HMAScriptValidator {
  /**
   * Validate HMA script output
   * @param {string} output - Raw script output
   * @param {Object} flagMap - Map of flag names to hex IDs
   * @returns {Object} { valid: boolean, script: string, errors: string[], repaired: string|null }
   */
  static validate(output, flagMap = {}) {
    const result = {
      valid: false,
      script: '',
      errors: [],
      repaired: null
    };

    if (!output || typeof output !== 'string') {
      result.errors.push('Output is empty or not a string');
      return result;
    }

    // Extract script from fences
    let script = this.extractScript(output);
    
    // Validate script commands
    const validation = this.validateCommands(script);
    result.errors = validation.errors;
    result.valid = validation.valid;
    result.script = script;

    // Try to repair flag references if flagMap provided
    if (Object.keys(flagMap).length > 0) {
      const repaired = this.repairFlagReferences(script, flagMap);
      if (repaired !== script) {
        result.repaired = repaired;
        const repairedValidation = this.validateCommands(repaired);
        if (repairedValidation.valid && !result.valid) {
          result.valid = true;
          result.errors = [];
        }
      }
    }

    return result;
  }

  /**
   * Extract script from code fences or clean up formatting
   */
  static extractScript(output) {
    // Look for HMA code fence
    const hmaMatch = output.match(/```hma\s*([\s\S]*?)\s*```/i);
    if (hmaMatch && hmaMatch[1]) {
      return hmaMatch[1].trim();
    }

    // Look for any code fence
    const codeMatch = output.match(/```\s*([\s\S]*?)\s*```/);
    if (codeMatch && codeMatch[1]) {
      return codeMatch[1].trim();
    }

    // No fences, return cleaned output
    return output.trim();
  }

  /**
   * Validate HMA script commands
   */
  static validateCommands(script) {
    const result = { valid: true, errors: [] };
    const lines = script.split('\n').map(line => line.trim()).filter(Boolean);

    const validCommands = [
      'setflag', 'clearflag', 'checkflag', 'giveitem', 'checkitem',
      'givepokemon', 'setvar', 'checkvar', 'addvar', 'subvar',
      'compare', 'if', 'else', 'endif', 'goto', 'call', 'return',
      'message', 'closemessage', 'waitkeypress', 'yesnobox',
      'multichoice', 'playse', 'playbgm', 'fadedefault',
      'heal', 'trainerbattle', 'special', 'waitstate', 'end'
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('#') || line.startsWith('//')) continue; // Comments

      const parts = line.split(/\s+/);
      const command = parts[0].toLowerCase();

      if (!validCommands.includes(command)) {
        result.valid = false;
        result.errors.push(`Line ${i + 1}: Unknown command '${command}'`);
      }

      // Validate flag commands have proper hex format
      if (['setflag', 'clearflag', 'checkflag'].includes(command)) {
        if (parts.length < 2) {
          result.valid = false;
          result.errors.push(`Line ${i + 1}: ${command} requires a flag parameter`);
        } else {
          const flagParam = parts[1];
          if (!flagParam.match(/^0x[0-9A-Fa-f]+$/) && !flagParam.match(/^[0-9]+$/)) {
            result.errors.push(`Line ${i + 1}: Flag '${flagParam}' should be hex (0x123) or numeric`);
          }
        }
      }
    }

    return result;
  }

  /**
   * Repair flag references using flag map
   */
  static repairFlagReferences(script, flagMap) {
    let repaired = script;

    for (const [flagName, flagId] of Object.entries(flagMap)) {
      // Replace flag names with hex IDs
      const flagNameRegex = new RegExp(`\\b${flagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
      repaired = repaired.replace(flagNameRegex, flagId);
      
      // Also handle quoted flag names
      const quotedRegex = new RegExp(`"${flagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g');
      repaired = repaired.replace(quotedRegex, flagId);
    }

    return repaired;
  }
}

/**
 * Generic output validator that routes to specific validators
 */
export class OutputValidator {
  /**
   * Validate output based on expected type
   * @param {string} output - Raw model output
   * @param {string} type - Expected output type ('json', 'hma_script', 'text')
   * @param {Object} options - Validation options (schema, flagMap, etc.)
   * @returns {Object} Validation result
   */
  static validate(output, type, options = {}) {
    switch (type.toLowerCase()) {
      case 'json':
        return JSONValidator.validate(output, options.schema);
      
      case 'hma_script':
      case 'script':
        return HMAScriptValidator.validate(output, options.flagMap);
      
      case 'text':
      default:
        return {
          valid: true,
          content: output,
          errors: [],
          repaired: null
        };
    }
  }

  /**
   * Quick validation check - returns true if output is valid
   * @param {string} output - Raw model output
   * @param {string} type - Expected output type
   * @param {Object} options - Validation options
   * @returns {boolean} True if valid
   */
  static isValid(output, type, options = {}) {
    return this.validate(output, type, options).valid;
  }

  /**
   * Get best available output (repaired if available and valid, otherwise original)
   * @param {string} output - Raw model output
   * @param {string} type - Expected output type
   * @param {Object} options - Validation options
   * @returns {*} Best available output
   */
  static getBestOutput(output, type, options = {}) {
    const validation = this.validate(output, type, options);
    
    if (type === 'json') {
      return validation.repaired || validation.parsed;
    } else if (type === 'hma_script') {
      return validation.repaired || validation.script;
    } else {
      return validation.content;
    }
  }
}

export default {
  JSONValidator,
  HMAScriptValidator,
  OutputValidator
};
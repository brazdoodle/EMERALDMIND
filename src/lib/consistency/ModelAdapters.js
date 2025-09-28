/**
 * Model Adapters - Handle per-model quirks for consistent output
 * Each adapter defines temperature preferences, system prompts, output parsing, and retry strategies
 */

export const ModelAdapters = {
  // Llama models tend to be chatty and use "Sure!" prefixes
  'llama3.1': {
    name: 'Llama 3.1',
    preferredTemperature: 0.1,
    maxTemperature: 0.3,
    systemPrompt: 'You are a precise assistant. Follow instructions exactly with no extra commentary.',
    outputParser: (text) => {
      if (!text || typeof text !== 'string') return text;
      // Remove common Llama chattiness
      return text
        .replace(/^(Sure[,!]\s*|Certainly[,!]\s*|Of course[,!]\s*)/i, '')
        .replace(/^(Here's.*?:\s*|Here is.*?:\s*)/i, '')
        .replace(/^(Let me.*?\.\s*)/i, '')
        .trim();
    },
    retryStrategy: 'lower_temperature',
    quirks: ['chatty', 'helpful_prefixes']
  },

  // Qwen models are good but sometimes add explanations
  'qwen2.5': {
    name: 'Qwen 2.5',
    preferredTemperature: 0.15,
    maxTemperature: 0.4,
    systemPrompt: 'Respond directly and precisely. No explanations unless requested.',
    outputParser: (text) => {
      if (!text || typeof text !== 'string') return text;
      // Remove Qwen's tendency to explain
      return text
        .replace(/^(Let me help.*?\n|I'll help.*?\n)/i, '')
        .replace(/^(To do this.*?\n|For this.*?\n)/i, '')
        .replace(/^(The (answer|result|output) is:?\s*)/i, '')
        .trim();
    },
    retryStrategy: 'strict_constraints',
    quirks: ['explanatory', 'helpful']
  },

  // Mistral models are direct but sometimes inconsistent with formatting
  'mistral': {
    name: 'Mistral',
    preferredTemperature: 0.2,
    maxTemperature: 0.5,
    systemPrompt: 'Be direct. Follow the exact format requested.',
    outputParser: (text) => {
      if (!text || typeof text !== 'string') return text;
      return text.trim();
    },
    retryStrategy: 'format_emphasis',
    quirks: ['direct', 'format_flexible']
  },

  // Claude-style models (if using via API)
  'claude': {
    name: 'Claude',
    preferredTemperature: 0.05,
    maxTemperature: 0.2,
    systemPrompt: 'Be direct and follow the exact format requested. No preamble.',
    outputParser: (text) => {
      if (!text || typeof text !== 'string') return text;
      // Claude is usually clean, but sometimes adds "I'll" or "I can"
      return text
        .replace(/^(I'll\s+|I can\s+|I will\s+)/i, '')
        .trim();
    },
    retryStrategy: 'constraint_reminder',
    quirks: ['precise', 'formal']
  },

  // CodeLlama for code generation
  'codellama': {
    name: 'CodeLlama',
    preferredTemperature: 0.1,
    maxTemperature: 0.3,
    systemPrompt: 'Generate only the requested code format. No comments unless specified.',
    outputParser: (text) => {
      if (!text || typeof text !== 'string') return text;
      // CodeLlama sometimes adds extra context
      return text
        .replace(/^(Here's the.*?:\s*|The code is:\s*)/i, '')
        .trim();
    },
    retryStrategy: 'code_focus',
    quirks: ['code_focused', 'minimal_commentary']
  },

  // Default adapter for unknown models
  'default': {
    name: 'Default',
    preferredTemperature: 0.2,
    maxTemperature: 0.5,
    systemPrompt: 'Follow instructions precisely.',
    outputParser: (text) => {
      if (!text || typeof text !== 'string') return text;
      return text.trim();
    },
    retryStrategy: 'temperature_reduction',
    quirks: ['unknown']
  }
};

/**
 * Get adapter for a specific model, with fuzzy matching
 * @param {string} modelName - The model name (e.g., "llama3.1:8b", "qwen2.5-coder")
 * @returns {Object} Model adapter configuration
 */
export function getModelAdapter(modelName) {
  if (!modelName || typeof modelName !== 'string') {
    return ModelAdapters.default;
  }

  const normalizedName = modelName.toLowerCase();
  
  // Exact match first
  if (ModelAdapters[normalizedName]) {
    return ModelAdapters[normalizedName];
  }

  // Fuzzy matching for common patterns
  if (normalizedName.includes('llama')) {
    return ModelAdapters['llama3.1'];
  }
  if (normalizedName.includes('qwen')) {
    return ModelAdapters['qwen2.5'];
  }
  if (normalizedName.includes('mistral')) {
    return ModelAdapters['mistral'];
  }
  if (normalizedName.includes('claude')) {
    return ModelAdapters['claude'];
  }
  if (normalizedName.includes('code') || normalizedName.includes('coder')) {
    return ModelAdapters['codellama'];
  }

  return ModelAdapters.default;
}

/**
 * Apply model-specific temperature adjustment
 * @param {string} modelName - The model name
 * @param {number} requestedTemp - User-requested temperature
 * @param {string} consistencyLevel - 'low', 'normal', 'high', 'maximum'
 * @returns {number} Adjusted temperature
 */
export function adjustTemperatureForConsistency(modelName, requestedTemp = 0.2, consistencyLevel = 'normal') {
  const adapter = getModelAdapter(modelName);
  
  const consistencyMultipliers = {
    'low': 1.0,      // No adjustment
    'normal': 0.7,   // Slight reduction
    'high': 0.5,     // Significant reduction
    'maximum': 0.3   // Very low for maximum consistency
  };

  const multiplier = consistencyMultipliers[consistencyLevel] || 0.7;
  const adjustedTemp = Math.min(
    requestedTemp * multiplier,
    adapter.maxTemperature,
    adapter.preferredTemperature * 1.5 // Don't go too far above preferred
  );

  return Math.max(0.01, adjustedTemp); // Never go below 0.01
}

/**
 * Create a system prompt that combines adapter defaults with task-specific requirements
 * @param {string} modelName - The model name
 * @param {string} taskType - Type of task (e.g., 'trainerArchitect', 'scriptSage')
 * @param {Object} additionalConstraints - Additional constraints to add
 * @returns {string} Enhanced system prompt
 */
export function createEnhancedSystemPrompt(modelName, taskType, additionalConstraints = {}) {
  const adapter = getModelAdapter(modelName);
  let prompt = adapter.systemPrompt;

  // Add task-specific constraints
  if (taskType === 'trainerArchitect') {
    prompt += '\n\nFor trainer generation: Return ONLY valid JSON. No commentary before or after the JSON. Use exact species names and numeric levels.';
  } else if (taskType === 'scriptSage') {
    prompt += '\n\nFor script generation: Return ONLY the script code in proper fences. Use hex flag IDs (0x123) not flag names. No explanations.';
  }

  // Add consistency level constraints
  if (additionalConstraints.consistency === 'high') {
    prompt += '\n\nIMPORTANT: Be extremely precise. Follow the format exactly. No deviations.';
  } else if (additionalConstraints.consistency === 'maximum') {
    prompt += '\n\nCRITICAL: Output must match the format exactly. Any deviation will cause system failure.';
  }

  return prompt;
}

/**
 * Parse output using model-specific parsing rules
 * @param {string} modelName - The model name
 * @param {string} rawOutput - Raw model output
 * @param {string} taskType - Type of task
 * @returns {string} Parsed and cleaned output
 */
export function parseModelOutput(modelName, rawOutput, taskType) {
  const adapter = getModelAdapter(modelName);
  
  if (!rawOutput || typeof rawOutput !== 'string') {
    return rawOutput;
  }

  // Apply adapter-specific parsing
  let parsed = adapter.outputParser(rawOutput);

  // Apply task-specific parsing
  if (taskType === 'scriptSage') {
    // Ensure HMA scripts are properly fenced
    if (!parsed.includes('```')) {
      parsed = '```hma\n' + parsed + '\n```';
    }
  }

  return parsed;
}

export default {
  ModelAdapters,
  getModelAdapter,
  adjustTemperatureForConsistency,
  createEnhancedSystemPrompt,
  parseModelOutput
};
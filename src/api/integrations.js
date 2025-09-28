import { generateText } from '@/lib/llmService.js';
import { Flag, Trainer, Script } from './entities.js';
import { ModelAdapters } from '@/lib/consistency/ModelAdapters.js';
import { OutputValidator } from '@/lib/consistency/OutputValidators.js';
import { ConsistencyRuleFactory } from '@/lib/consistency/ConsistencyRules.js';
import { getGlobalTracker } from '@/lib/consistency/ConsistencyTracker.js';

/**
 * Consistency levels for LLM output
 */
export const CONSISTENCY_LEVELS = {
  STRICT: 'strict',      // Max validation, multiple attempts, strict repair
  BALANCED: 'balanced',  // Good validation, reasonable attempts, smart repair
  LENIENT: 'lenient',    // Basic validation, single attempt, minimal repair
  LEGACY: 'legacy'       // Original behavior, no consistency system
};

// Enhanced InvokeLLM function with consistency system integration
// Signature: InvokeLLM({ prompt, model, response_json_schema, add_context_from_internet, consistency_level, ... })
export const InvokeLLM = async (opts = {}) => {
	const { 
		prompt, 
		model, 
		response_json_schema = null, 
		add_context_from_internet = false, 
		temperature = 0.2, 
		max_tokens = 512, 
		signal, 
		add_context_from_app,
		// New consistency options
		consistency_level = CONSISTENCY_LEVELS.BALANCED,
		task_type = null,
		max_attempts = null,
		enable_validation = true,
		enable_repair = true,
		enable_model_adaptation = true,
		debug_consistency = false
	} = opts;

	// Consistency tracking
	const tracker = getGlobalTracker();
	const startTime = Date.now();
	const attemptId = `${startTime}_${Math.random().toString(36).substr(2, 9)}`;
	
	// Debug logging helper
	const debugLog = (message, data = null) => {
		if (debug_consistency) {
			console.log(`[InvokeLLM Consistency] ${message}`, data || '');
		}
	};

	// Legacy mode - use simplified original implementation
	if (consistency_level === CONSISTENCY_LEVELS.LEGACY) {
		debugLog('Using legacy mode - consistency system disabled');
		return await legacyInvokeLLM(opts);
	}

	// Determine task type for consistency rules
	let detectedTaskType = task_type;
	if (!detectedTaskType && opts.task) {
		const taskMap = {
			'trainerArchitect': 'trainer',
			'trainerArchitect.strict': 'trainer',
			'scriptSage': 'script',
			'scriptSage.hma': 'script',
			'pokemonData': 'pokemon'
		};
		detectedTaskType = taskMap[opts.task] || 'text';
	}
	detectedTaskType = detectedTaskType || 'text';

	// Set max attempts based on consistency level
	const defaultAttempts = {
		[CONSISTENCY_LEVELS.STRICT]: 4,
		[CONSISTENCY_LEVELS.BALANCED]: 2,
		[CONSISTENCY_LEVELS.LENIENT]: 1
	};
	const maxAttempts = max_attempts || defaultAttempts[consistency_level] || 2;

	debugLog(`Starting enhanced InvokeLLM`, {
		consistency_level,
		task_type: detectedTaskType,
		max_attempts: maxAttempts,
		enable_validation,
		enable_repair,
		enable_model_adaptation
	});

	// Get model adapter for consistency
	let modelAdapter = null;
	if (enable_model_adaptation) {
		try {
			modelAdapter = ModelAdapters.getModelAdapter(model);
			debugLog(`Using model adapter: ${modelAdapter.name}`);
		} catch (error) {
			debugLog(`Model adapter error: ${error.message}`);
		}
	}

	// Enhanced templates with consistency improvements
	const templates = {
		trainerArchitect: `Example 1:
Input: "Create a 3-member competitive team for a level 50 trainer."
Output (JSON): BEGIN_JSON
{"party":[{"species":"garchomp","level":50,"role":"physical sweeper","moves":["earthquake","dragonclaw","stoneedge","swordsdance"]}]}
END_JSON

Example 2:
Input: "Provide a single trainer party with species and role only."
Output (JSON): BEGIN_JSON
{"party":[{"species":"blaziken","level":50,"role":"mixed sweeper"}]}
END_JSON

CONSISTENCY RULES:
- RETURN ONLY a single JSON object that EXACTLY matches the requested schema
- Use BEGIN_JSON/END_JSON markers for clear parsing
- Use lowercase species names and numeric levels (1-100)
- Maximum 4 moves per Pokemon, maximum 6 Pokemon per party
- Valid roles: "physical sweeper", "special sweeper", "mixed sweeper", "tank", "support", "wall"
- Do NOT include commentary, lists, or markdown outside JSON markers
- Use APPLICATION_FLAG_MAP canonical IDs when referring to flags
- If validation fails, the system will request corrections
`,
		scriptSage: `Example 1:
Input: "Generate HMA script to set FLAG_GOT_HM02_FLY when player talks to the NPC"
Output:
\`\`\`hma
checkflag 0x251
setflag 0x251
\`\`\`

Example 2:
Input: "Clear BADGE_FLAG after battle"
Output:
\`\`\`hma
clearflag 0x801
\`\`\`

CONSISTENCY RULES:
- ALWAYS return a SINGLE fenced block using \`\`\`hma containing ONLY the HMA script
- Use canonical hex IDs from APPLICATION_FLAG_MAP (e.g., 0x251, not flag names)
- Valid commands: setflag, clearflag, checkflag, giveitem, givepokemon, setvar, etc.
- Always end scripts with 'end' command
- Do NOT output commentary, progress, or 'thinking' fragments
- If a flag is unknown, use quoted string ("UNKNOWN_FLAG_NAME") but do NOT invent hex IDs
- If validation fails, the system will request corrections with specific error details
`
	};

	// Build context (enhanced with consistency features)
	let enrichedPrompt = prompt || '';
	let flagMap = {};
	
	if (add_context_from_internet === 'app' || add_context_from_internet === true || add_context_from_app) {
		try {
			const flags = await Flag.list('-created_date');
			const trainers = await Trainer.list('-created_date');
			const scripts = await Script.list('-created_date');

			const flagSample = (flags || []).slice(0, 25).map(f => ({ 
				id: f.id, name: f.name, key: f.key, description: f.description 
			})).slice(0, 10);
			const trainerSample = (trainers || []).slice(0, 10).map(t => ({ 
				id: t.id, name: t.name, level_min: t.level_min, level_max: t.level_max, 
				party_count: (t.party || []).length 
			}));
			const scriptSample = (scripts || []).slice(0, 10).map(s => ({ 
				id: s.id, name: s.name 
			}));

			// Build canonical flag map
			flagMap = {};
			for (const f of (flags || [])) {
				const canonical = f.flag_id || f.key || f.id || 
					(f.name ? f.name.toLowerCase().replace(/[^a-z0-9]/g, '_') : null);
				flagMap[f.name] = canonical;
			}

			if (Object.keys(flagMap).length === 0) {
				const fallback = {
					'FLAG_GOT_HM01_CUT': '0x250',
					'FLAG_GOT_HM02_FLY': '0x251',
					'FLAG_GOT_HM03_SURF': '0x252',
					'FLAG_GOT_HM04_STRENGTH': '0x253',
					'FLAG_GOT_HM05_FLASH': '0x254',
					'FLAG_BADGE01_GET': '0x800',
					'FLAG_BADGE02_GET': '0x801'
				};
				flagMap = { ...fallback, ...flagMap };
			}

			enrichedPrompt += `\n\nAPPLICATION_CONTEXT:\n- Flags (sample): ${JSON.stringify(flagSample)}\n- Trainers (sample): ${JSON.stringify(trainerSample)}\n- Scripts (sample): ${JSON.stringify(scriptSample)}\n`;
			enrichedPrompt += `\n\nAPPLICATION_FLAG_MAP (use this to reference flags by canonical ID): ${JSON.stringify(flagMap)}\n`;
			enrichedPrompt += `\nIMPORTANT: WHEN REFERENCING FLAGS IN SCRIPTS OR OUTPUTS, ALWAYS USE THE CANONICAL FLAG ID FROM APPLICATION_FLAG_MAP. DO NOT INVENT NEW FLAG IDS. If you cannot find a flag by name, return the name in double-quotes and mark it as UNKNOWN.\n`;
		} catch (error) {
			debugLog(`Failed to collect app context: ${error.message}`);
		}
	}

	// Enhanced generation with consistency system
	let lastError = null;
	let attempts = 0;

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		attempts = attempt;
		const attemptStartTime = Date.now();
		
		// Track attempt
		tracker.recordAttempt({
			id: attemptId,
			model,
			taskType: detectedTaskType,
			consistencyLevel: consistency_level,
			attempt,
			maxAttempts,
			prompt: prompt ? prompt.substring(0, 100) + '...' : 'N/A'
		});

		debugLog(`Attempt ${attempt}/${maxAttempts}`);

		try {
			// Build final prompt with consistency enhancements
			let finalPrompt = enrichedPrompt;
			let adjustedTemperature = temperature;

			// Apply model adapter if available
			if (modelAdapter) {
				adjustedTemperature = modelAdapter.adjustTemperatureForConsistency(
					temperature, 
					consistency_level
				);
				
				if (attempt > 1) {
					// Add model-specific retry guidance
					finalPrompt = modelAdapter.createEnhancedSystemPrompt(
						finalPrompt, 
						detectedTaskType, 
						{ attempt, lastError: lastError?.message }
					);
				}
				
				debugLog(`Model adapter adjustments`, {
					originalTemp: temperature,
					adjustedTemp: adjustedTemperature,
					retryEnhancement: attempt > 1
				});
			}

			// Add task template if available
			if (opts.task && templates[opts.task]) {
				if (opts.task === 'trainerArchitect' && response_json_schema) {
					finalPrompt = `YOU MUST RETURN ONLY A SINGLE JSON OBJECT THAT MATCHES THE SCHEMA. BEGIN_JSON and END_JSON markers will surround the JSON. Do NOT output any extra text.\n\n` + 
						templates[opts.task] + '\n\n' + finalPrompt;
				} else {
					finalPrompt = templates[opts.task] + '\n\n' + finalPrompt;
				}
			}

			// Add schema instruction if needed
			if (response_json_schema) {
				finalPrompt = `You MUST OUTPUT ONLY A SINGLE JSON OBJECT OR ARRAY THAT MATCHES THE FOLLOWING JSON SCHEMA (no explanation, no code fences):\n${JSON.stringify(response_json_schema)}\n\n` + finalPrompt;
			}

			// Add consistency-level specific instructions
			if (attempt > 1 && consistency_level === CONSISTENCY_LEVELS.STRICT) {
				finalPrompt = `STRICT RETRY ATTEMPT ${attempt}: The previous output had validation errors. You MUST fix these issues and return exactly the format requested. Previous error: "${lastError?.message || 'Unknown error'}"\n\n` + finalPrompt;
			}

			// Generate text with adjusted parameters
			debugLog(`Generating text with model: ${model}, temp: ${adjustedTemperature}`);
			const rawResult = await generateText(finalPrompt, {
				model,
				temperature: adjustedTemperature,
				max_tokens,
				signal,
				retries: 0,
				timeoutMs: 30000
			});

			// Process raw result
			let processedResult = rawResult;
			if (modelAdapter && enable_model_adaptation) {
				processedResult = modelAdapter.parseModelOutput(rawResult, detectedTaskType);
				debugLog('Applied model-specific output parsing');
			}

			// Handle JSON schema responses with validation
			if (response_json_schema && enable_validation) {
				debugLog('Processing JSON schema response with validation');
				
				const validation = OutputValidator.validate(processedResult, 'json', {
					schema: response_json_schema
				});

				if (validation.valid) {
					debugLog('JSON validation passed');
					const result = validation.repaired || validation.parsed;
					
					// Apply task-specific consistency rules
					if (detectedTaskType && detectedTaskType !== 'text') {
						const consistencyValidation = ConsistencyRuleFactory.validateOutput(
							result,
							detectedTaskType,
							{
								strictMode: consistency_level === CONSISTENCY_LEVELS.STRICT,
								autoRepair: enable_repair,
								context: { flagMap, attempt, maxAttempts }
							}
						);

						if (consistencyValidation.valid) {
							debugLog('Consistency validation passed');
							const duration = Date.now() - attemptStartTime;
							tracker.recordSuccess({
								attemptId,
								model,
								taskType: detectedTaskType,
								consistencyLevel: consistency_level,
								attempt,
								duration
							});
							return consistencyValidation.repaired || result;
						} else if (consistencyValidation.repaired && enable_repair) {
							debugLog('Consistency validation failed but repair succeeded');
							const duration = Date.now() - attemptStartTime;
							tracker.recordSuccess({
								attemptId,
								model,
								taskType: detectedTaskType,
								consistencyLevel: consistency_level,
								attempt,
								duration
							});
							tracker.recordRepair({
								attemptId,
								model,
								taskType: detectedTaskType,
								repairType: 'consistency',
								successful: true
							});
							return consistencyValidation.repaired;
						} else {
							debugLog('Consistency validation failed', consistencyValidation.errors);
							lastError = new Error(`Consistency validation failed: ${consistencyValidation.errors.join(', ')}`);
							if (attempt === maxAttempts || consistency_level === CONSISTENCY_LEVELS.LENIENT) {
								// Return best available result on final attempt or lenient mode
								const duration = Date.now() - attemptStartTime;
								tracker.recordSuccess({
									attemptId,
									model,
									taskType: detectedTaskType,
									consistencyLevel: consistency_level,
									attempt,
									duration
								});
								return consistencyValidation.repaired || result;
							}
							continue; // Try next attempt
						}
					}

					const duration = Date.now() - attemptStartTime;
					tracker.recordSuccess({
						attemptId,
						model,
						taskType: detectedTaskType,
						consistencyLevel: consistency_level,
						attempt,
						duration
					});
					return result;
				} else {
					debugLog('JSON validation failed', validation.errors);
					lastError = new Error(`JSON validation failed: ${validation.errors.join(', ')}`);
					
					// Try to use repaired version if available
					if (validation.repaired && enable_repair) {
						debugLog('Using repaired JSON');
						const duration = Date.now() - attemptStartTime;
						tracker.recordSuccess({
							attemptId,
							model,
							taskType: detectedTaskType,
							consistencyLevel: consistency_level,
							attempt,
							duration
						});
						tracker.recordRepair({
							attemptId,
							model,
							taskType: detectedTaskType,
							repairType: 'json',
							successful: true
						});
						return validation.repaired;
					}
					
					if (attempt === maxAttempts || consistency_level === CONSISTENCY_LEVELS.LENIENT) {
						// Fallback to legacy parsing on final attempt
						return await legacyJsonParsing(processedResult, response_json_schema, flagMap);
					}
					continue; // Try next attempt
				}
			}

			// Handle script responses
			if (opts.task === 'scriptSage' && enable_validation) {
				debugLog('Processing script response with validation');
				
				const validation = OutputValidator.validate(processedResult, 'hma_script', {
					flagMap
				});

				if (validation.valid) {
					debugLog('Script validation passed');
					const duration = Date.now() - attemptStartTime;
					tracker.recordSuccess({
						attemptId,
						model,
						taskType: detectedTaskType,
						consistencyLevel: consistency_level,
						attempt,
						duration
					});
					return validation.repaired || validation.script;
				} else {
					debugLog('Script validation failed', validation.errors);
					lastError = new Error(`Script validation failed: ${validation.errors.join(', ')}`);
					
					if (validation.repaired && enable_repair) {
						debugLog('Using repaired script');
						const duration = Date.now() - attemptStartTime;
						tracker.recordSuccess({
							attemptId,
							model,
							taskType: detectedTaskType,
							consistencyLevel: consistency_level,
							attempt,
							duration
						});
						tracker.recordRepair({
							attemptId,
							model,
							taskType: detectedTaskType,
							repairType: 'script',
							successful: true
						});
						return validation.repaired;
					}
					
					if (attempt === maxAttempts || consistency_level === CONSISTENCY_LEVELS.LENIENT) {
						return extractScript(processedResult); // Original behavior
					}
					continue; // Try next attempt
				}
			}

			// Default: return processed result
			debugLog('Returning processed result (no specific validation)');
			const duration = Date.now() - attemptStartTime;
			tracker.recordSuccess({
				attemptId,
				model,
				taskType: detectedTaskType,
				consistencyLevel: consistency_level,
				attempt,
				duration
			});
			return processedResult;

		} catch (error) {
			debugLog(`Attempt ${attempt} failed: ${error.message}`);
			lastError = error;
			
			if (attempt === maxAttempts) {
				// Map common errors
				if (error.message && error.message.includes("model") && error.message.includes('not found')) {
					const finalError = new Error(`Ollama model not found. Please set a valid model in VITE_OLLAMA_MODEL or run a model on your Ollama instance. (${error.message})`);
					tracker.recordFailure({
						attemptId,
						model,
						taskType: detectedTaskType,
						error: finalError.message,
						validationErrors: [],
						consistencyLevel: consistency_level,
						attempt
					});
					throw finalError;
				}
				const finalError = new Error(`All ${maxAttempts} attempts failed. Last error: ${error.message}`);
				tracker.recordFailure({
					attemptId,
					model,
					taskType: detectedTaskType,
					error: finalError.message,
					validationErrors: [],
					consistencyLevel: consistency_level,
					attempt
				});
				throw finalError;
			}
			
			// Wait briefly before retry (except for signal aborts)
			if (!signal?.aborted && attempt < maxAttempts) {
				await new Promise(resolve => setTimeout(resolve, 500 * attempt));
			}
		}
	}

	// This should not be reached, but just in case
	const finalError = lastError || new Error(`Unknown error after ${attempts} attempts`);
	tracker.recordFailure({
		attemptId,
		model,
		taskType: detectedTaskType,
		error: finalError.message,
		validationErrors: [],
		consistencyLevel: consistency_level,
		attempt: attempts
	});
	throw finalError;
};

/**
 * Legacy InvokeLLM implementation for backward compatibility
 */
async function legacyInvokeLLM(opts) {
	const { prompt, model, response_json_schema = null, temperature = 0.2, max_tokens = 512, signal } = opts;
	
	try {
		const text = await generateText(prompt, { model, temperature, max_tokens, signal, retries: 0, timeoutMs: 30000 });
		
		if (response_json_schema) {
			return await legacyJsonParsing(text, response_json_schema, {});
		}
		
		if (opts.task === 'scriptSage') {
			return extractScript(text);
		}
		
		return text;
	} catch (error) {
		if (error.message && error.message.includes("model") && error.message.includes('not found')) {
			throw new Error(`Ollama model not found. Please set a valid model in VITE_OLLAMA_MODEL or run a model on your Ollama instance. (${error.message})`);
		}
		throw new Error(`Ollama error: ${error.message}`);
	}
}

/**
 * Legacy JSON parsing for fallback compatibility
 */
async function legacyJsonParsing(textBlob, schema, flagMap) {
	// Helper: strip common fenced code blocks and return inner content
	const stripCodeFences = (s) => {
		if (!s || typeof s !== 'string') return s;
		// Look for ```lang\n...``` fenced blocks; prefer json/hma blocks
		const fenceMatch = s.match(/```(?:json|hma|js|javascript)?\s*([\s\S]*?)\s*```/i);
		if (fenceMatch && fenceMatch[1]) return fenceMatch[1].trim();
		// Fallback: any triple-backtick block
		const anyFence = s.match(/```[\s\S]*?```/);
		if (anyFence) {
			return anyFence[0].replace(/```/g, '').trim();
		}
		return s;
	};

	// Try direct parse first (after stripping common code fences)
	const stripped = stripCodeFences(textBlob);
	try {
		return JSON.parse(stripped);
	} catch (_e) {
		// Helper: find first balanced JSON object/array substring by scanning braces/brackets
		const extractBalancedJson = (s) => {
			if (!s) return null;
			const start = s.search(/[\{\[]/);
			if (start === -1) return null;
			const stack = [];
			for (let i = start; i < s.length; i++) {
				const ch = s[i];
				if (ch === '{' || ch === '[') stack.push(ch);
				else if (ch === '}' || ch === ']') {
					const last = stack[stack.length - 1];
					if ((ch === '}' && last === '{') || (ch === ']' && last === '[')) {
						stack.pop();
					} else {
						return null; // mismatched
					}
					if (stack.length === 0) {
						return s.slice(start, i + 1);
					}
				}
			}
			return null;
		};

		// Try extracting balanced JSON first (handles trailing commentary)
		const balanced = extractBalancedJson(stripped);
		if (balanced) {
			try {
				return JSON.parse(balanced);
			} catch (_e2) {
				// fall through to other heuristics
			}
		}

		// If direct parse fails, attempt to find a JSON substring in the text
		const jsonMatch = stripped.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
		if (jsonMatch) {
			try {
				return JSON.parse(jsonMatch[0]);
			} catch (_e2) {
				// Try simple repair: balance braces/brackets
				const candidate = jsonMatch[0];
				let repaired = candidate;
				const openBraces = (candidate.match(/\{/g) || []).length;
				const closeBraces = (candidate.match(/\}/g) || []).length;
				const openBrackets = (candidate.match(/\[/g) || []).length;
				const closeBrackets = (candidate.match(/\]/g) || []).length;
				if (openBraces > closeBraces) repaired = repaired + '}'.repeat(openBraces - closeBraces);
				if (openBrackets > closeBrackets) repaired = repaired + ']'.repeat(openBrackets - closeBrackets);
				try {
					return JSON.parse(repaired);
				} catch (_e3) {
					const sample = candidate.slice(0, 1000);
					throw new Error(`Model returned JSON-like text but parsing failed even after repair. Sample: ${sample}`);
				}
			}
		}

		const sample = stripped.slice(0, 400);
		throw new Error(`Model did not return valid JSON. Output sample: ${sample}`);
	}
}

/**
 * Extract script from fenced blocks
 */
function extractScript(output) {
	if (!output || typeof output !== 'string') return output;
	
	const hmaMatch = output.match(/```(?:hma)?\n([\s\S]*?)\n```/i);
	if (hmaMatch && hmaMatch[1]) return hmaMatch[1].trim();
	
	return output.replace(/```/g, '').trim();
}

// Re-export other integrations for compatibility
export const Core = {};
export const SendEmail = async () => { throw new Error('SendEmail not implemented in local mode'); };
export const UploadFile = async () => { throw new Error('UploadFile not implemented in local mode'); };
export const GenerateImage = async () => { throw new Error('GenerateImage not implemented in local mode'); };
export const ExtractDataFromUploadedFile = async () => { throw new Error('ExtractDataFromUploadedFile not implemented in local mode'); };
export const CreateFileSignedUrl = async () => { throw new Error('CreateFileSignedUrl not implemented in local mode'); };
export const UploadPrivateFile = async () => { throw new Error('UploadPrivateFile not implemented in local mode'); };
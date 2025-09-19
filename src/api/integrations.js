
import ollamaClient from './ollamaClient.js';
import { Flag, Trainer, Script } from './entities.js';

// Expose a simple InvokeLLM function compatible with existing call sites.
// Signature: InvokeLLM({ prompt, model, response_json_schema, add_context_from_internet, ... })
export const InvokeLLM = async (opts = {}) => {
	const { prompt, model, response_json_schema = null, add_context_from_internet = false, temperature = 0.2, max_tokens = 512, signal, add_context_from_app } = opts;

	// Few-shot templates for app-specific tasks (strict examples to minimize garbage)
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

		Rules:
		- RETURN ONLY a single JSON object that EXACTLY matches the requested schema. Use BEGIN_JSON/END_JSON markers if included.
		- Use lowercase species names and numeric levels.
		- Do NOT include any commentary, lists, or markdown outside the JSON markers.
		- Use APPLICATION_FLAG_MAP canonical ids when referring to flags.
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

		Rules:
		- ALWAYS return a SINGLE fenced block using \`\`\`hma containing ONLY the HMA script.
		- When referencing flags, use the canonical hex ID from APPLICATION_FLAG_MAP. Example: APPLICATION_FLAG_MAP['FLAG_GOT_HM02_FLY'] -> 0x251
		- DO NOT output any commentary, progress, or 'thinking' fragments. Only the fenced HMA block is allowed.
		- If a flag is unknown, return the flag name as a quoted string ("UNKNOWN_FLAG_NAME") but do NOT invent hex ids.
		`,
	};
	// Keep behavior simple: call local Ollama and return text or parsed JSON
	// If requested, gather application internals (flags, trainers, scripts) to provide richer context
	let enrichedPrompt = prompt || '';
	if (typeof add_context_from_internet === 'object' && add_context_from_internet?.__app_context) {
		// backward-compat: user passed an options object here
	}
	// We'll expose flagMap here for later post-processing/repairs
	let flagMap = {};
	if (add_context_from_internet === 'app' || add_context_from_internet === true || add_context_from_app) {
		try {
			const flags = await Flag.list('-created_date');
			const trainers = await Trainer.list('-created_date');
			const scripts = await Script.list('-created_date');

			// Provide a small human-friendly sample plus a machine-usable mapping of flag name -> canonical hex ID
			const flagSample = (flags || []).slice(0, 25).map(f => ({ id: f.id, name: f.name, key: f.key, description: f.description })).slice(0,10);
			const trainerSample = (trainers || []).slice(0, 10).map(t => ({ id: t.id, name: t.name, level_min: t.level_min, level_max: t.level_max, party_count: (t.party||[]).length }));
			const scriptSample = (scripts || []).slice(0, 10).map(s => ({ id: s.id, name: s.name }));

			// Build a canonical flag map that the model can reference to use the exact IDs required by the app
			flagMap = {};
			for (const f of (flags || [])) {
				// Prefer an explicit flag_id or key if present (these represent canonical hex IDs), fall back to stored id
				const canonical = f.flag_id || f.key || f.id || (f.name ? f.name.toLowerCase().replace(/[^a-z0-9]/g, '_') : null);
				flagMap[f.name] = canonical;
			}

			// If no flags exist in storage (fresh project), provide a small fallback map of commonly-used flags
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
		} catch (e) {
			console.warn('Failed to collect app context for LLM:', e.message);
		}
	}

	let result;
	try {
		// If a response schema is specified, instruct the model to return only matching JSON
		let finalPrompt = enrichedPrompt;
		// If a task hint is present, prepend the few-shot template to guide the model
		if (opts.task && templates[opts.task]) {
			// For tasks with templates, prepend the template guidance. For schema-driven tasks,
			// add an extra instruction to output only valid JSON with explicit markers.
			if (opts.task === 'trainerArchitect' && response_json_schema) {
				finalPrompt = `YOU MUST RETURN ONLY A SINGLE JSON OBJECT THAT MATCHES THE SCHEMA. BEGIN_JSON and END_JSON markers will surround the JSON. Do NOT output any extra text.` + '\n\n' + templates[opts.task] + '\n\n' + finalPrompt;
			} else {
				finalPrompt = templates[opts.task] + '\n\n' + finalPrompt;
			}
		}
		if (response_json_schema) {
			finalPrompt = `You MUST OUTPUT ONLY A SINGLE JSON OBJECT OR ARRAY THAT MATCHES THE FOLLOWING JSON SCHEMA (no explanation, no code fences):\n${JSON.stringify(response_json_schema)}\n\n` + finalPrompt;
		}
		result = await ollamaClient.callOllama({ prompt: finalPrompt, model, temperature, max_tokens, signal });
	} catch (err) {
		// Map common Ollama errors into friendlier messages
		if (err.message && err.message.includes("model") && err.message.includes('not found')) {
			throw new Error(`Ollama model not found. Please set a valid model in VITE_OLLAMA_MODEL or run a model on your Ollama instance. (${err.message})`);
		}
		throw new Error(`Ollama error: ${err.message}`);
	}

	// If user requested a JSON schema response, try to parse model output as JSON
	if (response_json_schema) {
		// Normalize result into a text blob we can scan for JSON
		let textBlob = '';
		if (typeof result === 'string') textBlob = result;
		else if (result && typeof result === 'object') {
			if (result.content && typeof result.content === 'string') textBlob = result.content;
			else if (result.generated_text && typeof result.generated_text === 'string') textBlob = result.generated_text;
			else textBlob = JSON.stringify(result);
		}

		// Helper: strip common fenced code blocks and return inner content
		const stripCodeFences = (s) => {
			if (!s || typeof s !== 'string') return s;
			// Look for ```lang\n...``` fenced blocks; prefer json/hma blocks
			const fenceMatch = s.match(/```(?:json|hma|js|javascript)?\n([\s\S]*?)\n```/i);
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
		} catch (e) {
			// Helper: convert common JS-object literal styles to valid JSON string
			const jsObjectToJson = (s) => {
				if (!s || typeof s !== 'string') return s;
				let out = s;
				// Replace unquoted keys: { species: 'pikachu' } -> { "species": 'pikachu' }
				out = out.replace(/([\{,\s])(\w+)\s*:/g, '$1"$2":');
				// Convert single-quoted strings to double-quoted
				out = out.replace(/'([^']*)'/g, '"$1"');
				// Remove trailing commas before closing braces/brackets
				out = out.replace(/,\s*([\]}])/g, '$1');
				return out;
			};
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
				} catch (e2) {
					// fall through to other heuristics
				}
			}
			// Attempt a lightweight JS object -> JSON repair (handles single quotes, unquoted keys)
			try {
				const repaired = jsObjectToJson(stripped);
				if (repaired && repaired !== stripped) {
					try { return JSON.parse(repaired); } catch (_) { /* fall through */ }
				}
			} catch (_) {}
			// If direct parse fails, attempt to find a JSON substring in the text (handles wrapped text or extra commentary)
				const jsonMatch = stripped.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
			if (jsonMatch) {
				try {
					return JSON.parse(jsonMatch[0]);
				} catch (e2) {
					// Try a simple repair: if braces/brackets are unbalanced, append closing chars
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
					} catch (e3) {
						// Attempt a targeted repair: if the JSON contains quoted flag names that match entries in flagMap, replace them with canonical IDs
						if (Object.keys(flagMap || {}).length > 0) {
							let replaced = repaired;
							for (const [name, id] of Object.entries(flagMap)) {
								// replace occurrences of the flag name in quotes with the canonical id (keep quotes if id is not numeric)
								const nameEsc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
								replaced = replaced.replace(new RegExp(`"${nameEsc}"`, 'g'), `"${id}"`);
							}
							try {
								return JSON.parse(replaced);
							} catch (e4) {
								const sample = replaced.slice(0, 1000);
								throw new Error(`Model returned JSON-like text; attempted flag-name -> ID repairs but parsing still failed. Sample: ${sample}`);
							}
						}
						const sample = candidate.slice(0, 1000);
						throw new Error(`Model returned JSON-like text but parsing failed even after repair. Sample: ${sample}`);
					}
				}
			}

			// Try NDJSON (newline-delimited JSON) — parse each line and return array/object accordingly
			const lines = stripped.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
			const parsedLines = [];
			for (const l of lines) {
				try {
					parsedLines.push(JSON.parse(l));
				} catch (_) {
					// not a JSON line — skip
				}
			}
			if (parsedLines.length === 1) return parsedLines[0];
			if (parsedLines.length > 1) return parsedLines;

			// Quick repair: if the text contains '...' ellipses inside arrays/objects (model shorthand), remove them
			const removeEllipses = (s) => s.replace(/\.\.\./g, '');
			const cleanedBlob = removeEllipses(textBlob);
			if (cleanedBlob !== textBlob) {
				const m = cleanedBlob.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
				if (m) {
					try { return JSON.parse(m[0]); } catch (_) {}
				}
			}

			// As a last resort, attempt one stricter retry with lower temperature to coax valid JSON
			const retryPrompt = `The previous output did not parse as valid JSON. You MUST return ONLY valid JSON that matches the schema. Please output the JSON now with no extra commentary.\n\nPrevious output:\n${textBlob.slice(0,2000)}`;
			try {
				const retryResult = await ollamaClient.callOllama({ prompt: retryPrompt, model, temperature: 0.05, max_tokens: 512, signal });
				let retryBlob = '';
				if (typeof retryResult === 'string') retryBlob = retryResult;
				else if (retryResult && typeof retryResult === 'object') retryBlob = retryResult.content || retryResult.generated_text || JSON.stringify(retryResult);
				const retryBalanced = (() => {
					const s = retryBlob;
					const start = s.search(/[\{\[]/);
					if (start === -1) return null;
					const stack = [];
					for (let i = start; i < s.length; i++) {
						const ch = s[i];
						if (ch === '{' || ch === '[') stack.push(ch);
						else if (ch === '}' || ch === ']') {
							const last = stack[stack.length - 1];
							if ((ch === '}' && last === '{') || (ch === ']' && last === '[')) stack.pop();
							if (stack.length === 0) return s.slice(start, i + 1);
						}
					}
					return null;
				})();
				if (retryBalanced) {
					try { return JSON.parse(retryBalanced); } catch (_) {}
				}
				const retryMatch = retryBlob.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
				if (retryMatch) {
					try { return JSON.parse(retryMatch[0]); } catch (_) {}
				}
				// Try NDJSON lines
				const rlines = retryBlob.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
				for (const l of rlines) {
					try { return JSON.parse(l); } catch (_) {}
				}
				const sample = retryBlob.slice(0, 400);
				throw new Error(`Model did not return JSON after retry. Last sample: ${sample}`);
			} catch (retryErr) {
				const sample = textBlob.slice(0, 400);
				throw new Error(`Model did not return JSON as requested. Output sample: ${sample}. Retry attempt error: ${retryErr.message}`);
			}
		}
	}

	// Default: return text content if available
	if (result && typeof result === 'object') {
		// If this was a scriptSage task, strip fenced HMA blocks and return inner content only
		if (opts.task === 'scriptSage') {
			const raw = result.content || result.generated_text || JSON.stringify(result);
			const strip = (s) => {
				if (!s || typeof s !== 'string') return s;
				const m = s.match(/```(?:hma)?\n([\s\S]*?)\n```/i);
				if (m && m[1]) return m[1].trim();
				// fallback: remove any triple-backtick wrappers
				return s.replace(/```/g, '').trim();
			};
			return strip(raw);
		}
		if (result.content) return result.content;
		if (result.generated_text) return result.generated_text;
		return JSON.stringify(result);
	}

	return String(result);
};

// The rest of the Base44 integrations are not available when using Ollama locally.
// Provide safe fallbacks for other exports used by the app so imports don't break.
export const Core = {};
export const SendEmail = async () => { throw new Error('SendEmail not implemented in local mode'); };
export const UploadFile = async () => { throw new Error('UploadFile not implemented in local mode'); };
export const GenerateImage = async () => { throw new Error('GenerateImage not implemented in local mode'); };
export const ExtractDataFromUploadedFile = async () => { throw new Error('ExtractDataFromUploadedFile not implemented in local mode'); };
export const CreateFileSignedUrl = async () => { throw new Error('CreateFileSignedUrl not implemented in local mode'); };
export const UploadPrivateFile = async () => { throw new Error('UploadPrivateFile not implemented in local mode'); };







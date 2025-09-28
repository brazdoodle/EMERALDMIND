// Utilities to sanitize LLM outputs for script generation
export function extractScriptFromModelOutput(text) {
  if (!text) return '';
  // Prefer fenced code blocks
  const fenceMatch = text.match(/```(?:[^\n]*\n)?([\s\S]*?)```/);
  if (fenceMatch && fenceMatch[1] && fenceMatch[1].trim()) {
    return fenceMatch[1].trim();
  }

  // Remove obvious JSON/stream noise lines and metadata while preserving
  // paragraph breaks inside dialog brace blocks `{ ... }`.
  const lines = text.split(/\r?\n/);
  const cleaned = [];
  let collecting = false;
  let inBrace = false;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const ln = raw.trim();

  // detect entering/leaving brace blocks so we preserve inner spacing
  if (ln === '{' || ln.startsWith('{ ')) inBrace = true;
  if (ln === '}' || ln.endsWith(' }') || ln.endsWith('}')) inBrace = false;

  // aggressively skip JSON-like streaming fragments or assistant-internal tokens
  // but DO NOT treat standalone brace lines as JSON (they are dialog markers)
  const isJsonLike = (/^\{.*\}$/.test(ln) && ln.includes(':')) || (ln.startsWith('"') && ln.includes(':')) || /"thinking"|"model"|"created_at"|"response"|"done"|\[DONE\]/i.test(ln) || /\bthinking\b\s*:/.test(ln);
  if (isJsonLike) continue;

    // If not in a brace block, skip empty lines before we start collecting
    if (!inBrace && !ln && !collecting) continue;

    // detect start of a script block by common HMA tokens
    if (/^(#dynamic\b|#org\b)/i.test(ln) || /^(faceplayer|msgbox|release|end|goto|call|setflag|clearflag|if\.|msgbox\s+|section\d*:\s*#?)/i.test(ln)) {
      collecting = true;
    }

    // push only once we've started collecting the script block; inside braces preserve raw line (including blanks)
    if (collecting) cleaned.push(raw);
  }

  let result = cleaned.join('\n').trim();

  // If nothing collected, try to find contiguous block between header and end
  if (!result) {
    const blockMatch = text.match(/(#dynamic[\s\S]*?\bend\b)|(#org[\s\S]*?\bend\b)/i);
    if (blockMatch) result = (blockMatch[0] || '').trim();
  }

  // Final fallback: pick the longest contiguous block of lines with some length
  if (!result) {
    const blocks = text.split(/\r?\n\s*\r?\n/).map(b => b.trim()).filter(b => b.length > 0);
    if (blocks.length) {
      blocks.sort((a, b) => b.length - a.length);
      result = blocks[0];
    }
  }

  return result;
}

export function ensureHmaSyntax(scriptText) {
  if (!scriptText) return '';
  let s = scriptText.trim();
  // Ensure header
  if (!/^#dynamic\b/i.test(s) && !/^#org\b/i.test(s)) {
    // Do not force a specific auto-allocation header. Prefer leaving header choice
    // to the user or templates. If no header present, leave unchanged.
    // s = '#dynamic 0x800000\n\n' + s;
  }
  // Ensure trailing end
  if (!/\bend\b/i.test(s.split(/\r?\n/).slice(-1)[0])) {
    if (!/\bend\b/i.test(s)) {
      s = s + '\nend';
    }
  }
  return s;
}

export function ensureSectionHeader(scriptText, sectionNumber) {
  // If no sectionNumber provided, leave unchanged
  if (!sectionNumber) return scriptText;

  // Allow placeholder hex (000000) or empty hex; we will emit `sectionN: # 000000` to be patched later
  const header = `section${sectionNumber}: # 000000`;

  // replace existing section header patterns like `section:` or `sectionN:`
  if (/^section\d*:\s*#/mi.test(scriptText)) {
    return scriptText.replace(/^section\d*:\s*#\s*[0-9A-Fa-fxX]*/mi, header);
  }
  return header + '\n\n' + scriptText;
}

// Known HMA command tokens (simple whitelist for detection)
const KNOWN_COMMANDS = [
  'faceplayer',
  // battle / flow
  'single.battle.continue.silent','double.battle.rematch','special2','fanfare','waitfanfare','lockall','pause',
  // messaging
  'preparemsg','waitmsg','msgbox','msgbox.default','msgbox.autoclose',
  // control
  'call','goto','return','release','end','warp8','warp','waitstate','waitsound','waitcry',
  // flags/vars
  'setflag','clearflag','setvar','addvar','copyvar','if.compare.call','if.compare.goto','if.yes.goto','if.no.goto','if.flag.clear.goto','if.',
  // items/npc
  'npc.item','defeatedtrainer','npc.giveitem','npc.talk',
  // utilities
  'setvar','addvar',
  // camera/movement/sprites
  'special','move.camera','move.npc','move.player','applymovement','hidesprite','showsprite','spawncameraobject','removecameraobject','spawncameraobject','spawn_camera_object','setmaptile','setweather','doweather','waitweather','sound','cry','fadescreendelay','fadesong'
];

export function sanitizeGeneratedScript(text, sectionNumber) {
  const extracted = extractScriptFromModelOutput(text);
  // Do not inject the `#dynamic 0x800000` allocation header automatically.
  // Keep any existing header and only ensure trailing `end` if missing.
  let enforced = extracted || '';
  if (!/\bend\b/i.test(enforced.split(/\r?\n/).slice(-1)[0])) {
    if (!/\bend\b/i.test(enforced)) {
      enforced = enforced + '\nend';
    }
  }
  const withSection = ensureSectionHeader(enforced, sectionNumber);

  // Find unknown command-like tokens: simple heuristic - lines starting with a token followed by space
  const unknownCommands = [];
  const lines = withSection.split(/\r?\n/);
  let inBrace = false;
  for (const raw of lines) {
    const ln = raw.trim();
    if (!ln) continue;
    if (ln === '{' || ln.startsWith('{')) { inBrace = true; continue; }
    if (ln === '}' || ln.endsWith('}')) { inBrace = false; continue; }
    if (inBrace) continue; // skip dialog blocks

    // skip section headers
    if (/^section\d*:/i.test(ln)) continue;

    // only consider tokens that start with a lowercase letter (command-like)
    const m = ln.match(/^([a-z][a-z0-9_.]*)\b/);
    if (m) {
      const cmd = m[1];
      const known = KNOWN_COMMANDS.includes(cmd);
      if (!known && !unknownCommands.includes(cmd) && cmd.length > 1) unknownCommands.push(cmd);
    }
  }

  return { text: withSection, unknownCommands };
}

export function buildScriptGenPrompt(preset, templates = [], commandDocs = []) {
  // Build a clear expert prompt that instructs the model to return only a HMA script
  const briefTemplates = templates.slice(0, 6).map(t => `- ${t.title || t.name || 'template'}: ${t.description || ''}`).join('\n');
  const briefCommands = commandDocs.slice(0, 12).map(c => `- ${c.command || c.name || c.id}: ${c.description || ''}`).join('\n');

  // Short, strict checklist to bias the model toward valid outputs.
  const checklist = [
    'Checklist (must follow):',
    '- Output ONLY a single triple-backtick fenced block containing the HMA script, no prose.',
    "- Start with an existing header if provided (either '#dynamic' or '#org'); do NOT invent '#dynamic 0x800000'.",
    "- End the script with a single 'end' on its own line.",
    "- Use section headers in the form 'sectionN: # 000000' for blocks when requested.",
    "- Do not include JSON, assistant tokens, or explanatory footer text."
  ].join('\n');

  return [
    'You are an expert in HexManiac Advance (HMA/XSE) scripting for Gen 3 Pokemon ROM hacks.',
    checklist,
    'Style/Tone Hints:',
    '- Keep NPC dialog concise and friendly; avoid copying any specific game text.',
    "- Use placeholders like @greeting, @player_name, @yes_text, @no_text, @after_battle to mark content to be filled later.",
    '- Prefer lowercase command tokens and clear flow structure.',
    `Context/Template hints:\n${briefTemplates}`,
    `Command hints (examples):\n${briefCommands}`,
    `Task: Generate a script that fulfills this preset: ${preset}`,
    "If you cannot generate a valid script, output an empty fenced code block (```\n\n```)."
  ].join('\n\n');
}

// Helper to ask the assistant for a one-line description for an unknown command.
// This uses the project's quickQuery helper if available at runtime. It expects a
// `quickQuery` function to be injected when calling in the UI layer.
export async function describeUnknownCommand(command, quickQuery) {
  if (!command) return '';
  const q = quickQuery;
  if (typeof q !== 'function') {
    // Best-effort fallback: return a short placeholder
    return `No AI available to describe '${command}'.`;
  }

  const prompt = `Please describe in one concise sentence (max 25 words) the following HMA/XSE script command for documentation: ${command}. If unknown, respond 'unknown command'.`;
  try {
    const resp = await q(prompt, { maxTokens: 80 }).catch(_e => null);
    if (!resp) return '';
    // resp may be a string or object depending on wrapper - prefer text
    const txt = typeof resp === 'string' ? resp : (resp.text || resp.output || '');
    return (txt || '').toString().trim().replace(/^["'`]+|["'`]+$/g, '').slice(0, 240);
  } catch (_err) {
    return '';
  }
}

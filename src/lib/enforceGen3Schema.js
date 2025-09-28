// Shared Gen 3 schema enforcement utility
// Usage: const clean = enforceGen3Schema(response)

export function enforceGen3Schema(response) {
  // Accepts string or object
  let obj;
  if (typeof response === 'string') {
    try {
      obj = JSON.parse(response);
    } catch (_e) {
      // Try to extract JSON from code block
      const match = response.match(/```json\s*([\s\S]*?)```/);
      if (match) {
        try { obj = JSON.parse(match[1]); } catch (_e2) { obj = null; }
      }
    }
  } else if (typeof response === 'object' && response !== null) {
    obj = response;
  }
  // Validate basic Gen 3 dialogue schema
  if (obj && obj.dialogue && Array.isArray(obj.dialogue)) {
    // Optionally wrap in section0 if not present
    if (!obj.section0) {
      obj = { section0: obj };
    }
    return obj;
  }
  // If not valid, return original response
  return response;
}

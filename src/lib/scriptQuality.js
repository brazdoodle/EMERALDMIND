export function isTrivialScript(script) {
  if (!script || typeof script !== 'string') return true;
  const lines = script.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return true;
  const withoutHeaders = lines.filter(l => !/^section\d*:/i.test(l));
  const unique = new Set(withoutHeaders);
  const onlyMinimal = unique.size <= 3 && unique.has('return') && unique.has('end');
  const tooShort = withoutHeaders.length < 5;
  return onlyMinimal || tooShort;
}

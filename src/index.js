import { createHash } from 'node:crypto';
const numberPattern = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y;
const fingerprint = token => createHash('sha256').update(token).digest('hex').slice(0, 12);
function location(text, offset) { const before = text.slice(0, offset), lines = before.split('\n'); return { line: lines.length, column: lines.at(-1).length + 1 }; }
export function classifyNumber(token) {
  const numeric = Number(token), digits = (token.match(/\d/g) || []).length, significantDigits = token.replace(/^-/, '').replace(/[eE].*$/, '').replace('.', '').replace(/^0+/, '').length || 1;
  if (!Number.isFinite(numeric)) return { type: 'out-of-range', digits, significantDigits };
  if (/^-?\d+$/.test(token) && (BigInt(token) > BigInt(Number.MAX_SAFE_INTEGER) || BigInt(token) < BigInt(Number.MIN_SAFE_INTEGER))) return { type: 'unsafe-integer', digits, significantDigits };
  if (numeric === 0 && !/^-?0(?:\.0+)?(?:[eE][+-]?\d+)?$/.test(token)) return { type: 'underflow', digits, significantDigits };
  if (Object.is(numeric, -0)) return { type: 'negative-zero', digits, significantDigits };
  if (significantDigits > 15) return { type: 'precision-risk', digits, significantDigits };
  return null;
}
export function analyze(text) {
  if (typeof text !== 'string' || !text.trim()) throw new Error('JSON input is empty');
  const findings = []; let inString = false, escaped = false, numberCount = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inString) { if (escaped) escaped = false; else if (char === '\\') escaped = true; else if (char === '"') inString = false; continue; }
    if (char === '"') { inString = true; continue; }
    if (char === '-' || /\d/.test(char)) {
      numberPattern.lastIndex = i; const match = numberPattern.exec(text);
      if (!match) continue;
      const token = match[0], classification = classifyNumber(token); numberCount++;
      if (classification) findings.push({ ...location(text, i), ...classification, fingerprint: fingerprint(token) });
      i += token.length - 1;
    }
  }
  const counts = Object.fromEntries([...new Set(findings.map(x => x.type))].sort().map(type => [type, findings.filter(x => x.type === type).length]));
  return { numberCount, findingCount: findings.length, counts, findings };
}

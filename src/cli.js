#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { analyze } from './index.js';
const args = process.argv.slice(2), file = args.find(x => !x.startsWith('--')) || '-';
if (args.includes('--help')) { console.log('Usage: json-number-safety-audit [FILE|-] [--jsonl] [--json] [--fail]'); process.exit(0); }
try {
  const text = file === '-' ? await new Promise((resolve, reject) => { let value = ''; process.stdin.setEncoding('utf8'); process.stdin.on('data', x => value += x); process.stdin.on('end', () => resolve(value)); process.stdin.on('error', reject); }) : await readFile(file, 'utf8');
  if (args.includes('--jsonl')) { let n = 0; for (const line of text.split(/\r?\n/)) { n++; if (!line.trim()) continue; try { JSON.parse(line); } catch (error) { throw new Error(`line ${n}: ${error.message}`); } } } else { try { JSON.parse(text); } catch (error) { throw new Error(`invalid JSON (use --jsonl for JSON Lines): ${error.message}`); } }
  const report = analyze(text);
  if (args.includes('--json')) console.log(JSON.stringify(report, null, 2));
  else { console.log(`${report.numberCount} numbers, ${report.findingCount} findings`); for (const f of report.findings) console.log(`${f.type}\tline:${f.line}\tcolumn:${f.column}\tdigits:${f.digits}\tfingerprint:${f.fingerprint}`); }
  if (args.includes('--fail') && report.findingCount) process.exitCode = 1;
} catch (error) { console.error(`json-number-safety-audit: ${error.message}`); process.exitCode = 2; }

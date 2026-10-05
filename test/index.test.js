import test from 'node:test';
import assert from 'node:assert/strict';
import { analyze, classifyNumber } from '../src/index.js';
test('finds unsafe integers', () => assert.equal(classifyNumber('9007199254740993').type, 'unsafe-integer'));
test('finds overflow and underflow', () => { assert.equal(classifyNumber('1e400').type, 'out-of-range'); assert.equal(classifyNumber('1e-400').type, 'underflow'); });
test('ignores number-like strings', () => { const r = analyze('{"id":"9007199254740993","safe":42}'); assert.equal(r.numberCount, 1); assert.equal(r.findingCount, 0); });
test('does not expose raw risky numbers', () => { const raw = '{"id":9007199254740993}'; assert.equal(JSON.stringify(analyze(raw)).includes('9007199254740993'), false); });

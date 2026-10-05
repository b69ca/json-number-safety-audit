# json-number-safety-audit

Scan raw JSON number tokens before `JSON.parse()` can silently round them.

It detects integers outside JavaScript's safe range, excessive significant digits, numeric overflow and underflow, and negative zero. Reports contain locations, digit counts, and short SHA-256 fingerprints—not the original values.

## Run

```bash
npx --yes github:b69ca/json-number-safety-audit payload.json
cat events.jsonl | npx --yes github:b69ca/json-number-safety-audit - --jsonl --fail
```

## Options

```text
--jsonl  validate input as one JSON value per non-empty line
--json   emit machine-readable JSON
--fail   exit 1 when risky numbers are found
```

This is a transport audit, not a replacement JSON parser. A typical fix is to encode identifiers and high-precision decimal values as strings, then use an appropriate downstream numeric type.

All processing is local. Node.js 20 or newer; no runtime dependencies.

## License

MIT

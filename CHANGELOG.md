# Changelog

## v0.1.0-alpha — Initial Release

### Added
- Core symbolic execution engine (parser, tokenizer, AST builder)
- Runtime executor with context, registry, and flow evaluation
- Built-in glyph packs:
  - Math (add, subtract, multiply, divide)
  - Logic (and, or, not, equals)
  - Flow (pipe, sequence, branch)
  - IO (print, debug)
- Glyph registry with dynamic extension API
- ES module entrypoints for:
  - `agl-es`
  - `agl-es/glyphs`
  - `agl-es/runtime`
  - `agl-es/cli`
- CLI tool:
  - `agl run <file>`
  - `agl compile <file>`
  - `agl inspect <file>`
- Example programs and starter glyph flows
- Branding assets (logo, glyph grid)
- Build pipeline (TypeScript + asset bundling)
- Documentation and README header

### Notes
This alpha focuses on the **runtime**, **glyph system**, and **CLI**.
The visual editor and advanced glyph packs will land in the beta series.

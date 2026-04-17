# AGENTS

## HORUSForge Coding Notes

- Keep domain metadata centralized in `src/domain/category-definitions.js` so UI, defaults, and validation stay in sync.
- Treat export as validation-gated: hard errors block `.lcp` output.
- Prefer beginner-first forms with sensible defaults, but always provide an advanced raw JSON escape hatch.
- Keep import/export pure service modules (`src/services/*`) separate from Alpine UI state.
- Autosave should debounce writes to localStorage and never interrupt editing.
- Preserve COMP/CON compatibility assumptions explicitly in validation warnings.
- Do not use `structuredClone` directly on Alpine state/proxies; serialize with `JSON.parse(JSON.stringify(...))` for autosave-safe snapshots.

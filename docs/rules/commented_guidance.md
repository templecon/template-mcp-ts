# Commented Guidance

These notes were moved out of code comments so the source stays focused on behavior.

## Runtime CORS Middleware

- Echo the request origin when present instead of using a wildcard.
- Keep `OPTIONS` handling minimal and return `204` for preflight requests.
- Mirror requested headers back into `Access-Control-Allow-Headers` and `Access-Control-Expose-Headers` when present.

## Test Setup Files

- Keep `tests/setup.ts` lightweight.
- Avoid adding heavy shared fixtures or expensive initialization to global test setup.

## MCP Inspector Script

- Keep the inspector entrypoint focused on launching the MCP Inspector CLI.
- Preserve the well-known endpoint aliases so local and remote targets stay easy to invoke.
- Keep the default tool name and argument parsing simple.

## Linter Rule Baselines

- Treat `scripts/linter/oxlint-eslint-error.ts` as the strict baseline for real failures.
- Treat `scripts/linter/oxlint-eslint-warn.ts` as the warning baseline for patterns that are allowed temporarily but still discouraged.
- Keep comments about rule intent in this document instead of the generated rule lists.

## Benchmark Script

- Keep the lint benchmark script as a local measurement tool, not a CI dependency.
- Measure the `pnpm lint` command consistently.
- Preserve the statistical stopping condition and the warm-up phase.

## MCP Route Setup

- Keep `structuredContent` typed with `satisfies` when the client expects exact output shape.
- Keep setup cleanup and lifecycle notes out of the hot path unless they affect behavior.

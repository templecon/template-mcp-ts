# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.
All agents, such as Claude Code, should keep `**/AGENTS.md` in mind.

## Project Type

This is an **MCP Server template** for building Model Context Protocol servers with TypeScript. It provides:

- MCP SDK integration for tools and prompts
- Hono web framework for HTTP transport
- Zod validation for MCP tool schemas
- Vitest with Cloudflare worker pool for testing

## Development Commands

```bash
# Start development server (wrangler)
pnpm dev

# Build for production (Cloudflare Workers)
pnpm build

# Format code
pnpm format

# Lint code
pnpm lint

# Run tests
pnpm test
```

## Coding Standards

See `docs/rules/` for TypeScript, testing, and tooling guidelines.

## TypeScript Configuration

- Path alias: `@/*` maps to `src/*` (configured in `tsconfig.base.json`)

## Package Manager

This project uses pnpm.

## Cloudflare Workers

This template uses `wrangler` for Cloudflare Workers development and deployment.
Configuration is in `wrangler.jsonc`.

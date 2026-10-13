import { createMcpHandler } from "@modelcontextprotocol/server";
import { Hono } from "hono";

import { setup } from "@/route";
import type { HonoEnv } from "@/types";
import { cors } from "@/utils/cors";
/**
 * @fileoverview
 * This is the main entry point of the Hono application. It sets up the routing and middleware for the application.
 * Don't make this file too large. If you need to add more routes, create separate route files and import them here.
 */

const app = new Hono<HonoEnv>()
    .use("*", cors)
    // The handler is created per request so that `setup` can read `c.env`, which means
    // `handler.notify.*` (list_changed / resource updates) reaches nobody.
    // To use those notifications:
    //   1. Keep one handler alive per env, e.g. a `WeakMap<Env, McpHttpHandler>`.
    //   2. Drop the `listChanged: false` override in src/route.ts.
    //   3. Pass a shared `bus` (a `ServerEventBus` backed by e.g. a Durable Object) to
    //      `createMcpHandler`; the default bus only reaches streams in the same isolate.
    // Only 2026-07-28 clients can receive them; 2025-era clients have no stream to listen on.
    .all("/mcp", (c) => createMcpHandler(() => setup(c.env)).fetch(c.req.raw))
    .get("/", (c) => {
        return c.text("Hello, World! This is MCP server.");
    });
export default app;

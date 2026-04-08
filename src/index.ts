import { StreamableHTTPTransport } from "@hono/mcp";
import { Hono } from "hono";
import { createMcp } from "./mcp";
import type { Bindings } from "./types";

const app = new Hono<{ Bindings: Bindings }>();

app.all("/mcp", async (c) => {
    const mcp = createMcp(c.env);
    const transport = new StreamableHTTPTransport({
        sessionIdGenerator: undefined,
    });
    // transport.handleRequest is a handler, but here we use it to delegate
    await mcp.connect(transport);
    return transport.handleRequest(c);
});

app.get("/", (c) => c.text("Korea Drug Info MCP Server"));

export default app;

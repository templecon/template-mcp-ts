<<<<<<< HEAD
import { app as mcpServer } from "@/route";
import { StreamableHTTPTransport } from "@hono/mcp";
import { Hono } from "hono";

/**
 * @fileoverview
 * This is the main entry point of the Hono application. It sets up the routing and middleware for the application.
 * Don't make this file too large. If you need to add more routes, create separate route files and import them here.
 */

const transport = new StreamableHTTPTransport();
const app = new Hono()
    .use("*", async (c, next) => {
        // CORS allow all
        const requestedOrigin = c.req.header("Origin");
        if (requestedOrigin) {
            c.header("Access-Control-Allow-Origin", requestedOrigin);
        }
        c.header(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE, PATCH"
        );
        const requestedHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestedHeaders) {
            c.header("Access-Control-Allow-Headers", requestedHeaders);
            c.header("Access-Control-Expose-Headers", requestedHeaders);
        }
        if (c.req.method === "OPTIONS") {
            c.status(204);
            return c.newResponse(null);
        }
        return next();
    })
    .all("/mcp", async (c) => {
        if (!mcpServer.isConnected()) {
            // Connect the mcp with the transport
            await mcpServer.connect(transport);
        }
        return transport.handleRequest(c);
    })
    .get("/", (c) => {
        return c.text("Hello, World! This is MCP server.");
    });
=======
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

>>>>>>> jules-16751639785480462367-ebf5a0fa
export default app;

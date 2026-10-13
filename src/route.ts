import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod";

import nplus1 from "./prompt/nplus1.md?raw";
import type { Env } from "./types";

/**
 * Builds a fresh MCP server. `createMcpHandler` calls this once per request,
 * so don't keep per-connection state on the returned instance.
 */
export function setup(env: Env) {
    const app = new McpServer(
        {
            name: "Example MCP Server",
            version: "1.0.0",
        },
        {
            // Registering a tool or prompt advertises `listChanged: true` by default,
            // which makes clients open a subscription stream. The per-request handler
            // in src/index.ts can never publish to it, so don't advertise it.
            capabilities: {
                prompts: { listChanged: false },
                tools: { listChanged: false },
            },
        }
    );

    const inputSchema = z.object({
        name: z.string().default("Claude-chan"),
    });
    const outputSchema = z.object({
        greeting: z.string(),
    });

    app.registerTool(
        "greet",
        {
            inputSchema,
            outputSchema,
            annotations: {
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: false,
                readOnlyHint: true,
                title: "Greet someone",
            },
            description: "A simple tool that greets someone by name.",
            title: "Greet",
        },
        async (i) => {
            i satisfies z.output<typeof inputSchema>;
            if (env.MAGIC_SECRET_KEY) {
                console.log(
                    `🔐 MAGIC_SECRET_KEY is set. Received name: ${i.name}`
                );
            }
            return {
                content: [],
                isError: false,
                structuredContent: {
                    greeting: `Hello, ${i.name}!`,
                } satisfies z.output<typeof outputSchema>,
            };
        }
    );

    app.registerTool(
        "ungreet",
        {
            inputSchema,
            annotations: {
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: false,
                readOnlyHint: true,
                title: "Ungreet someone",
            },
            description: "A simple tool that ungreets someone by name.",
            title: "Ungreet",
        },
        async (i) => {
            i satisfies z.output<typeof inputSchema>;
            return {
                content: [
                    {
                        type: "text",
                        text: `Goodbye, ${i.name}!`,
                    },
                ],
                isError: false,
            };
        }
    );

    app.registerPrompt(
        "nplus1",
        {
            description:
                "Makes tests for N+1 query issues in Java Spring applications.",
            title: "N+1 Query Test Generator",
        },
        async () => {
            return {
                messages: [
                    {
                        content: {
                            type: "text",
                            text: nplus1,
                        },
                        role: "user",
                    },
                ],
                description: "Prompt for N+1 query test generation",
            };
        }
    );

    return app;
}

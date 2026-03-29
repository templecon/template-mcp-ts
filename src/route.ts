import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod";
import nplus1 from "./prompt/nplus1.md?raw";

export const app = new McpServer({
    name: "Example MCP Server",
    version: "1.0.0",
});
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
        i satisfies z.input<typeof inputSchema>;
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
        i satisfies z.input<typeof inputSchema>;
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
        };
    }
);

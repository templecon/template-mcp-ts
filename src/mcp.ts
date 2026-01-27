import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CfWorkerJsonSchemaValidator } from "@modelcontextprotocol/sdk/validation/cfworker";
import z from "zod";

export function createMcpServer() {
    const mcp = new McpServer(
        {
            name: "muppet-hono",
            version: "0.0.1",
        },
        {
            jsonSchemaValidator: new CfWorkerJsonSchemaValidator(),
        },
    );

    mcp.prompt(
        "greet",
        "Greet a person",
        {
            word: z.string().optional().describe("Word to use for greeting"),
        },
        (args) => {
            const word = args.word || "Hello";
            return {
                messages: [
                    {
                        role: "user",
                        content: {
                            type: "text",
                            text: `Greet a person using the word ${word}.`,
                        },
                    },
                ],
            };
        },
    );

    mcp.tool(
        "hello",
        "Say hello",
        {
            name: z.string(),
        },
        (args) => {
            const name = args.name;
            return {
                content: [
                    {
                        type: "text",
                        text: `Hello ${name}!`,
                    },
                ],
            };
        },
    );

    return mcp;
}

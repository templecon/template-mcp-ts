import {
    Client,
    StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";
import { describe, expect, it } from "vitest";

import app from "@/index";
import type { Env } from "@/types";

const ENDPOINT = "http://test.local/mcp";
const env: Env = { MAGIC_SECRET_KEY: "" };

/**
 * Runs `use` with a real MCP client connected to the Hono app, without opening a socket.
 */
async function withClient<T>(
    mode: "legacy" | "auto",
    use: (client: Client) => Promise<T>
): Promise<T> {
    const client = new Client(
        { name: "test-client", version: "0.0.0" },
        { versionNegotiation: { mode } }
    );
    await client.connect(
        new StreamableHTTPClientTransport(new URL(ENDPOINT), {
            fetch: async (url, init) => app.request(url, init, env),
        })
    );
    try {
        return await use(client);
    } finally {
        await client.close();
    }
}

describe.each([
    { mode: "legacy", era: /^2025-/ },
    { mode: "auto", era: /^2026-07-28$/ },
] as const)("MCP endpoint ($mode negotiation)", ({ mode, era }) => {
    it("should negotiate the expected protocol era", async () => {
        const version = await withClient(mode, async (client) =>
            client.getNegotiatedProtocolVersion()
        );
        expect(version).toMatch(era);
    });

    it("should not advertise list change notifications", async () => {
        const capabilities = await withClient(mode, async (client) =>
            client.getServerCapabilities()
        );
        expect(capabilities?.tools?.listChanged).toBe(false);
        expect(capabilities?.prompts?.listChanged).toBe(false);
    });

    it("should list the example tools", async () => {
        const { tools } = await withClient(mode, async (client) =>
            client.listTools()
        );
        expect(tools.map((tool) => tool.name).toSorted()).toEqual([
            "greet",
            "ungreet",
        ]);
    });

    it("should return structured content from greet", async () => {
        const result = await withClient(mode, async (client) =>
            client.callTool({ name: "greet", arguments: { name: "Template" } })
        );
        expect(result.isError).toBe(false);
        expect(result.structuredContent).toEqual({
            greeting: "Hello, Template!",
        });
    });

    it("should return text content from ungreet", async () => {
        const result = await withClient(mode, async (client) =>
            client.callTool({
                name: "ungreet",
                arguments: { name: "Template" },
            })
        );
        expect(result.content).toEqual([
            { type: "text", text: "Goodbye, Template!" },
        ]);
    });

    it("should list the nplus1 prompt", async () => {
        const { prompts } = await withClient(mode, async (client) =>
            client.listPrompts()
        );
        expect(prompts.map((prompt) => prompt.name)).toEqual(["nplus1"]);
    });

    it("should return the nplus1 prompt text", async () => {
        const { messages } = await withClient(mode, async (client) =>
            client.getPrompt({ name: "nplus1" })
        );
        expect(messages).toHaveLength(1);
        expect(messages[0]?.role).toBe("user");
        expect(messages[0]?.content).toMatchObject({
            type: "text",
            text: expect.stringContaining("N+1"),
        });
    });
});

describe("MCP endpoint (stateless serving)", () => {
    it.each(["GET", "DELETE"])("should reject %s with 405", async (method) => {
        const resp = await app.request(
            ENDPOINT,
            { method, headers: { Accept: "text/event-stream" } },
            env
        );
        expect(resp.status).toBe(405);
    });
});

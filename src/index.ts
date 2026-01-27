import { StreamableHTTPTransport } from "@hono/mcp";
import { Hono } from "hono";
import { createMcpServer } from "./mcp";

let app = new Hono();

app = app.all("/mcp", async (c) => {
    const mcp = createMcpServer();
    const transport = new StreamableHTTPTransport({
        sessionIdGenerator: undefined,
    });
    await mcp.connect(transport);
    return transport.handleRequest(c);
});

app = app.get("/", (c) => c.text("Hello World"));

export default app;

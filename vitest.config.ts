import path from "node:path";
import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
    test: {
        poolOptions: {
            workers: {
                wrangler: { configPath: "./wrangler.jsonc" },
            },
        },
        coverage: {
            provider: "istanbul",
            reporter: ["text", "json", "html"],
        },
        server: {
            deps: {
                inline: ["ajv", "ajv-formats", "@modelcontextprotocol/sdk"],
            },
        },
    },
    resolve: {
        alias: {
            ajv: path.resolve(__dirname, "./tests/mocks/ajv.ts"),
            "ajv-formats": path.resolve(
                __dirname,
                "./tests/mocks/ajv-formats.ts",
            ),
        },
    },
});

import baseConfig from "@concertypin/config/oxlint";
import { defineConfig } from "oxlint";

export default defineConfig({
    plugins: ["eslint"],
    env: {
        builtin: true,
    },
    options: {
        denyWarnings: true,
        typeAware: true,
        typeCheck: true,
        reportUnusedDisableDirectives: "error",
    },
    ignorePatterns: [
        "**/node_modules/**",
        "**/dist/**",
        "**/dist-ts/**",
        "**/coverage/**",
        "**/.cache/**",
        "**/.vscode/**",
        "**/.git/**",
    ],
    extends: [baseConfig()],
    rules: {
        "@typescript-eslint/require-await": "off",

        // Server code
        "no-console": "off",
    },
});

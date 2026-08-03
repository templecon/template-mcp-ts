import { defineConfig } from "oxlint";
import config from "@concertypin/config/oxlint";

export default defineConfig({
    plugins: ["typescript", "unicorn", "import", "vitest", "promise", "eslint"],
    env: {
        builtin: true,
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
    extends: [config],
    rules: {
        "@typescript-eslint/require-await": "off",

        // Server code
        "no-console": "off",
    },
    options: {
        typeAware: true,
        typeCheck: true,
        reportUnusedDisableDirectives: "error",
    },
});

import { env } from "cloudflare:test";
import { describe, it, expect } from "vitest";
import app from "../src/index";

describe("Worker", () => {
  it("responds with Hello World", async () => {
    const response = await app.request("/", {}, env);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("Hello World");
  });
});

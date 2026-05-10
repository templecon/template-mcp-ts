import type { HonoEnv } from "@/types";
import type { Context as RawContext, Next } from "hono";
type Context = RawContext<HonoEnv, string>;

export async function cors(c: Context, next: Next) {
    const requestedOrigin = c.req.header("Origin");
    if (requestedOrigin) {
        c.header("Access-Control-Allow-Origin", requestedOrigin);
    }
    c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
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
}

if (import.meta.env.VITEST) {
    const { it, describe, expectTypeOf } = await import("vitest");
    describe("CORS middleware", () => {
        it("env should be typed correctly", () => {
            expectTypeOf<Context>().toExtend<{
                env: HonoEnv["Bindings"];
            }>();
        });
    });
}

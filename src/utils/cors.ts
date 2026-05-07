import type { Hono } from "hono";
type MiddlewareHandler = Parameters<Parameters<Hono["use"]>[1]>;
export async function cors(
    c: MiddlewareHandler["0"],
    next: MiddlewareHandler["1"]
) {
    // CORS allow all
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

import { Muppet } from "muppet";
import z from "zod";

const mcp = new Muppet<{ Variables: { surname: string } }>({
    name: "muppet-hono",
    version: "0.0.1",
});
mcp.prompt(
    {
        name: "greet",
        description: "Greet a person",
        arguments: {
            word: {
                validation: z.string().optional(),
                completion: () => ["Hello", "Hi", "Greetings", "Howdy"],
            },
        },
        title: "Greet a person",
    },
    (c) => {
        const word = c.message.params.arguments.word || "Hello";
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
    {
        name: "hello",
        description: "Say hello",
        inputSchema: z.object({
            name: z.string(),
        }),
    },
    (c) => {
        const name = c.message.params.arguments.name;
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

export default mcp;

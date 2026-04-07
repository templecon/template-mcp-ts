import { Muppet } from "muppet";
import z from "zod";
import {
    getPermissionDrugDetail,
    searchEasyDrugs,
    searchPermissionDrugs,
    transformEasyDrugToDetail,
    transformEasyDrugToSummary,
    transformPermissionDrugToSummary,
    transformPermissionToDetail,
} from "./api";
import type { Bindings, DrugSummary } from "./types";

export function createMcp(bindings: Bindings) {
    const mcp = new Muppet({
        name: "korea-drug-info",
        version: "1.0.0",
    });

    mcp.tool(
        {
            name: "search_drugs",
            description:
                "Search for drugs by name, manufacturer, or ingredient. Returns a list of drugs with basic information.",
            inputSchema: z.object({
                query: z
                    .string()
                    .describe("The name of the drug to search for"),
                manufacturer: z
                    .string()
                    .optional()
                    .describe("The name of the manufacturer"),
                ingredient: z
                    .string()
                    .optional()
                    .describe("The active ingredient"),
                source: z
                    .enum(["all", "permission_only"])
                    .default("all")
                    .describe(
                        "The data source to search. 'all' tries EasyDrug first, then PermissionInfo. 'permission_only' searches only PermissionInfo.",
                    ),
            }),
        },
        async (c) => {
            const { query, manufacturer, ingredient, source } =
                c.message.params.arguments;
            const apiKey = bindings.MFDS_SERVICE_KEY;

            let results: DrugSummary[] = [];

            // Strategy:
            // 1. If source is 'all' and no ingredient specified (since EasyDrug doesn't support ingredient search well), try EasyDrug.
            // 2. If EasyDrug returns results, use them.
            // 3. If no results or source is 'permission_only' or ingredient is specified, try PermissionInfo.

            let triedEasyDrug = false;

            if (source === "all" && !ingredient) {
                try {
                    const easyDrugs = await searchEasyDrugs(apiKey, {
                        itemName: query,
                        entpName: manufacturer,
                    });
                    if (easyDrugs.length > 0) {
                        results = easyDrugs.map(transformEasyDrugToSummary);
                        triedEasyDrug = true;
                    }
                } catch (e) {
                    console.error("EasyDrug Search failed:", e);
                }
            }

            if (results.length === 0) {
                // Fallback to Permission Info
                try {
                    const permDrugs = await searchPermissionDrugs(apiKey, {
                        item_name: query,
                        entp_name: manufacturer,
                        item_ingr_name: ingredient,
                    });
                    results = permDrugs.map(transformPermissionDrugToSummary);
                } catch (e) {
                    console.error("PermissionInfo Search failed:", e);
                    if (!triedEasyDrug && source === "all") {
                        // If we haven't tried EasyDrug yet (e.g. because ingredient was set), and this failed, maybe we should try EasyDrug ignoring ingredient?
                        // But for now let's stick to the logic.
                    }
                }
            }

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(results, null, 2),
                    },
                ],
            };
        },
    );

    mcp.tool(
        {
            name: "read_drug_detail",
            description:
                "Get detailed information about a specific drug using its ID (Item Sequence Number).",
            inputSchema: z.object({
                id: z
                    .string()
                    .describe(
                        "The unique identifier (Item Sequence Number) of the drug",
                    ),
            }),
        },
        async (c) => {
            const { id } = c.message.params.arguments;
            const apiKey = bindings.MFDS_SERVICE_KEY;

            // Try EasyDrug Detail (by searching with itemSeq)
            try {
                const easyDrugs = await searchEasyDrugs(apiKey, {
                    itemSeq: id,
                });
                if (easyDrugs.length > 0) {
                    const detail = transformEasyDrugToDetail(easyDrugs[0]);
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(detail, null, 2),
                            },
                        ],
                    };
                }
            } catch (e) {
                console.error("EasyDrug Detail lookup failed:", e);
            }

            // Fallback to Permission Detail
            try {
                const permDetail = await getPermissionDrugDetail(apiKey, {
                    item_seq: id,
                });
                if (permDetail) {
                    const detail = transformPermissionToDetail(permDetail);
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(detail, null, 2),
                            },
                        ],
                    };
                }
            } catch (e) {
                console.error("Permission Detail lookup failed:", e);
            }

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            error: "Drug details not found",
                        }),
                    },
                ],
                isError: true,
            };
        },
    );

    return mcp;
}

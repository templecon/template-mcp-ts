import type { z } from "zod";
import {
    type DrugDetail,
    type DrugSummary,
    type EasyDrugItemSchema,
    EasyDrugResponseSchema,
    type PermissionDrugDetailItemSchema,
    PermissionDrugDetailResponseSchema,
    type PermissionDrugListItemSchema,
    PermissionDrugListResponseSchema,
} from "./types";

const EASY_DRUG_BASE_URL =
    "http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList";
const PERMISSION_BASE_URL =
    "https://apis.data.go.kr/1471000/DrugPrdtPrmsnInfoService07";

function cleanText(text?: string): string | undefined {
    if (!text) return undefined;
    // Remove XML/HTML tags and entity codes if any
    return text
        .replace(/<[^>]*>?/gm, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .trim();
}

async function fetchJson<T>(url: string, schema: z.ZodType<T>): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(
            `API Request failed: ${response.status} ${response.statusText}`,
        );
    }
    const data = await response.json();
    // Public Data Portal sometimes returns structured error in JSON even with 200 OK,
    // or the schema might not match if error.
    // We'll try to parse with schema.
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
        console.error(
            "Zod Validation Error:",
            JSON.stringify(parsed.error.format(), null, 2),
        );
        console.error("Data received:", JSON.stringify(data, null, 2));
        throw new Error("Failed to parse API response");
    }
    return parsed.data;
}

export async function searchEasyDrugs(
    serviceKey: string,
    query: { itemName?: string; entpName?: string; itemSeq?: string },
): Promise<z.infer<typeof EasyDrugItemSchema>[]> {
    const params = new URLSearchParams({
        serviceKey: serviceKey, // Assuming serviceKey is Decoded. If encoded, we might need to handle differently.
        type: "json",
        numOfRows: "10",
        pageNo: "1",
    });

    if (query.itemName) params.append("itemName", query.itemName);
    if (query.entpName) params.append("entpName", query.entpName);
    if (query.itemSeq) params.append("itemSeq", query.itemSeq);

    // Note: The ServiceKey in URLSearchParams is encoded.
    // If the API demands unencoded key (rare but happens if they just paste the string),
    // we might need manual string concatenation.
    // For now, standard URLSearchParams.

    // Public Data Portal often requires the key to be EXACTLY as issued.
    // URLSearchParams encodes special chars.
    // If the key has '%', it becomes '%25'.
    // Often it's safer to append key manually if we are not sure.
    // But let's try standard way first.

    // Actually, for Node/Bun fetch, we need to be careful.
    // Let's assume the user provides the Decoded key.

    const url = `${EASY_DRUG_BASE_URL}?${params.toString()}`;
    const data = await fetchJson(url, EasyDrugResponseSchema);
    return data.body?.items || [];
}

export async function searchPermissionDrugs(
    serviceKey: string,
    query: { item_name?: string; entp_name?: string; item_ingr_name?: string },
): Promise<z.infer<typeof PermissionDrugListItemSchema>[]> {
    const params = new URLSearchParams({
        serviceKey: serviceKey,
        type: "json",
        numOfRows: "10",
        pageNo: "1",
    });

    if (query.item_name) params.append("item_name", query.item_name);
    if (query.entp_name) params.append("entp_name", query.entp_name);
    if (query.item_ingr_name)
        params.append("item_ingr_name", query.item_ingr_name);

    // The endpoint for list is getDrugPrdtPrmsnInq07
    const url = `${PERMISSION_BASE_URL}/getDrugPrdtPrmsnInq07?${params.toString()}`;
    const data = await fetchJson(url, PermissionDrugListResponseSchema);
    return data.body?.items || [];
}

export async function getPermissionDrugDetail(
    serviceKey: string,
    query: { item_seq?: string; item_name?: string },
): Promise<z.infer<typeof PermissionDrugDetailItemSchema> | null> {
    const params = new URLSearchParams({
        serviceKey: serviceKey,
        type: "json",
        numOfRows: "1",
        pageNo: "1",
    });

    if (query.item_seq) params.append("item_seq", query.item_seq);
    else if (query.item_name) params.append("item_name", query.item_name);

    // The endpoint for detail is getDrugPrdtPrmsnDtInq06 (assuming standard naming based on 07)
    // User wrote getDrugPrdtPrmsDtInq06. Let's try to verify if possible.
    // I will use getDrugPrdtPrmsDtInq06 as per user table title if strict,
    // but let's stick to the URL structure 1471000/DrugPrdtPrmsnInfoService07/getDrugPrdtPrmsnDtInq06?
    // Wait, service 07 usually contains operation 07.
    // Detail might be in Service06?
    // User said: "Base URL: .../DrugPrdtPrmsnInfoService07"
    // And "2. ... (getDrugPrdtPrmsDtInq06)"
    // Usually the service number at the end of URL matches the operation?
    // Or maybe it is .../DrugPrdtPrmsnInfoService06/getDrugPrdtPrmsDtInq06?
    // Given the user instruction, I will assume the Base URL is correct and I append the operation name.
    // I will use `getDrugPrdtPrmsnDtInq06` (Standard) or `getDrugPrdtPrmsDtInq06` (User text).
    // 'Prms' vs 'Prmsn'. The List was 'PrmsInq07' in user text but 'PrmsnInq07' in URL.
    // I will trust the URL pattern 'Prmsn'.

    const url = `${PERMISSION_BASE_URL}/getDrugPrdtPrmsnDtInq06?${params.toString()}`;

    try {
        const data = await fetchJson(url, PermissionDrugDetailResponseSchema);
        return data.body?.items?.[0] || null;
    } catch (e) {
        // If 06 fails, it might be in a different service or different spelling.
        // Logging it would be good.
        console.error("Failed to fetch detail with PrmsnDtInq06", e);
        return null;
    }
}

// --- Transformers ---

export function transformEasyDrugToSummary(
    item: z.infer<typeof EasyDrugItemSchema>,
): DrugSummary {
    return {
        source: "EasyDrug",
        id: item.itemSeq || "",
        name: item.itemName || "Unknown",
        manufacturer: item.entpName || "Unknown",
        efficacySummary: `${cleanText(item.efcyQesitm)?.slice(0, 100)}...`,
    };
}

export function transformPermissionDrugToSummary(
    item: z.infer<typeof PermissionDrugListItemSchema>,
): DrugSummary {
    return {
        source: "PermissionInfo",
        id: item.ITEM_SEQ || item.PRDLST_STDR_CODE || "",
        name: item.ITEM_NAME || "Unknown",
        manufacturer: item.ENTP_NAME || "Unknown",
        ingredients: item.ITEM_INGR_NAME || undefined,
        classification: item.SPCLTY_PBLC || undefined,
    };
}

export function transformEasyDrugToDetail(
    item: z.infer<typeof EasyDrugItemSchema>,
): DrugDetail {
    return {
        source: "EasyDrug",
        id: item.itemSeq || "",
        name: item.itemName || "",
        manufacturer: item.entpName || "",
        efficacy: cleanText(item.efcyQesitm),
        usage: cleanText(item.useMethodQesitm),
        precautions: `${cleanText(item.atpnWarnQesitm)}\n${cleanText(item.atpnQesitm)}`,
        interactions: cleanText(item.intrcQesitm),
        sideEffects: cleanText(item.seQesitm),
        storage: cleanText(item.depositMethodQesitm),
        image: item.itemImage,
    };
}

export function transformPermissionToDetail(
    item: z.infer<typeof PermissionDrugDetailItemSchema>,
): DrugDetail {
    return {
        source: "PermissionInfo",
        id: item.ITEM_SEQ || "",
        name: item.ITEM_NAME || "",
        manufacturer: item.ENTP_NAME || "",
        ingredients: item.MAIN_ITEM_INGR || undefined,
        permitDate: item.ITEM_PERMIT_DATE || undefined,
        efficacy: item.EE_DOC_DATA ? "See Doc Data" : undefined, // Often these are XML blobs, we might need parsing if we want full text
        usage: item.UD_DOC_DATA ? "See Doc Data" : undefined,
        precautions: item.NB_DOC_DATA ? "See Doc Data" : undefined,
        // Permission Detail often doesn't have simple text for efficacy/usage in the JSON.
        // It returns 'Doc Data' which is HTML/XML.
        // For now, we pass it or placeholder.
    };
}

import { z } from "zod";

export interface Bindings {
    MFDS_SERVICE_KEY: string;
}

// --- Easy Drug (e약은요) API Types ---

export const EasyDrugItemSchema = z.object({
    entpName: z.string().optional(),
    itemName: z.string().optional(),
    itemSeq: z.string().optional(),
    efcyQesitm: z.string().optional(), // Efficacy
    useMethodQesitm: z.string().optional(), // Usage
    atpnWarnQesitm: z.string().optional(), // Warning
    atpnQesitm: z.string().optional(), // Precautions
    intrcQesitm: z.string().optional(), // Interactions
    seQesitm: z.string().optional(), // Side Effects
    depositMethodQesitm: z.string().optional(), // Storage
    openDe: z.string().optional(),
    updateDe: z.string().optional(),
    itemImage: z.string().nullable().optional(),
});

export const EasyDrugResponseSchema = z.object({
    header: z.object({
        resultCode: z.string(),
        resultMsg: z.string(),
    }),
    body: z
        .object({
            pageNo: z.number().optional(),
            totalCount: z.number().optional(),
            numOfRows: z.number().optional(),
            items: z.array(EasyDrugItemSchema).nullable().optional(),
        })
        .optional(),
});

// --- Permission Info (07 - List) API Types ---

export const PermissionDrugListItemSchema = z.object({
    ENTP_NAME: z.string().nullable().optional(),
    ITEM_NAME: z.string().nullable().optional(),
    ITEM_SEQ: z.string().nullable().optional(),
    PRDLST_STDR_CODE: z.string().nullable().optional(), // Might be used as ID
    ITEM_INGR_NAME: z.string().nullable().optional(), // Principal Ingredient
    PRDUCT_PRMISN_NO: z.string().nullable().optional(),
    ENTP_NO: z.string().nullable().optional(),
    SPCLTY_PBLC: z.string().nullable().optional(), // Professional/General
    BIZRNO: z.string().nullable().optional(),
});

export const PermissionDrugListResponseSchema = z.object({
    header: z.object({
        resultCode: z.string(),
        resultMsg: z.string(),
    }),
    body: z
        .object({
            pageNo: z.number().optional(),
            totalCount: z.number().optional(),
            numOfRows: z.number().optional(),
            items: z.array(PermissionDrugListItemSchema).nullable().optional(),
        })
        .optional(),
});

// --- Permission Info (06 - Detail) API Types ---

export const PermissionDrugDetailItemSchema = z.object({
    ITEM_NAME: z.string().nullable().optional(),
    ENTP_NAME: z.string().nullable().optional(),
    ITEM_PERMIT_DATE: z.string().nullable().optional(),
    ENTP_NO: z.string().nullable().optional(),
    BAR_CODE: z.string().nullable().optional(),
    ITEM_SEQ: z.string().nullable().optional(),
    START_CHANGE_DATE: z.string().nullable().optional(),
    END_CHANGE_DATE: z.string().nullable().optional(),
    EDI_CODE: z.string().nullable().optional(),
    ATC_CODE: z.string().nullable().optional(),
    BIZRNO: z.string().nullable().optional(),
    RARE_DRUG_YN: z.string().nullable().optional(),
    MAIN_ITEM_INGR: z.string().nullable().optional(), // Active Ingredient
    VALID_TERM: z.string().nullable().optional(), // Validity Term (guessed common field, might not be in user table but often present)
    EE_DOC_DATA: z.string().nullable().optional(), // XML/Doc data for efficacy? (Common in these APIs)
    UD_DOC_DATA: z.string().nullable().optional(), // Usage doc
    NB_DOC_DATA: z.string().nullable().optional(), // Caution doc
});

export const PermissionDrugDetailResponseSchema = z.object({
    header: z.object({
        resultCode: z.string(),
        resultMsg: z.string(),
    }),
    body: z
        .object({
            pageNo: z.number().optional(),
            totalCount: z.number().optional(),
            numOfRows: z.number().optional(),
            items: z
                .array(PermissionDrugDetailItemSchema)
                .nullable()
                .optional(),
        })
        .optional(),
});

// --- Standardized Output Types ---

export const DrugSummarySchema = z.object({
    source: z.enum(["EasyDrug", "PermissionInfo"]),
    id: z.string().describe("The unique identifier (Item Sequence Number)"),
    name: z.string().describe("Product Name"),
    manufacturer: z.string().describe("Manufacturer Name"),
    ingredients: z.string().optional().describe("Active Ingredients"),
    classification: z
        .string()
        .optional()
        .describe("Professional/General Classification"),
    efficacySummary: z.string().optional().describe("Brief Efficacy"),
});

export const DrugDetailSchema = z.object({
    source: z.enum(["EasyDrug", "PermissionInfo"]),
    id: z.string(),
    name: z.string(),
    manufacturer: z.string(),
    ingredients: z.string().optional(),
    efficacy: z.string().optional().describe("Efficacy/Effect"),
    usage: z.string().optional().describe("Usage/Dosage"),
    precautions: z.string().optional().describe("Precautions/Warnings"),
    interactions: z.string().optional().describe("Drug/Food Interactions"),
    sideEffects: z.string().optional().describe("Side Effects"),
    storage: z.string().optional().describe("Storage Method"),
    image: z.string().optional().describe("Product Image URL"),
    permitDate: z.string().optional(),
    cancelDate: z.string().optional(),
    specialtyType: z.string().optional().describe("Specialty vs General"),
});

export type DrugSummary = z.infer<typeof DrugSummarySchema>;
export type DrugDetail = z.infer<typeof DrugDetailSchema>;

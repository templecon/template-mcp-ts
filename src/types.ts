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
    itemImage: z.string().optional(),
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
    entp_name: z.string().optional(),
    item_name: z.string().optional(),
    item_seq: z.string().optional(),
    prdlst_Stdr_code: z.string().optional(), // Might be used as ID
    item_ingr_name: z.string().optional(), // Principal Ingredient
    prduct_prmisn_no: z.string().optional(),
    entp_no: z.string().optional(),
    spclty_pblc: z.string().optional(), // Professional/General
    bizrno: z.string().optional(),
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
    item_name: z.string().optional(),
    entp_name: z.string().optional(),
    item_permit_date: z.string().optional(),
    entp_no: z.string().optional(),
    bar_code: z.string().optional(),
    item_seq: z.string().optional(),
    start_change_date: z.string().optional(),
    end_change_date: z.string().optional(),
    edi_code: z.string().optional(),
    atc_code: z.string().optional(),
    bizrno: z.string().optional(),
    rare_drug_yn: z.string().optional(),
    main_item_ingr: z.string().optional(), // Active Ingredient
    valid_term: z.string().optional(), // Validity Term (guessed common field, might not be in user table but often present)
    ee_doc_data: z.string().optional(), // XML/Doc data for efficacy? (Common in these APIs)
    ud_doc_data: z.string().optional(), // Usage doc
    nb_doc_data: z.string().optional(), // Caution doc
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

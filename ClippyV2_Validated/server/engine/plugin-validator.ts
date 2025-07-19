import { z } from "zod";

const pluginSchemas: Record<string, z.ZodTypeAny> = {
    "invoice-parser": z.string().min(10),
    "contact-extractor": z.string().min(10),
    "table-to-json": z.string().regex(/<table/i),
    "resume-parser": z.string().min(10),
    "meta-tag-extractor": z.string().regex(/<meta/i),
    "json-summary": z.string().regex(/^\[/).or(z.string().regex(/^\{/)),
    "csv-cleaner": z.string().regex(/,/),
    "geojson-validator": z.string().regex(/"type":\s*"FeatureCollection"/),
    "date-normalizer": z.string().min(5),
    "url-extractor": z.string().min(5)
};

export function validatePluginInput(pluginId: string, input: string) {
    const schema = pluginSchemas[pluginId];
    if (!schema) return true;
    const result = schema.safeParse(input);
    if (!result.success) throw new Error("Invalid input for plugin: " + pluginId);
    return true;
}
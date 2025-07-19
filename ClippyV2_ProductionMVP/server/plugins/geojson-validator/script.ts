export default async function run(text: string) {
    const geo = JSON.parse(text);
    if (!geo.type || !geo.features || !Array.isArray(geo.features)) {
        throw new Error("Invalid GeoJSON: must include type + features");
    }
    return { valid: true, features: geo.features.length };
}
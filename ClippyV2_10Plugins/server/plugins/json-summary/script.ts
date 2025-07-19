export default async function run(text: string) {
    const obj = JSON.parse(text);
    if (!Array.isArray(obj)) throw new Error("Input must be JSON array");
    const keys = new Set(obj.flatMap(o => Object.keys(o)));
    return [...keys].map(k => ({
        key: k,
        types: [...new Set(obj.map(o => typeof o[k]))]
    }));
}
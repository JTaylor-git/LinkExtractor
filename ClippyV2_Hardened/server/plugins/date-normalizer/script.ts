export default async function run(text: string) {
    const dates = [...text.matchAll(/\d{1,4}[\/\-]\d{1,2}[\/\-]\d{1,4}/g)].map(d => d[0]);
    const normalized = dates.map(d => new Date(d).toISOString().split("T")[0]);
    return normalized;
}
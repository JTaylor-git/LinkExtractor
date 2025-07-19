export default async function run(text: string) {
    const lines = text.split(/\r?\n/).filter(l => l.trim().length);
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const data = lines.slice(1).map(l => l.split(",").map(v => v.trim()));
    return data.map(row => Object.fromEntries(row.map((val, i) => [headers[i], val])));
}
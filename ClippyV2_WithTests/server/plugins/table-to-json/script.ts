export default async function run(html: string) {
    const rows = [...html.matchAll(/<tr>(.*?)<\/tr>/g)].map(m => m[1]);
    return rows.map(row => {
        const cells = [...row.matchAll(/<td>(.*?)<\/td>/g)].map(c => c[1]);
        return Object.fromEntries(cells.map((val, i) => [\`col\${i+1}\`, val]));
    });
}
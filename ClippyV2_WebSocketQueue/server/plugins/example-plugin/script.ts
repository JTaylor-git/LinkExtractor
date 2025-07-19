export default async function run(html: string) {
    const regex = /<td>(.*?)<\/td>/g;
    const matches = [...html.matchAll(regex)];
    return matches.map(m => m[1]);
}
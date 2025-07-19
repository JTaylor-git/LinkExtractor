export default async function run(text: string) {
    const emails = [...text.matchAll(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/g)].map(m => m[0]);
    const phones = [...text.matchAll(/\+?\d[\d\s.-]{7,}\d/g)].map(m => m[0]);
    return { emails, phones };
}
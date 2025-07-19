export default async function run(text: string) {
    const urls = [...text.matchAll(/https?:\/\/[\w.-]+(?:\/[\w/#?=&.-]*)?/g)].map(m => m[0]);
    return urls;
}
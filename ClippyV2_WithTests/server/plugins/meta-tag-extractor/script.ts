export default async function run(html: string) {
    const title = (html.match(/<title>(.*?)<\/title>/i) || [])[1];
    const desc = (html.match(/<meta name="description" content="(.*?)"/i) || [])[1];
    const keys = (html.match(/<meta name="keywords" content="(.*?)"/i) || [])[1];
    return { title, description: desc, keywords: keys };
}
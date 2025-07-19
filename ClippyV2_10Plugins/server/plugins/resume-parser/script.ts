export default async function run(text: string) {
    const name = (text.match(/Name:\s*(.*)/i) || [])[1] || "N/A";
    const email = (text.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/) || [])[0];
    const skills = [...text.matchAll(/Skills?:\s*(.*?)\n/gi)].map(m => m[1]);
    return { name, email, skills: skills.flat() };
}
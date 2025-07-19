import { runPlugin } from "../engine/plugin-loader";

const testCases = [
  {
    id: "invoice-parser",
    input: "Vendor: AI Corp\nDate: 2024-06-30\nTotal: $199.99",
    desc: "Valid invoice text"
  },
  {
    id: "contact-extractor",
    input: "Reach out to us at help@example.com or call +1 555 234 5678.",
    desc: "Email and phone number"
  },
  {
    id: "table-to-json",
    input: "<table><tr><td>Apple</td><td>2</td></tr><tr><td>Banana</td><td>5</td></tr></table>",
    desc: "Basic HTML table"
  },
  {
    id: "resume-parser",
    input: "Name: Alice Resume\nEmail: alice@example.com\nSkills: JS, React",
    desc: "Simple resume"
  },
  {
    id: "meta-tag-extractor",
    input: '<meta name="description" content="Cool site"><title>Test</title>',
    desc: "HTML meta tags"
  },
  {
    id: "json-summary",
    input: '[{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]',
    desc: "Array of objects"
  },
  {
    id: "csv-cleaner",
    input: " Name , Age \n John , 30 \n Jane , 25 ",
    desc: "Messy CSV"
  },
  {
    id: "geojson-validator",
    input: '{"type":"FeatureCollection","features":[]}',
    desc: "Valid GeoJSON"
  },
  {
    id: "date-normalizer",
    input: "Events on 2024/07/01, 07-02-2024",
    desc: "Multiple date formats"
  },
  {
    id: "url-extractor",
    input: "Visit https://ai.com or http://openai.com",
    desc: "Simple URLs"
  }
];

(async () => {
  for (const test of testCases) {
    try {
      const result = await runPlugin(test.id, test.input);
      console.log(`✅ ${test.id} - ${test.desc}:`, result);
    } catch (e) {
      console.error(`❌ ${test.id} - ${test.desc}:`, e.message);
    }
  }
})();
export default async function run(text: string) {
    const vendorMatch = text.match(/Vendor:\s*(.*)/i);
    const dateMatch = text.match(/Date:\s*(\d{4}-\d{2}-\d{2})/);
    const totalMatch = text.match(/Total:\s*\$([\d.]+)/);
    return {
        vendor: vendorMatch?.[1] || "Unknown",
        date: dateMatch?.[1] || "N/A",
        total: totalMatch?.[1] || "0.00"
    };
}
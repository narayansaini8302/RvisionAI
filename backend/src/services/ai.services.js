const { GoogleGenerativeAI } = require("@google/generative-ai");
const puppeteer = require("puppeteer");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* -------------------- MODEL CONFIG -------------------- */

const MODEL_CONFIGS = [
    { name: "models/gemini-flash-latest", priority: 1 },
    { name: "models/gemini-2.0-flash-lite", priority: 2 },
    { name: "models/gemini-2.5-flash", priority: 3 },
    { name: "models/gemini-2.5-pro", priority: 4 }
];

/* -------------------- RETRY -------------------- */

async function callWithRetry(fn, attempts = 3) {
    for (let i = 1; i <= attempts; i++) {
        try {
            return await fn();
        } catch (err) {
            console.log(`❌ Attempt ${i} failed:`, err.message);
            if (i === attempts) throw err;
            await new Promise(r => setTimeout(r, i * 1000));
        }
    }
}

/* -------------------- SAFE JSON PARSE -------------------- */

function safeJSONParse(text) {
    try {
        const match = text.match(/\{[\s\S]*\}/);
        return match ? JSON.parse(match[0]) : null;
    } catch {
        return null;
    }
}

/* -------------------- PDF GENERATOR -------------------- */

async function generatePdfFromHtml(html) {
    let browser;

    try {
        console.log("📄 Generating PDF...");

        browser = await puppeteer.launch({
            headless: "new",
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage"
            ]
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });

        const pdf = await page.pdf({
            format: "A4",
            printBackground: true
        });

        console.log("✅ PDF success");

        return pdf;

    } catch (err) {
        console.error("❌ Puppeteer failed:", err.message);

        // 🔥 HARD FALLBACK
        return Buffer.from(`
PDF generation failed.
Reason: ${err.message}
        `);
    } finally {
        if (browser) await browser.close();
    }
}

/* -------------------- FALLBACK HTML -------------------- */

function fallbackHTML({ resume, selfDescription, jobDescription }) {
    return `
    <html>
    <body style="font-family:Arial;padding:40px">
        <h1>Resume</h1>
        <h2>Summary</h2>
        <p>${selfDescription || "N/A"}</p>

        <h2>Job Description</h2>
        <p>${jobDescription || "N/A"}</p>

        <h2>Resume Content</h2>
        <pre>${resume || "N/A"}</pre>
    </body>
    </html>
    `;
}

/* -------------------- INTERVIEW REPORT -------------------- */

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    for (const modelConfig of MODEL_CONFIGS) {
        try {
            console.log(`🚀 Trying model: ${modelConfig.name}`);

            const model = genAI.getGenerativeModel({
                model: modelConfig.name
            });

            const result = await callWithRetry(() =>
                model.generateContent(`
Generate interview report JSON.

Resume: ${resume?.slice(0, 2000)}
Job: ${jobDescription?.slice(0, 1000)}
Self: ${selfDescription?.slice(0, 500)}
`)
            );

            const parsed = safeJSONParse(result.response.text());

            if (parsed) {
                console.log("✅ AI success");
                return parsed;
            }

        } catch (err) {
            console.log(`❌ Model failed: ${modelConfig.name}`);
        }
    }

    console.log("⚠️ Using fallback report");

    return {
        matchScore: 60,
        title: "Fallback Report",
        technicalQuestions: [],
        behavioralQuestions: [],
        skillGaps: [],
        preparationPlan: []
    };
}

/* -------------------- RESUME PDF -------------------- */

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    for (const modelConfig of MODEL_CONFIGS) {
        try {
            console.log(`🚀 Trying PDF model: ${modelConfig.name}`);

            const model = genAI.getGenerativeModel({
                model: modelConfig.name
            });

            const result = await callWithRetry(() =>
                model.generateContent(`
Create resume HTML.

Resume: ${resume?.slice(0, 2000)}

Return JSON:
{"html": "<html>...</html>"}
`)
            );

            const parsed = safeJSONParse(result.response.text());

            if (parsed?.html) {
                console.log("✅ HTML generated");
                return await generatePdfFromHtml(parsed.html);
            }

        } catch (err) {
            console.log(`❌ PDF model failed: ${modelConfig.name}`);
        }
    }

    console.log("⚠️ Using fallback PDF");

    const html = fallbackHTML({ resume, selfDescription, jobDescription });

    return await generatePdfFromHtml(html);
}

module.exports = {
    generateInterviewReport,
    generateResumePdf
};
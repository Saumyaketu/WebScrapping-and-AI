const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');
require('dotenv').config();

puppeteer.use(StealthPlugin());

// Helper: Finding a working model dynamically
async function getValidModel() {
    const apiKey = process.env.GEMINI_API_KEY;
    try {
        // Asking Google: "Which models can I use?"
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await axios.get(listUrl);
        
        // Finding the first model that supports 'generateContent'
        const validModel = response.data.models.find(m => 
            m.supportedGenerationMethods.includes('generateContent') && 
            (m.name.includes('flash') || m.name.includes('pro'))
        );

        if (validModel) {
            console.log(`    Using Model: ${validModel.name}`);
            return validModel.name; // e.g., "models/gemini-1.5-flash"
        }
    } catch (e) {
        console.log("    Could not list models. Defaulting to gemini-1.5-flash");
    }
    return 'models/gemini-1.5-flash'; // Fallback
}

async function callGeminiDirectly(modelName, title, originalContent, competitorData) {
    const apiKey = process.env.GEMINI_API_KEY;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;

    const prompt = `
        You are an expert SEO Editor.
        Task: Rewrite this article using the provided competitor insights.
        
        Original Title: ${title}
        Original Content: ${originalContent ? originalContent.substring(0, 4000) : "No content."}
        
        Competitor Insights:
        ${competitorData}
        
        Requirements:
        1. Return ONLY the HTML body (no <html>, <head> tags).
        2. Use <h2> and <p> tags.
        3. Make it detailed and professional.
    `;

    try {
        const response = await axios.post(endpoint, {
            contents: [{ parts: [{ text: prompt }] }]
        });
        return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("    API Error:", error.response ? error.response.data.error.message : error.message);
        return null;
    }
}

async function main() {
    console.log(" AI Worker Started (Smart Mode)...");

    // 1. Fetching Articles
    let articles = [];
    try {
        const response = await axios.get(process.env.LARAVEL_API_URL);
        articles = response.data.filter(a => !a.is_processed);
        console.log(` Found ${articles.length} pending articles.`);
    } catch (error) {
        console.error(" Laravel is offline. Run 'php artisan serve'");
        return;
    }

    if (articles.length === 0) return console.log(" No pending articles.");

    // 2. Getting the correct AI Model
    const modelName = await getValidModel();

    const browser = await puppeteer.launch({ 
        headless: false, 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    
    const page = await browser.newPage();

    for (const article of articles) {
        console.log(`\n Processing: "${article.title}"...`);

        try {
            // --- Searching Google ---
            console.log("    Searching Google...");
            await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded' });

            try { await page.waitForSelector('textarea[name="q"]', { timeout: 5000 }); }
            catch (e) { await page.waitForSelector('textarea[name="q"]', { timeout: 60000 }); }

            await page.type('textarea[name="q"]', `${article.title} blog -site:beyondchats.com`);
            await page.keyboard.press('Enter');

            try { await page.waitForSelector('#search', { timeout: 10000 }); }
            catch (e) { await page.waitForSelector('#search', { timeout: 30000 }); }

            // --- Getting Competitors ---
            const links = await page.evaluate(() => {
                let results = [];
                document.querySelectorAll('h3').forEach(h3 => {
                    const a = h3.closest('a');
                    if (a && a.href && !a.href.includes('google.com') && results.length < 2) {
                        results.push(a.href);
                    }
                });
                return results;
            });
            console.log(`    Competitors: ${links.join(', ')}`);

            // --- Reading Competitors ---
            let competitorContent = "";
            for (const link of links) {
                try {
                    await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 15000 });
                    const text = await page.evaluate(() => document.body.innerText);
                    competitorContent += `\n--- Source: ${link} ---\n${text.substring(0, 2000)}`;
                } catch (e) { console.log(`    Skipped ${link}`); }
            }

            // --- Generating AI Content ---
            console.log("    Sending to Gemini AI...");
            let newContent = await callGeminiDirectly(modelName, article.title, article.original_content, competitorContent);

            if (!newContent) {
                console.log("    AI Failed. Saving fallback.");
                newContent = article.original_content + "<br><p><em>(AI Enhancement Failed - Check Logs)</em></p>";
            } else {
                newContent += `<h3>References</h3><ul>${links.map(l => `<li><a href="${l}">${l}</a></li>`).join('')}</ul>`;
            }

            // --- Saving ---
            await axios.put(`${process.env.LARAVEL_API_URL}/${article.id}`, {
                updated_content: newContent,
                reference_links: links,
                is_processed: true
            });
            console.log("    Saved!");

        } catch (err) {
            console.error(`    Error: ${err.message}`);
        }
    }

    await browser.close();
    console.log(" Done.");
}

main();
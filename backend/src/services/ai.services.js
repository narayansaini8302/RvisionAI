// backend/src/services/ai.services.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model configurations with retry settings
const MODEL_CONFIGS = [
    { 
       name: "models/gemini-flash-latest",
        maxTokens: 4096,
        temperature: 0.7,
        priority: 1 // Highest priority
    },
    { 
        name: "models/gemini-2.0-flash-lite", 
        maxTokens: 4096,
        temperature: 0.7,
        priority: 2
    },
    { 
        name: "models/gemini-2.5-flash",  
        maxTokens: 4096,
        temperature: 0.7,
        priority: 3
    },
    {
        name: "models/gemini-2.5-pro",
        maxTokens: 4096,
        temperature: 0.7,
        priority: 4
    }
];

// Retry configuration
const RETRY_CONFIG = {
    maxAttemptsPerModel: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 8000,  // 8 seconds max
    rateLimitExtraDelay: 5000 // Extra 5 seconds for rate limits
};

// Schema for interview report validation
const interviewReportSchema = z.object({
    matchScore: z.number().min(0).max(100),
    title: z.string().min(1),
    technicalQuestions: z.array(z.object({
        question: z.string(),
        intention: z.string(),
        answer: z.string()
    })),
    behavioralQuestions: z.array(z.object({
        question: z.string(),
        intention: z.string(),
        answer: z.string()
    })),
    skillGaps: z.array(z.object({
        skill: z.string(),
        severity: z.enum(["low", "medium", "high"])
    })),
    preparationPlan: z.array(z.object({
        day: z.number(),
        focus: z.string(),
        tasks: z.array(z.string())
    }))
});

// Utility Functions
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function calculateBackoff(attempt, baseDelay = RETRY_CONFIG.baseDelay) {
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    return Math.min(exponentialDelay, RETRY_CONFIG.maxDelay);
}

function extractJobTitle(jobDescription) {
    if (!jobDescription || jobDescription.trim() === "") {
        return "Interview Preparation Report";
    }
    
    const patterns = [
        /Job Title[:\s]+([^\n]+)/i,
        /Position[:\s]+([^\n]+)/i,
        /Role[:\s]+([^\n]+)/i,
        /Title[:\s]+([^\n]+)/i,
        /^([^\n]+)/,
    ];
    
    for (const pattern of patterns) {
        const match = jobDescription.match(pattern);
        if (match && match[1] && match[1].trim()) {
            const title = match[1].trim();
            return title.replace(/["']/g, '').trim();
        }
    }
    
    const firstLine = jobDescription.split('\n')[0].trim();
    if (firstLine && firstLine.length > 0 && firstLine.length < 100) {
        return firstLine;
    }
    
    return "Software Developer Position";
}

function extractJSONFromResponse(text) {
    if (!text) return "{}";
    
    // Remove markdown code blocks
    let cleaned = text
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
    
    // Try to find JSON object
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        let jsonStr = jsonMatch[0];
        
        // Check if JSON is incomplete
        const openBraces = (jsonStr.match(/\{/g) || []).length;
        const closeBraces = (jsonStr.match(/\}/g) || []).length;
        
        if (openBraces > closeBraces) {
            console.log(`⚠️ JSON incomplete: ${openBraces} opening vs ${closeBraces} closing braces`);
            return "{}";
        }
        
        return jsonStr;
    }
    
    return "{}";
}

function cleanAIResponse(response, jobTitle) {
    // Clean technical questions
    let technicalQuestions = [];
    if (Array.isArray(response.technicalQuestions)) {
        technicalQuestions = response.technicalQuestions.slice(0, 7).map(q => {
            if (typeof q === 'string') {
                try {
                    const parsed = JSON.parse(q);
                    return {
                        question: parsed.question || parsed.q || "Technical question",
                        intention: parsed.intention || parsed.purpose || "To assess technical knowledge",
                        answer: parsed.answer || parsed.ans || "Provide a detailed explanation"
                    };
                } catch (e) {
                    return {
                        question: q,
                        intention: "To assess technical knowledge",
                        answer: "Provide a detailed explanation with examples"
                    };
                }
            } else if (typeof q === 'object' && q !== null) {
                return {
                    question: q.question || q.q || "Technical question",
                    intention: q.intention || q.purpose || "To assess technical knowledge",
                    answer: q.answer || q.ans || "Provide a detailed explanation"
                };
            }
            return {
                question: "Technical question",
                intention: "To assess technical knowledge",
                answer: "Provide a detailed explanation"
            };
        });
    }
    
    // Clean behavioral questions
    let behavioralQuestions = [];
    if (Array.isArray(response.behavioralQuestions)) {
        behavioralQuestions = response.behavioralQuestions.slice(0, 4).map(q => {
            if (typeof q === 'string') {
                try {
                    const parsed = JSON.parse(q);
                    return {
                        question: parsed.question || parsed.q || "Behavioral question",
                        intention: parsed.intention || parsed.purpose || "To assess soft skills",
                        answer: parsed.answer || parsed.ans || "Use STAR method to answer"
                    };
                } catch (e) {
                    return {
                        question: q,
                        intention: "To assess soft skills and behavior",
                        answer: "Use STAR method: Situation, Task, Action, Result"
                    };
                }
            } else if (typeof q === 'object' && q !== null) {
                return {
                    question: q.question || q.q || "Behavioral question",
                    intention: q.intention || q.purpose || "To assess soft skills",
                    answer: q.answer || q.ans || "Use STAR method to answer"
                };
            }
            return {
                question: "Behavioral question",
                intention: "To assess soft skills",
                answer: "Use STAR method to answer"
            };
        });
    }
    
    // Clean skill gaps
    let skillGaps = [];
    if (Array.isArray(response.skillGaps)) {
        skillGaps = response.skillGaps.slice(0, 5).map(gap => {
            if (typeof gap === 'string') {
                try {
                    const parsed = JSON.parse(gap);
                    return {
                        skill: parsed.skill || "Skill gap",
                        severity: ["low", "medium", "high"].includes(parsed.severity) ? parsed.severity : "medium"
                    };
                } catch (e) {
                    return {
                        skill: gap,
                        severity: "medium"
                    };
                }
            } else if (typeof gap === 'object' && gap !== null) {
                return {
                    skill: gap.skill || gap.name || "Skill gap",
                    severity: ["low", "medium", "high"].includes(gap.severity) ? gap.severity : "medium"
                };
            }
            return {
                skill: "Skill gap",
                severity: "medium"
            };
        });
    }
    
    // Clean preparation plan
    let preparationPlan = [];
    if (Array.isArray(response.preparationPlan)) {
        preparationPlan = response.preparationPlan.slice(0, 7).map((plan, idx) => {
            if (typeof plan === 'string') {
                try {
                    const parsed = JSON.parse(plan);
                    return {
                        day: parsed.day || idx + 1,
                        focus: parsed.focus || "Preparation",
                        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : ["Review concepts", "Practice problems"]
                    };
                } catch (e) {
                    return {
                        day: idx + 1,
                        focus: plan.substring(0, 100),
                        tasks: ["Review concepts", "Practice problems"]
                    };
                }
            } else if (typeof plan === 'object' && plan !== null) {
                return {
                    day: plan.day || idx + 1,
                    focus: plan.focus || plan.topic || "Preparation",
                    tasks: Array.isArray(plan.tasks) ? plan.tasks : ["Review concepts", "Practice problems"]
                };
            }
            return {
                day: idx + 1,
                focus: "Preparation",
                tasks: ["Review concepts", "Practice problems"]
            };
        });
    }
    
    return {
        matchScore: typeof response.matchScore === 'number' ? Math.min(100, Math.max(0, response.matchScore)) : 75,
        title: response.title || jobTitle,
        technicalQuestions: technicalQuestions,
        behavioralQuestions: behavioralQuestions,
        skillGaps: skillGaps,
        preparationPlan: preparationPlan
    };
}

// Generic retry wrapper for Gemini API calls
async function callWithRetry(apiCallFn, modelName, operation = "generate") {
    for (let attempt = 1; attempt <= RETRY_CONFIG.maxAttemptsPerModel; attempt++) {
        try {
            // Add delay for retries
            if (attempt > 1) {
                const waitTime = calculateBackoff(attempt);
                console.log(`⏳ Attempt ${attempt}/${RETRY_CONFIG.maxAttemptsPerModel}: Waiting ${waitTime/1000}s...`);
                await delay(waitTime);
            } else {
                console.log(`📝 Attempt ${attempt}/${RETRY_CONFIG.maxAttemptsPerModel}...`);
            }
            
            const result = await apiCallFn();
            return { success: true, result };
            
        } catch (error) {
            const errorMsg = error.message;
            
            // Handle different error types
            if (errorMsg.includes('503') || errorMsg.includes('Service Unavailable')) {
                console.log(`⚠️ Service unavailable (503) - attempt ${attempt}/${RETRY_CONFIG.maxAttemptsPerModel}`);
                if (attempt === RETRY_CONFIG.maxAttemptsPerModel) {
                    return { success: false, error: 'SERVICE_UNAVAILABLE' };
                }
            } else if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('rate')) {
                console.log(`⚠️ Rate limit hit - attempt ${attempt}/${RETRY_CONFIG.maxAttemptsPerModel}`);
                // Add extra delay for rate limits
                await delay(RETRY_CONFIG.rateLimitExtraDelay);
                if (attempt === RETRY_CONFIG.maxAttemptsPerModel) {
                    return { success: false, error: 'RATE_LIMITED' };
                }
            } else {
                console.log(`❌ Error: ${errorMsg}`);
                return { success: false, error: errorMsg };
            }
        }
    }
    
    return { success: false, error: 'MAX_ATTEMPTS_REACHED' };
}

// Main function to generate interview report with integrated retry
async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const jobTitle = extractJobTitle(jobDescription);
    
    console.log("\n📋 Generating interview report for:", jobTitle);
    console.log("📄 Resume length:", resume?.length || 0);
    console.log("📝 Job Description length:", jobDescription?.length || 0);
    console.log("💬 Self Description length:", selfDescription?.length || 0);

    const prompt = `You are an expert technical interviewer. Create a personalized interview preparation report. Return ONLY raw JSON without any markdown formatting or code blocks.

CANDIDATE RESUME:
${resume?.substring(0, 3500) || "No resume provided"}

CANDIDATE SELF DESCRIPTION:
${selfDescription?.substring(0, 500) || "No self description provided"}

JOB DESCRIPTION:
${jobDescription?.substring(0, 2500) || "No job description provided"}

Return this exact JSON structure:
{
  "matchScore": 85,
  "title": "${jobTitle}",
  "technicalQuestions": [
    {"question": "Q1", "intention": "why", "answer": "how"}
  ],
  "behavioralQuestions": [
    {"question": "Q1", "intention": "why", "answer": "how"}
  ],
  "skillGaps": [
    {"skill": "skill", "severity": "medium"}
  ],
  "preparationPlan": [
    {"day": 1, "focus": "topic", "tasks": ["task1"]}
  ]
}

CRITICAL: Return ONLY the JSON object. No markdown. No explanations. No \`\`\`json tags. Ensure the JSON is complete and valid.`;

    // Try each model with retry logic
    for (const modelConfig of MODEL_CONFIGS) {
        console.log(`\n🚀 Trying model: ${modelConfig.name} (Priority: ${modelConfig.priority})`);
        
        const response = await callWithRetry(
            async () => {
                const model = genAI.getGenerativeModel({ 
                    model: modelConfig.name,
                    generationConfig: {
                        temperature: modelConfig.temperature,
                        maxOutputTokens: modelConfig.maxTokens,
                    }
                });
                
                const result = await model.generateContent(prompt);
                const response = result.response;
                return response.text();
            },
            modelConfig.name,
            "interview_report"
        );
        
        if (!response.success) {
            console.log(`❌ Model ${modelConfig.name} failed: ${response.error}`);
            continue;
        }
        
        const responseText = response.result;
        console.log(`📝 Response length: ${responseText.length} characters`);
        
        // Extract and parse JSON
        const jsonString = extractJSONFromResponse(responseText);
        
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(jsonString);
            console.log(`✅ JSON parsed successfully`);
        } catch (e) {
            console.error(`❌ JSON Parse Error: ${e.message}`);
            continue;
        }
        
        // Validate and clean the response
        const cleanedResponse = cleanAIResponse(parsedResponse, jobTitle);
        
        if (cleanedResponse.technicalQuestions.length === 0) {
            console.log("⚠️ No technical questions generated, trying next model...");
            continue;
        }
        
        console.log("\n🎉 SUCCESS! Generated content:");
        console.log(`   ✅ Model used: ${modelConfig.name}`);
        console.log(`   📊 Match Score: ${cleanedResponse.matchScore}`);
        console.log(`   ❓ Technical Questions: ${cleanedResponse.technicalQuestions.length}`);
        console.log(`   💬 Behavioral Questions: ${cleanedResponse.behavioralQuestions.length}`);
        console.log(`   🔧 Skill Gaps: ${cleanedResponse.skillGaps.length}`);
        console.log(`   📅 Preparation Days: ${cleanedResponse.preparationPlan.length}`);
        
        return cleanedResponse;
    }
    
    throw new Error("All Gemini models failed to generate interview report. Please try again later.");
}

// Generate PDF from HTML
async function generatePdfFromHtml(htmlContent) {
    console.log("📄 Converting HTML to PDF...");
    let browser = null;
    
    try {
        browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ],
            headless: true
        });
        
        const page = await browser.newPage();
        await page.setDefaultTimeout(30000);
        await page.setViewport({ width: 1200, height: 800 });
        await page.setContent(htmlContent, { 
            waitUntil: "networkidle0",
            timeout: 30000 
        });
        
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "20mm",
                bottom: "20mm",
                left: "15mm",
                right: "15mm"
            }
        });
        
        console.log("✅ PDF conversion successful, size:", pdfBuffer.length, "bytes");
        return pdfBuffer;
        
    } catch (error) {
        console.error("PDF Conversion Error:", error.message);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Extract resume information
function extractResumeInfo(resume) {
    if (!resume) return { name: null, email: null, phone: null, skills: [], summary: null };
    
    const info = {
        name: null,
        email: null,
        phone: null,
        title: null,
        skills: [],
        summary: null,
        experience: null,
        education: null
    };
    
    // Extract email
    const emailMatch = resume.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) info.email = emailMatch[0];
    
    // Extract phone
    const phoneMatch = resume.match(/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/);
    if (phoneMatch) info.phone = phoneMatch[0];
    
    // Extract name
    const lines = resume.split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (!info.name && trimmed.length > 0 && trimmed.length < 50) {
            if (!trimmed.includes('@') && !trimmed.includes('RESUME') && !trimmed.includes('CV')) {
                info.name = trimmed;
                break;
            }
        }
    }
    
    // Extract skills
    const skillKeywords = [
        'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'MongoDB', 'SQL', 'MySQL',
        'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'TypeScript', 'Angular', 'Vue.js',
        'PHP', 'Ruby', 'C#', 'C++', 'Go', 'Rust', 'Swift', 'Kotlin', 'Flutter', 'React Native',
        'Git', 'REST', 'GraphQL', 'HTML', 'CSS', 'SASS', 'Webpack', 'Babel', 'Jest',
        'Mocha', 'Chai', 'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'Ruby on Rails'
    ];
    
    skillKeywords.forEach(skill => {
        if (resume.toLowerCase().includes(skill.toLowerCase())) {
            if (!info.skills.includes(skill)) {
                info.skills.push(skill);
            }
        }
    });
    
    info.skills = info.skills.slice(0, 8);
    return info;
}

// Enhanced fallback PDF generator
async function createEnhancedFallbackPDF({ resume, selfDescription, jobDescription }) {
    console.log("📄 Creating enhanced fallback resume...");
    
    const extracted = extractResumeInfo(resume);
    
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${extracted.name || 'Professional'} - Resume</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', 'Arial', sans-serif;
            line-height: 1.6;
            color: #2c3e50;
            padding: 40px;
            max-width: 1000px;
            margin: 0 auto;
            background: #fff;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #3498db;
        }
        h1 { color: #2c3e50; font-size: 36px; margin-bottom: 8px; }
        .title { color: #7f8c8d; font-size: 18px; margin-bottom: 12px; }
        .contact {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
            color: #34495e;
            font-size: 14px;
        }
        .section { margin-bottom: 25px; }
        h2 {
            color: #2c3e50;
            font-size: 20px;
            margin-bottom: 12px;
            padding-bottom: 5px;
            border-bottom: 2px solid #3498db;
        }
        .skills-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin: 10px 0;
        }
        .skill-badge {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 500;
        }
        .content-box {
            background: #f8f9fa;
            padding: 18px;
            border-radius: 8px;
            border-left: 4px solid #3498db;
        }
        .job-target {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            margin-bottom: 25px;
            font-weight: 500;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 11px;
            color: #95a5a6;
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${extracted.name || 'Professional Developer'}</h1>
        <div class="title">${extracted.title || 'Full Stack Developer'}</div>
        <div class="contact">
            ${extracted.email ? `<span>📧 ${extracted.email}</span>` : '<span>📧 contact@email.com</span>'}
            ${extracted.phone ? `<span>📱 ${extracted.phone}</span>` : '<span>📱 (123) 456-7890</span>'}
            <span>📍 Location</span>
            <span>🔗 linkedin.com/in/profile</span>
        </div>
    </div>
    
    ${jobDescription ? `<div class="job-target">🎯 Target Position: ${jobDescription.replace(/[<>]/g, '')}</div>` : ''}
    
    <div class="section">
        <h2>📋 Professional Summary</h2>
        <div class="content-box">
            ${selfDescription || extracted.summary || 'Experienced developer with a strong background in building scalable web applications. Passionate about clean code, performance optimization, and delivering exceptional user experiences.'}
        </div>
    </div>
    
    <div class="section">
        <h2>💻 Technical Skills</h2>
        <div class="skills-container">
            ${extracted.skills.length > 0 ? 
                extracted.skills.map(skill => `<span class="skill-badge">${skill}</span>`).join('') :
                ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB', 'SQL', 'Git', 'AWS'].map(skill => `<span class="skill-badge">${skill}</span>`).join('')
            }
        </div>
    </div>
    
    <div class="section">
        <h2>🚀 Experience & Projects</h2>
        <div class="content-box">
            ${extracted.experience || resume || 'Full Stack Developer with experience in designing and implementing web applications from concept to deployment. Skilled in both frontend and backend development with a focus on creating responsive and maintainable solutions.'}
        </div>
    </div>
    
    <div class="section">
        <h2>🎓 Education</h2>
        <div class="content-box">
            ${extracted.education || '<strong>Bachelor of Technology in Computer Science</strong><br>Relevant Coursework: Data Structures, Algorithms, Web Development, Database Systems'}
        </div>
    </div>
    
    <div class="footer">
        Generated by RvisionAI - AI-Powered Resume Platform<br>
        © ${new Date().getFullYear()} RvisionAI. All rights reserved.
    </div>
</body>
</html>`;
    
    return await generatePdfFromHtml(html);
}

// Generate ATS-friendly resume PDF with integrated retry
async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    console.log("📄 Generating ATS-friendly PDF resume with retry logic...");
    
    // Use models with higher token limits for resume generation
    const resumeModelConfigs = MODEL_CONFIGS.map(config => ({
        ...config,
        maxTokens: 8192, // Higher token limit for complete HTML
        temperature: 0.6  // Lower temperature for more consistent output
    }));
    
    for (const modelConfig of resumeModelConfigs) {
        console.log(`\n📄 Trying model: ${modelConfig.name} (Priority: ${modelConfig.priority})`);
        
        const response = await callWithRetry(
            async () => {
                const model = genAI.getGenerativeModel({ 
                    model: modelConfig.name,
                    generationConfig: {
                        temperature: modelConfig.temperature,
                        maxOutputTokens: modelConfig.maxTokens,
                        topP: 0.95,
                        topK: 40,
                    }
                });
                
                const prompt = `Create a professional HTML resume. Return ONLY a valid JSON object with an "html" key.

Resume Content:
${resume?.substring(0, 2000) || "Software developer"}

Target Role:
${jobDescription ? jobDescription.substring(0, 500) : 'Software Developer'}

Requirements:
- Clean, ATS-friendly HTML with CSS styling
- Include: name, summary, skills, experience, education
- Professional design with proper spacing
- Dark text on light background

Return format: {"html": "<!DOCTYPE html>..."}

CRITICAL: Complete the JSON. Return ONLY the JSON object.`;
                
                const result = await model.generateContent(prompt);
                return result.response.text();
            },
            modelConfig.name,
            "resume_pdf"
        );
        
        if (!response.success) {
            console.log(`❌ Model ${modelConfig.name} failed: ${response.error}`);
            continue;
        }
        
        const responseText = response.result;
        console.log(`📝 Response length: ${responseText.length} characters`);
        
        // Extract and validate JSON
        const jsonString = extractJSONFromResponse(responseText);
        
        if (jsonString === "{}" || jsonString.length < 50) {
            console.log(`⚠️ Empty or invalid JSON response`);
            continue;
        }
        
        let jsonContent;
        try {
            jsonContent = JSON.parse(jsonString);
        } catch (e) {
            console.log(`⚠️ JSON parse error: ${e.message}`);
            continue;
        }
        
        // Validate HTML content
        if (!jsonContent.html || jsonContent.html.length < 100) {
            console.log(`⚠️ Invalid HTML content`);
            continue;
        }
        
        if (!jsonContent.html.includes('</html>') || !jsonContent.html.includes('</body>')) {
            console.log(`⚠️ HTML appears incomplete`);
            continue;
        }
        
        console.log(`✅ SUCCESS! HTML valid (${jsonContent.html.length} chars)`);
        console.log(`🎉 PDF generated with ${modelConfig.name}!`);
        
        return await generatePdfFromHtml(jsonContent.html);
    }
    
    // All attempts failed - use enhanced fallback
    console.log("\n📄 All AI attempts exhausted, using enhanced fallback template...");
    return await createEnhancedFallbackPDF({ resume, selfDescription, jobDescription });
}

module.exports = { generateInterviewReport, generateResumePdf };
const { GoogleGenerativeAI } = require("@google/generative-ai");
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* -------------------- MODEL CONFIG WITH PRIORITY -------------------- */

const MODEL_CONFIGS = [
    { 
        name: "gemini-2.5-flash",  // ✅ Current default - fast, good quality
        priority: 1, 
        displayName: "Gemini 2.5 Flash"
    },
    { 
        name: "gemini-2.5-flash-lite",  // ✅ Ultra low-cost, high throughput
        priority: 2, 
        displayName: "Gemini 2.5 Flash-Lite"
    },
    { 
        name: "gemini-2.0-flash",  // ✅ Legacy but still working
        priority: 3, 
        displayName: "Gemini 2.0 Flash"
    },
    { 
        name: "gemini-2.0-flash-lite",  // ✅ Legacy cheap model
        priority: 4, 
        displayName: "Gemini 2.0 Flash-Lite"
    }
];

/* -------------------- RETRY MECHANISM -------------------- */

async function callWithRetry(fn, attempts = 3, delay = 1000) {
    let lastError;
    
    for (let i = 1; i <= attempts; i++) {
        try {
            console.log(`🔄 Attempt ${i}/${attempts}...`);
            return await fn();
        } catch (err) {
            lastError = err;
            console.log(`❌ Attempt ${i} failed: ${err.message}`);
            
            if (i === attempts) {
                console.log(`🚫 All ${attempts} attempts failed`);
                throw lastError;
            }
            
            const waitTime = delay * Math.pow(2, i - 1);
            console.log(`⏳ Waiting ${waitTime}ms before retry...`);
            await new Promise(r => setTimeout(r, waitTime));
        }
    }
}

/* -------------------- SAFE JSON PARSE WITH FALLBACK -------------------- */

function safeJSONParse(text, fallback = null) {
    if (!text) return fallback;
    
    try {
        let jsonStr = text;
        const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
            jsonStr = codeBlockMatch[1];
        }
        
        const firstBrace = jsonStr.indexOf('{');
        const lastBrace = jsonStr.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
        }
        
        const parsed = JSON.parse(jsonStr);
        return parsed;
    } catch (err) {
        console.log(`⚠️ JSON parse failed: ${err.message}`);
        console.log(`📝 Raw text preview: ${text.substring(0, 200)}...`);
        return fallback;
    }
}

/* -------------------- ENHANCED PROMPT ENGINEERING -------------------- */

function buildInterviewPrompt({ resume, selfDescription, jobDescription, additionalContext = {} }) {
    return `You are a senior technical interviewer from a top tech company (Google, Meta, Amazon). Create a highly personalized, realistic interview preparation report.

**CRITICAL INSTRUCTIONS:**
1. Return ONLY valid JSON (no markdown, no explanations)
2. Base ALL questions on the provided resume and job description
3. Questions must be SPECIFIC to the candidate's experience and technologies
4. Include real-world scenarios and company-specific challenges
5. Use STAR method for behavioral questions
6. Provide detailed, actionable answers

**REQUIRED JSON STRUCTURE:**
{
  "matchScore": 85,
  "title": "Senior Frontend Developer Interview Prep",
  "candidateName": "Extracted from resume",
  "targetRole": "Job title from description",
  "executiveSummary": "2-3 sentence overview of candidate fit",
  
  "technicalQuestions": [
    {
      "question": "Specific technical question based on their stack",
      "intention": "What this question tests",
      "answer": "Detailed model answer with code examples if applicable",
      "difficulty": "easy|medium|hard",
      "category": "Algorithms|System Design|Language Specific|Architecture"
    }
  ],
  
  "behavioralQuestions": [
    {
      "question": "Real behavioral question for their experience level",
      "intention": "What leadership principle this tests",
      "answer": "STAR format answer with specific metrics",
      "category": "Leadership|Conflict Resolution|Project Management|Failure"
    }
  ],
  
  "skillGaps": [
    {
      "skill": "Specific missing skill",
      "severity": "low|medium|high",
      "recommendation": "Actionable learning resource or practice method",
      "estimatedTimeToLearn": "2 weeks"
    }
  ],
  
  "preparationPlan": [
    {
      "day": 1,
      "focus": "Topic area",
      "tasks": ["Specific actionable task", "Another task with time estimate"],
      "resources": ["Link or book recommendation"]
    }
  ],
  
  "companySpecific": {
    "values": ["Value 1", "Value 2"],
    "interviewProcess": "Description of typical interview rounds",
    "tips": ["Tip 1", "Tip 2"]
  }
}

**INPUT DATA:**

RESUME (${resume?.length || 0} chars):
${resume?.substring(0, 3000) || "No resume provided - generate general questions"}

SELF DESCRIPTION (${selfDescription?.length || 0} chars):
${selfDescription?.substring(0, 1000) || "No self description provided"}

JOB DESCRIPTION (${jobDescription?.length || 0} chars):
${jobDescription?.substring(0, 2000) || "No job description - generate general preparation"}

Generate REALISTIC, SPECIFIC questions. If candidate has React experience, ask about hooks, performance, etc. If backend, ask about databases, caching, API design.`;
}

/* -------------------- INTERVIEW REPORT GENERATION -------------------- */

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    console.log("\n🎯 Starting Interview Report Generation...");
    console.log(`📊 Input sizes - Resume: ${resume?.length || 0}, JobDesc: ${jobDescription?.length || 0}, Self: ${selfDescription?.length || 0}`);
    
    let lastError = null;
    
    for (const modelConfig of MODEL_CONFIGS) {
        try {
            console.log(`\n🚀 Attempting with ${modelConfig.displayName} (Priority: ${modelConfig.priority})`);
            
            // ✅ REMOVED apiVersion - not needed for new models
            const model = genAI.getGenerativeModel({ 
                model: modelConfig.name 
            });

            const prompt = buildInterviewPrompt({ resume, selfDescription, jobDescription });
            
            const result = await callWithRetry(() => model.generateContent(prompt), 2);
            const response = await result.response;
            const text = response.text();
            
            console.log(`📝 Received response: ${text.length} characters`);
            
            const parsed = safeJSONParse(text);
            
            if (parsed && Object.keys(parsed).length > 0) {
                const enhanced = {
                    matchScore: parsed.matchScore || 75,
                    title: parsed.title || "Interview Preparation Report",
                    candidateName: parsed.candidateName || "Candidate",
                    targetRole: parsed.targetRole || "Software Developer",
                    executiveSummary: parsed.executiveSummary || "Based on your experience and the role requirements, here's your personalized preparation guide.",
                    
                    technicalQuestions: Array.isArray(parsed.technicalQuestions) ? parsed.technicalQuestions.slice(0, 8) : generateFallbackQuestions("technical"),
                    behavioralQuestions: Array.isArray(parsed.behavioralQuestions) ? parsed.behavioralQuestions.slice(0, 6) : generateFallbackQuestions("behavioral"),
                    skillGaps: Array.isArray(parsed.skillGaps) ? parsed.skillGaps.slice(0, 5) : [],
                    preparationPlan: Array.isArray(parsed.preparationPlan) ? parsed.preparationPlan.slice(0, 7) : generateFallbackPlan(),
                    companySpecific: parsed.companySpecific || {
                        values: ["Innovation", "Customer Focus", "Excellence"],
                        interviewProcess: "Initial screen → Technical phone screen → Onsite (4-5 rounds)",
                        tips: ["Research the company thoroughly", "Prepare specific examples"]
                    },
                    generatedAt: new Date().toISOString(),
                    modelUsed: modelConfig.displayName
                };
                
                console.log(`✅ Success! Match Score: ${enhanced.matchScore}% using ${modelConfig.displayName}`);
                return enhanced;
            } else {
                console.log(`⚠️ Invalid JSON structure from ${modelConfig.displayName}`);
            }
            
        } catch (err) {
            lastError = err;
            console.log(`❌ ${modelConfig.displayName} failed: ${err.message}`);
            
            if (err.message.includes("safety") || err.message.includes("blocked")) {
                console.log("🚫 Content blocked by safety filters, trying next model...");
            }
        }
    }
    
    console.log("⚠️ All models failed, generating fallback report...");
    return generateFallbackReport({ resume, selfDescription, jobDescription });
}

/* -------------------- FALLBACK FUNCTIONS -------------------- */

function generateFallbackQuestions(type) {
    if (type === "technical") {
        return [
            {
                question: "Walk me through your experience with the primary technologies mentioned in your resume.",
                intention: "Assess depth of technical knowledge and practical application",
                answer: "Highlight specific projects, challenges faced, and solutions implemented. Focus on measurable outcomes.",
                difficulty: "medium",
                category: "Experience"
            },
            {
                question: "How do you approach debugging a production issue that's causing customer impact?",
                intention: "Evaluate problem-solving methodology and urgency handling",
                answer: "1. Identify impact scope 2. Rollback if possible 3. Gather logs/metrics 4. Reproduce in staging 5. Fix and deploy with monitoring",
                difficulty: "medium",
                category: "Problem Solving"
            },
            {
                question: "Explain a technical decision you made that significantly improved system performance.",
                intention: "Test system design knowledge and optimization skills",
                answer: "Use specific metrics (latency, throughput, cost). Explain trade-offs considered and why your approach was chosen.",
                difficulty: "hard",
                category: "System Design"
            }
        ];
    } else {
        return [
            {
                question: "Describe a time when you had to deal with a difficult team member or stakeholder.",
                intention: "Evaluate conflict resolution and emotional intelligence",
                answer: "Situation: [context] Task: [your responsibility] Action: [specific steps taken] Result: [positive outcome with metrics]",
                category: "Conflict Resolution"
            },
            {
                question: "Tell me about a project that failed and what you learned from it.",
                intention: "Assess accountability and growth mindset",
                answer: "Own the failure, explain lessons learned, and how you applied them to future projects.",
                category: "Failure & Learning"
            },
            {
                question: "How do you prioritize multiple competing deadlines?",
                intention: "Test time management and communication skills",
                answer: "Use frameworks like Eisenhower Matrix. Communicate trade-offs early. Negotiate scope when necessary.",
                category: "Project Management"
            }
        ];
    }
}

function generateFallbackPlan() {
    return [
        {
            day: 1,
            focus: "Company Research & Role Understanding",
            tasks: [
                "Study company mission, values, and recent news (2 hours)",
                "Analyze job requirements and map to your experience (1 hour)",
                "Prepare 5 questions for the interviewer (30 minutes)"
            ],
            resources: ["Company blog", "Glassdoor reviews", "LinkedIn company page"]
        },
        {
            day: 2,
            focus: "Technical Fundamentals Review",
            tasks: [
                "Review core data structures and algorithms (3 hours)",
                "Practice 5-10 LeetCode problems medium difficulty (2 hours)",
                "Review system design basics (2 hours)"
            ],
            resources: ["LeetCode", "System Design Interview by Alex Xu", "YouTube tech talks"]
        },
        {
            day: 3,
            focus: "Behavioral Story Preparation",
            tasks: [
                "Write 5-7 STAR format stories (3 hours)",
                "Practice verbal delivery with timer (1 hour)",
                "Record yourself and review (1 hour)"
            ],
            resources: ["Amazon Leadership Principles", "Google's Interview Guide"]
        },
        {
            day: 4,
            focus: "Mock Interviews",
            tasks: [
                "Technical mock interview with peer (1 hour)",
                "Behavioral mock interview (1 hour)",
                "Get feedback and refine weak areas (2 hours)"
            ],
            resources: ["Pramp", "Interviewing.io", "CareerCup"]
        },
        {
            day: 5,
            focus: "Final Preparation & Logistics",
            tasks: [
                "Test equipment (camera, mic, internet) (30 minutes)",
                "Prepare your environment (clean background, good lighting)",
                "Review all prepared materials (2 hours)",
                "Get good sleep and stay hydrated"
            ],
            resources: ["Interview checklist", "Breathing exercises for anxiety"]
        }
    ];
}

function generateFallbackReport({ resume, selfDescription, jobDescription }) {
    return {
        matchScore: 70,
        title: "Interview Preparation Guide",
        candidateName: "Professional Candidate",
        targetRole: jobDescription?.substring(0, 50) || "Software Developer",
        executiveSummary: "Based on your background, focus on strengthening key technical areas and preparing structured behavioral responses.",
        technicalQuestions: generateFallbackQuestions("technical"),
        behavioralQuestions: generateFallbackQuestions("behavioral"),
        skillGaps: [
            {
                skill: "System Design",
                severity: "medium",
                recommendation: "Study common patterns (load balancing, caching, database sharding)",
                estimatedTimeToLearn: "2-3 weeks"
            },
            {
                skill: "Communication of technical concepts",
                severity: "low",
                recommendation: "Practice explaining complex topics to non-technical audiences",
                estimatedTimeToLearn: "1 week"
            }
        ],
        preparationPlan: generateFallbackPlan(),
        companySpecific: {
            values: ["Innovation", "Collaboration", "Customer Focus"],
            interviewProcess: "Recruiter Screen → Technical Phone Interview → Onsite (4-5 rounds including system design and behavioral)",
            tips: [
                "Research the company's tech stack and products",
                "Prepare specific metrics for your achievements",
                "Ask thoughtful questions about team culture and growth"
            ]
        },
        generatedAt: new Date().toISOString(),
        modelUsed: "Fallback Generator"
    };
}

/* -------------------- ATS-FRIENDLY HTML RESUME GENERATOR -------------------- */

async function generateResumeHtml({ resume, selfDescription, jobDescription }) {
    console.log("\n🎨 Generating ATS-friendly HTML resume...");
    
    for (const modelConfig of MODEL_CONFIGS) {
        try {
            console.log(`🚀 Generating HTML with ${modelConfig.displayName}...`);
            
            // ✅ REMOVED apiVersion - not needed for new models
            const model = genAI.getGenerativeModel({ 
                model: modelConfig.name 
            });

            const prompt = `Create a professional, ATS-friendly HTML resume. Return ONLY valid JSON: {"html": "full html content"}

**REQUIREMENTS:**
1. Use semantic HTML5 tags (header, section, article)
2. Clean, minimalist design with proper spacing
3. ATS-friendly: no columns, no graphics, standard fonts
4. Include: Name, Contact, Summary, Skills, Experience, Education
5. Use system fonts: Arial, Helvetica, sans-serif
6. Dark text (#333) on white background (#fff)
7. Responsive design (works on all screen sizes)
8. Print-optimized (good PDF conversion)

**CONTENT TO INCLUDE:**
Resume: ${resume?.substring(0, 2000) || "Not provided"}
Self Description: ${selfDescription?.substring(0, 500) || "Not provided"}
Target Role: ${jobDescription?.substring(0, 500) || "Not provided"}

Generate a COMPLETE, ready-to-use HTML document.`;

            const result = await callWithRetry(() => model.generateContent(prompt), 2);
            const response = await result.response;
            const text = response.text();
            
            const parsed = safeJSONParse(text);
            
            if (parsed?.html && parsed.html.length > 500) {
                console.log(`✅ HTML generated successfully (${parsed.html.length} chars)`);
                return parsed.html;
            }
            
        } catch (err) {
            console.log(`❌ HTML generation failed with ${modelConfig.displayName}: ${err.message}`);
        }
    }
    
    console.log("⚠️ Using fallback HTML template");
    return getFallbackHtmlTemplate({ resume, selfDescription, jobDescription });
}

/* -------------------- FALLBACK HTML TEMPLATE -------------------- */

function getFallbackHtmlTemplate({ resume, selfDescription, jobDescription }) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Professional Resume</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            line-height: 1.5;
            color: #333;
            background: #fff;
            padding: 40px 20px;
        }
        
        .resume-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        h1 {
            font-size: 28px;
            color: #111;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }
        
        .contact {
            color: #555;
            font-size: 14px;
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 2px solid #eee;
        }
        
        .contact span {
            margin-right: 20px;
        }
        
        h2 {
            font-size: 18px;
            color: #111;
            margin: 25px 0 12px 0;
            padding-bottom: 5px;
            border-bottom: 1px solid #ddd;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .summary {
            background: #f8f8f8;
            padding: 15px;
            margin: 15px 0;
            border-left: 3px solid #666;
            font-size: 14px;
        }
        
        .skills-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            list-style: none;
            margin: 10px 0;
        }
        
        .skills-list li {
            background: #f0f0f0;
            padding: 5px 12px;
            border-radius: 3px;
            font-size: 13px;
            color: #333;
        }
        
        .experience-item, .education-item {
            margin-bottom: 20px;
        }
        
        .item-title {
            font-weight: bold;
            font-size: 16px;
            color: #111;
            margin-bottom: 5px;
        }
        
        .item-company, .item-institution {
            color: #666;
            font-size: 14px;
            margin-bottom: 8px;
        }
        
        .item-date {
            color: #888;
            font-size: 12px;
            margin-bottom: 8px;
        }
        
        .item-description {
            font-size: 13px;
            margin-top: 8px;
            padding-left: 15px;
        }
        
        .item-description li {
            margin-bottom: 5px;
        }
        
        @media print {
            body {
                padding: 0;
                margin: 0;
            }
            .resume-container {
                box-shadow: none;
                padding: 20px;
            }
            .summary {
                background: #f8f8f8;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="resume-container">
        <h1>Professional Candidate</h1>
        <div class="contact">
            <span>📧 candidate@email.com</span>
            <span>📱 (555) 123-4567</span>
            <span>📍 Remote / Anywhere</span>
            <span>🔗 linkedin.com/in/candidate</span>
        </div>
        
        <div class="summary">
            <strong>Professional Summary</strong><br>
            ${selfDescription || "Experienced software engineer with strong problem-solving skills and a passion for building scalable applications. Proven track record of delivering high-quality code and collaborating effectively with cross-functional teams."}
        </div>
        
        <h2>Core Competencies</h2>
        <ul class="skills-list">
            <li>JavaScript/TypeScript</li>
            <li>React/Node.js</li>
            <li>Python</li>
            <li>SQL/NoSQL</li>
            <li>REST APIs</li>
            <li>Git/GitHub</li>
            <li>Agile/Scrum</li>
            <li>Problem Solving</li>
        </ul>
        
        <h2>Professional Experience</h2>
        <div class="experience-item">
            <div class="item-title">Senior Software Engineer</div>
            <div class="item-company">Tech Solutions Inc.</div>
            <div class="item-date">2021 - Present</div>
            <ul class="item-description">
                <li>Led development of microservices architecture serving 1M+ users</li>
                <li>Improved API response time by 40% through caching strategies</li>
                <li>Mentored 3 junior developers and conducted code reviews</li>
            </ul>
        </div>
        
        <div class="experience-item">
            <div class="item-title">Software Developer</div>
            <div class="item-company">Digital Innovations</div>
            <div class="item-date">2018 - 2021</div>
            <ul class="item-description">
                <li>Developed full-stack web applications using React and Node.js</li>
                <li>Implemented CI/CD pipeline reducing deployment time by 60%</li>
                <li>Collaborated with product team to deliver 15+ features</li>
            </ul>
        </div>
        
        <h2>Education</h2>
        <div class="education-item">
            <div class="item-title">Bachelor of Science in Computer Science</div>
            <div class="item-institution">University of Technology</div>
            <div class="item-date">2014 - 2018</div>
            <div class="item-description">GPA: 3.6/4.0 • Relevant coursework: Data Structures, Algorithms, Database Design</div>
        </div>
        
        <h2>Certifications</h2>
        <ul class="item-description">
            <li>AWS Certified Developer - Associate</li>
            <li>Google Professional Cloud Developer</li>
        </ul>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
        <div style="font-size: 11px; color: #999; text-align: center;">
            Generated by RvisionAI • ${new Date().toLocaleDateString()}
        </div>
    </div>
</body>
</html>`;
}

/* -------------------- PDF GENERATION WITH @sparticuz/chromium (FIXED FOR RENDER) -------------------- */

async function generatePdfFromHtml(html) {
    let browser = null;
    
    try {
        console.log("📄 Generating PDF with @sparticuz/chromium...");
        
        // Launch browser with serverless-optimized settings
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });
        
        const page = await browser.newPage();
        
        // Set viewport for consistent rendering
        await page.setViewport({
            width: 1200,
            height: 1600
        });
        
        // ✅ FIXED: Use 'networkidle0' instead of 'networkidle'
        await page.setContent(html, {
            waitUntil: 'networkidle0',  // ← CORRECT VALUE
            timeout: 30000
        });
        
        // Generate PDF with professional settings
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '15mm',
                bottom: '15mm',
                left: '12mm',
                right: '12mm'
            },
            preferCSSPageSize: false,
            displayHeaderFooter: false
        });
        
        console.log(`✅ PDF generated successfully (${(pdf.length / 1024).toFixed(2)} KB)`);
        return pdf;
        
    } catch (err) {
        console.error("❌ PDF generation failed:", err.message);
        
        // Create a simple text fallback (no browser needed)
        const textFallback = `PDF Generation Error\n\n${err.message}\n\nPlease try again later.`;
        return Buffer.from(textFallback);
        
    } finally {
        if (browser) {
            await browser.close();
            console.log("🔒 Browser closed");
        }
    }
}

/* -------------------- MAIN EXPORT FUNCTION -------------------- */

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    console.log("\n📄 Starting Resume PDF Generation...");
    
    try {
        // Generate HTML first
        const html = await generateResumeHtml({ resume, selfDescription, jobDescription });
        
        if (!html || html.length < 200) {
            throw new Error("Generated HTML is too short or invalid");
        }
        
        // Convert HTML to PDF
        const pdf = await generatePdfFromHtml(html);
        
        return pdf;
        
    } catch (err) {
        console.error("❌ Resume PDF generation failed:", err.message);
        
        // Ultimate fallback - return error as text buffer
        const errorText = `Resume Generation Failed\n\nError: ${err.message}\n\nPlease try again later.`;
        return Buffer.from(errorText);
    }
}

/* -------------------- EXPORTS -------------------- */

module.exports = {
    generateInterviewReport,
    generateResumePdf
};
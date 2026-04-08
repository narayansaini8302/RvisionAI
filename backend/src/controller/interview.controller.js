const pdfParse = require("pdf-parse");
const { generateInterviewReport, generateResumePdf } = require("../services/ai.services");
const interviewReportModel = require("../models/interviewReportModel");

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    try {
        // Validate input
        if (!req.file) {
            return res.status(400).json({
                message: "Resume file is required"
            });
        }

        if (!req.body.jobDescription) {
            return res.status(400).json({
                message: "Job description is required"
            });
        }

        console.log("Parsing PDF...");
        
        // Parse PDF resume
        const pdfData = await pdfParse(req.file.buffer);
        const resumeContent = pdfData.text;
        
        console.log("PDF parsed successfully. Content length:", resumeContent.length);
        
        const { selfDescription = "", jobDescription } = req.body;

        console.log("Generating AI interview report...");
        
        // Generate interview report - this will throw error if AI fails
        const aiReport = await generateInterviewReport({
            resume: resumeContent.substring(0, 5000),
            selfDescription: selfDescription.substring(0, 1000),
            jobDescription: jobDescription.substring(0, 3000)
        });

        console.log("\n✅ AI Report Generated Successfully!");
        console.log(`   Technical Questions: ${aiReport.technicalQuestions.length}`);
        console.log(`   Behavioral Questions: ${aiReport.behavioralQuestions.length}`);
        console.log(`   Skill Gaps: ${aiReport.skillGaps.length}`);
        console.log(`   Preparation Days: ${aiReport.preparationPlan.length}`);

        // Save to database using AI response directly - NO FALLBACKS
        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent,
            selfDescription,
            jobDescription,
            matchScore: aiReport.matchScore,
            title: aiReport.title,
            technicalQuestions: aiReport.technicalQuestions,
            behavioralQuestions: aiReport.behavioralQuestions,
            skillGaps: aiReport.skillGaps,
            preparationPlan: aiReport.preparationPlan
        });

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        });
        
    } catch (error) {
        console.error("Controller Error:", error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                message: "Validation failed",
                errors: errors
            });
        }
        
        res.status(500).json({
            message: "Failed to generate interview report",
            error: error.message
        });
    }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params;

        const interviewReport = await interviewReportModel.findOne({ 
            _id: interviewId, 
            user: req.user.id 
        });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        });
    } catch (error) {
        console.error("Error fetching report:", error);
        res.status(500).json({
            message: "Failed to fetch interview report",
            error: error.message
        });
    }
}

/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel.find({ 
            user: req.user.id 
        }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan");

        res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        });
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({
            message: "Failed to fetch interview reports",
            error: error.message
        });
    }
}

/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params;

        const interviewReport = await interviewReportModel.findById(interviewReportId);

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        const { resume, jobDescription, selfDescription } = interviewReport;

        const pdfBuffer = await generateResumePdf({ 
            resume: resume.substring(0, 3000), 
            jobDescription, 
            selfDescription 
        });

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
            "Content-Length": pdfBuffer.length
        });

        res.send(pdfBuffer);
    } catch (error) {
        console.error("PDF Generation Error:", error);
        res.status(500).json({
            message: "Failed to generate resume PDF",
            error: error.message
        });
    }
}

module.exports = { 
    generateInterViewReportController, 
    getInterviewReportByIdController, 
    getAllInterviewReportsController, 
    generateResumePdfController 
};
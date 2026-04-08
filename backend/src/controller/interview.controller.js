const pdfParse = require("pdf-parse");
const { generateInterviewReport, generateResumePdf } = require("../services/ai.services");
const interviewReportModel = require("../models/interviewReportModel");

/**
 * Generate Interview Report
 */
async function generateInterViewReportController(req, res) {
    try {
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

        console.log("📄 Parsing PDF...");

        const pdfData = await pdfParse(req.file.buffer);
        const resumeContent = pdfData.text;

        console.log("✅ PDF parsed. Length:", resumeContent.length);

        const { selfDescription = "", jobDescription } = req.body;

        console.log("🤖 Generating AI report...");

        const aiReport = await generateInterviewReport({
            resume: resumeContent.substring(0, 5000),
            selfDescription: selfDescription.substring(0, 1000),
            jobDescription: jobDescription.substring(0, 3000)
        });

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
        console.error("❌ Controller Error:", error);

        res.status(500).json({
            message: "Failed to generate interview report",
            error: error.message
        });
    }
}

/**
 * Get Interview Report by ID
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
        console.error("❌ Fetch Error:", error);

        res.status(500).json({
            message: "Failed to fetch interview report",
            error: error.message
        });
    }
}

/**
 * Get All Interview Reports
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel.find({
            user: req.user.id
        })
        .sort({ createdAt: -1 })
        .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan");

        res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        });

    } catch (error) {
        console.error("❌ Fetch All Error:", error);

        res.status(500).json({
            message: "Failed to fetch interview reports",
            error: error.message
        });
    }
}

/**
 * Generate Resume PDF (🔥 FIXED VERSION)
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params;

        console.log("📄 PDF API HIT");
        console.log("ID:", interviewReportId);

        const interviewReport = await interviewReportModel.findById(interviewReportId);

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        const { resume, jobDescription, selfDescription } = interviewReport;

        console.log("Resume exists:", !!resume);
        console.log("Resume length:", resume?.length);

        // ✅ Safe handling (NO crash)
        const safeResume = String(resume || "").slice(0, 3000);

        let pdfBuffer;

        try {
            pdfBuffer = await generateResumePdf({
                resume: safeResume,
                jobDescription: jobDescription || "",
                selfDescription: selfDescription || ""
            });
        } catch (err) {
            console.error("❌ AI PDF failed:", err.message);

            // ✅ fallback PDF (no crash)
            pdfBuffer = Buffer.from("PDF generation failed. Please try again.");
        }

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
            "Content-Length": pdfBuffer.length
        });

        res.send(pdfBuffer);

    } catch (error) {
        console.error("❌ PDF Generation Error:", error);

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
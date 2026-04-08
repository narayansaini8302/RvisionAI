import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router'
import Loading from '../../auth/components/Loading.jsx'
import Navbar from '../../auth/components/Navbar.jsx'
import { 
    FaFileAlt, 
    FaUser, 
    FaBriefcase, 
    FaRocket, 
    FaStar,
    FaCheckCircle,
    FaArrowRight,
    FaUpload,
    FaFilePdf,
    FaFileWord,
    FaTimes
} from 'react-icons/fa'

const InterviewHome = () => {
    const { loading, generateReport, reports } = useInterview()
    const [ jobDescription, setJobDescription ] = useState("")
    const [ selfDescription, setSelfDescription ] = useState("")
    const [ dragActive, setDragActive ] = useState(false)
    const [ selectedFile, setSelectedFile ] = useState(null) // Add state for file
    const resumeInputRef = useRef()
    const navigate = useNavigate()

    const handleGenerateReport = async () => {
        // Pass the file from state instead of ref
        const data = await generateReport({ 
            jobDescription, 
            selfDescription, 
            resumeFile: selectedFile 
        })
        navigate(`/interview/${data._id}`)
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            // Validate file type
            if (file.type !== 'application/pdf') {
                alert('Please upload a PDF file')
                return
            }
            // Validate file size (3MB)
            if (file.size > 3 * 1024 * 1024) {
                alert('File size should be less than 3MB')
                return
            }
            setSelectedFile(file)
        }
    }

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        
        const file = e.dataTransfer.files[0]
        if (file) {
            // Validate file type
            if (file.type !== 'application/pdf') {
                alert('Please upload a PDF file')
                return
            }
            // Validate file size (3MB)
            if (file.size > 3 * 1024 * 1024) {
                alert('File size should be less than 3MB')
                return
            }
            setSelectedFile(file)
            
            // Also update the input element's files for form submission compatibility
            if (resumeInputRef.current) {
                const dataTransfer = new DataTransfer()
                dataTransfer.items.add(file)
                resumeInputRef.current.files = dataTransfer.files
            }
        }
    }

    const handleRemoveFile = (e) => {
        e.stopPropagation()
        setSelectedFile(null)
        if (resumeInputRef.current) {
            resumeInputRef.current.value = ''
        }
    }

    const charCount = jobDescription.length

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    }

    const headerVariants = {
        hidden: { opacity: 0, y: -30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    }

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5, ease: "easeOut", delay: 0.2 }
        }
    }

    const panelVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    }

    const rightPanelVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.5, ease: "easeOut", delay: 0.1 }
        }
    }

    const reportCardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4 }
        },
        hover: {
            y: -8,
            scale: 1.02,
            transition: { type: "spring", stiffness: 400, damping: 10 }
        }
    }

    const buttonVariants = {
        hover: {
            scale: 1.05,
            transition: { type: "spring", stiffness: 400, damping: 10 }
        },
        tap: { scale: 0.95 }
    }

    const dragAreaVariants = {
        hover: { scale: 1.02, transition: { duration: 0.2 } },
        dragActive: { scale: 1.05, backgroundColor: "rgba(113, 90, 90, 0.1)" }
    }

    if (loading) {
        return <Loading fullScreen/>
    }

    // Check if form is valid
    const isFormValid = jobDescription.trim() && (selectedFile || selfDescription.trim())

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="min-h-screen bg-gradient-to-br from-[#D3DAD9]/20 via-white to-[#D3DAD9]/30"
        >
            <Navbar/>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Page Header */}
                <motion.header variants={headerVariants} className="text-center mb-16">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#715A5A]/20 to-[#715A5A]/10 backdrop-blur-sm border border-[#715A5A]/30 mb-6"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                            <FaRocket className="w-4 h-4 text-[#715A5A]" />
                        </motion.div>
                        <span className="text-sm font-semibold text-[#715A5A]">AI-Powered Interview Preparation</span>
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-[#37353E]">Create Your Custom</span>
                        <br />
                        <motion.span 
                            initial={{ backgroundPosition: "0% 50%" }}
                            animate={{ backgroundPosition: "100% 50%" }}
                            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                            className="bg-gradient-to-r from-[#715A5A] to-[#9b7b7b] bg-clip-text text-transparent bg-[length:200%_auto]"
                        >
                            Interview Plan
                        </motion.span>
                    </h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg text-[#44444E] max-w-2xl mx-auto"
                    >
                        Let our advanced AI analyze job requirements and your unique profile to build a winning interview strategy.
                    </motion.p>
                </motion.header>

                {/* Main Card */}
                <motion.div 
                    variants={cardVariants}
                    whileHover={{ y: -5 }}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-[#715A5A]/20 mb-16 hover:shadow-3xl transition-all duration-500"
                >
                    <div className="flex flex-col lg:flex-row">
                        {/* Left Panel - Job Description */}
                        <motion.div 
                            variants={panelVariants}
                            className="flex-1 p-8 lg:p-10 bg-gradient-to-br from-white to-[#D3DAD9]/10"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <motion.div 
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="p-2 rounded-xl bg-gradient-to-r from-[#715A5A]/20 to-[#715A5A]/10"
                                >
                                    <FaBriefcase className="w-5 h-5 text-[#715A5A]" />
                                </motion.div>
                                <h2 className="text-xl font-bold text-[#37353E]">Target Job Description</h2>
                                <span className="text-xs bg-gradient-to-r from-red-500/20 to-red-500/10 text-red-600 px-3 py-1 rounded-full ml-auto font-semibold border border-red-500/20">
                                    Required
                                </span>
                            </div>
                            <motion.textarea
                                whileFocus={{ scale: 1.01 }}
                                transition={{ duration: 0.2 }}
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                className="w-full h-72 p-5 border-2 border-[#715A5A]/20 rounded-2xl bg-white/50 text-[#37353E] placeholder-[#44444E]/50 focus:outline-none focus:border-[#715A5A] focus:ring-4 focus:ring-[#715A5A]/20 transition-all duration-300 resize-none"
                                placeholder={`📝 Paste the full job description here...\n\nExample: Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...`}
                                maxLength={5000}
                            />
                            <div className="flex justify-between items-center mt-3">
                                <span className="text-sm text-[#44444E]/60 flex items-center gap-1">
                                    <FaStar className="w-3 h-3" />
                                    AI will analyze key requirements
                                </span>
                                <motion.span 
                                    animate={{ scale: charCount > 0 ? [1, 1.1, 1] : 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-sm font-medium text-[#44444E]/60"
                                >
                                    {charCount} / 5000 chars
                                </motion.span>
                            </div>
                        </motion.div>

                        {/* Vertical Divider - Hidden on mobile */}
                        <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-[#715A5A]/30 to-transparent"></div>

                        {/* Right Panel - Profile */}
                        <motion.div 
                            variants={rightPanelVariants}
                            className="flex-1 p-8 lg:p-10 bg-gradient-to-br from-[#D3DAD9]/10 to-white"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <motion.div 
                                    whileHover={{ scale: 1.1, rotate: -5 }}
                                    className="p-2 rounded-xl bg-gradient-to-r from-[#715A5A]/20 to-[#715A5A]/10"
                                >
                                    <FaUser className="w-5 h-5 text-[#715A5A]" />
                                </motion.div>
                                <h2 className="text-xl font-bold text-[#37353E]">Your Profile</h2>
                            </div>

                            {/* Upload Resume */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-[#37353E] mb-3">
                                    Upload Resume
                                    <span className="ml-2 text-xs bg-gradient-to-r from-[#715A5A]/20 to-[#715A5A]/10 text-[#715A5A] px-3 py-1 rounded-full font-medium">
                                        Recommended
                                    </span>
                                </label>
                                <motion.label
                                    htmlFor='resume'
                                    variants={dragAreaVariants}
                                    whileHover="hover"
                                    animate={dragActive ? "dragActive" : "idle"}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
                                        dragActive 
                                            ? 'border-[#715A5A] bg-[#715A5A]/10 scale-105' 
                                            : selectedFile
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-[#715A5A]/30 bg-[#D3DAD9]/20 hover:border-[#715A5A] hover:bg-[#715A5A]/5'
                                    }`}
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <motion.div 
                                            animate={dragActive ? { scale: 1.2, rotate: 10 } : { scale: 1 }}
                                            className={`p-3 rounded-full mb-3 transition-all duration-300 ${
                                                dragActive ? 'bg-[#715A5A]' : selectedFile ? 'bg-green-500' : 'bg-[#715A5A]/20'
                                            }`}
                                        >
                                            {dragActive ? (
                                                <FaUpload className="w-8 h-8 text-white" />
                                            ) : selectedFile ? (
                                                <FaCheckCircle className="w-8 h-8 text-white" />
                                            ) : (
                                                <FaFileAlt className="w-8 h-8 text-[#715A5A]" />
                                            )}
                                        </motion.div>
                                        <p className="text-[#37353E] font-medium mb-1">
                                            {dragActive ? "Drop your resume here" : selectedFile ? "Resume uploaded successfully!" : "Click to upload or drag & drop"}
                                        </p>
                                        <p className="text-[#44444E]/60 text-xs">
                                            {selectedFile ? selectedFile.name : "PDF (Max 3MB)"}
                                        </p>
                                    </div>
                                    <input 
                                        ref={resumeInputRef} 
                                        hidden 
                                        type='file' 
                                        id='resume' 
                                        name='resume' 
                                        accept='.pdf,application/pdf' 
                                        onChange={handleFileChange}
                                    />
                                </motion.label>
                                
                                {/* File Preview with Remove Button */}
                                <AnimatePresence>
                                    {selectedFile && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 flex items-center gap-3"
                                        >
                                            <FaFilePdf className="w-5 h-5 text-red-500" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-[#37353E] truncate font-medium">
                                                    {selectedFile.name}
                                                </p>
                                                <p className="text-xs text-[#44444E]/60">
                                                    {(selectedFile.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={handleRemoveFile}
                                                className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                                            >
                                                <FaTimes className="w-4 h-4 text-red-500" />
                                            </motion.button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* OR Divider */}
                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-[#715A5A]/20"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-[#44444E]/60 font-medium">OR</span>
                                </div>
                            </div>

                            {/* Quick Self-Description */}
                            <div className="mb-6">
                                <label htmlFor='selfDescription' className="block text-sm font-semibold text-[#37353E] mb-3">
                                    Quick Self-Description
                                </label>
                                <motion.textarea
                                    whileFocus={{ scale: 1.01 }}
                                    transition={{ duration: 0.2 }}
                                    value={selfDescription}
                                    onChange={(e) => setSelfDescription(e.target.value)}
                                    id='selfDescription'
                                    name='selfDescription'
                                    rows="4"
                                    className="w-full p-4 border-2 border-[#715A5A]/20 rounded-2xl bg-white/50 text-[#37353E] placeholder-[#44444E]/50 focus:outline-none focus:border-[#715A5A] focus:ring-4 focus:ring-[#715A5A]/20 transition-all duration-300 resize-none"
                                    placeholder="✨ Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                                />
                            </div>

                            {/* Info Box */}
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="flex items-start gap-4 p-4 bg-gradient-to-r from-[#715A5A]/10 to-[#715A5A]/5 rounded-2xl border border-[#715A5A]/20"
                            >
                                <motion.div 
                                    whileHover={{ scale: 1.1, rotate: 360 }}
                                    transition={{ duration: 0.5 }}
                                    className="p-2 rounded-lg bg-[#715A5A]/20"
                                >
                                    <FaStar className="w-4 h-4 text-[#715A5A]" />
                                </motion.div>
                                <div className="flex-1">
                                    <p className="text-sm text-[#44444E] leading-relaxed">
                                        <strong className="text-[#37353E]">Pro Tip:</strong> Either a <strong className="text-[#715A5A]">Resume</strong> or a <strong className="text-[#715A5A]">Self Description</strong> is required. For best results, upload your resume and let our AI analyze your complete profile!
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Card Footer */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 bg-gradient-to-r from-[#D3DAD9]/30 to-white border-t border-[#715A5A]/20"
                    >
                        <div className="flex items-center gap-2 text-sm text-[#44444E]/70">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="flex -space-x-2"
                            >
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#715A5A] to-[#5a4848] flex items-center justify-center text-white text-xs">AI</div>
                            </motion.div>
                            <span>AI-Powered Strategy Generation • ~30 seconds</span>
                        </div>
                        <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={handleGenerateReport}
                            disabled={!isFormValid}
                            className={`group relative px-8 py-3 bg-gradient-to-r from-[#715A5A] to-[#5a4848] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden ${
                                !isFormValid ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            <motion.div
                                animate={isFormValid ? { x: [-100, 100] } : {}}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                            />
                            <div className="flex items-center gap-2 relative z-10">
                                <motion.div
                                    animate={isFormValid ? { y: [0, -3, 0] } : {}}
                                    transition={{ duration: 1, repeat: Infinity }}
                                >
                                    <FaRocket className="w-4 h-4" />
                                </motion.div>
                                Generate My Interview Strategy
                                <motion.div
                                    animate={isFormValid ? { x: [0, 3, 0] } : {}}
                                    transition={{ duration: 1, repeat: Infinity }}
                                >
                                    <FaArrowRight className="w-4 h-4" />
                                </motion.div>
                            </div>
                        </motion.button>
                    </motion.div>
                </motion.div>

                {/* Recent Reports List - Rest of the code remains the same */}
                <AnimatePresence>
                    {reports && reports.length > 0 && (
                        <motion.section 
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mb-16"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl md:text-3xl font-bold text-[#37353E]">
                                    My Recent Interview Plans
                                </h2>
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: 80 }}
                                    transition={{ delay: 0.8, duration: 0.5 }}
                                    className="h-1 bg-gradient-to-r from-[#715A5A] to-transparent rounded-full"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {reports.map((report, index) => (
                                    <motion.div
                                        key={report._id}
                                        variants={reportCardVariants}
                                        initial="hidden"
                                        animate="visible"
                                        whileHover="hover"
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() => navigate(`/interview/${report._id}`)}
                                        className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 cursor-pointer border border-[#715A5A]/10 hover:border-[#715A5A]/30"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <motion.div 
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                className="p-2 rounded-xl bg-gradient-to-r from-[#715A5A]/20 to-[#715A5A]/10"
                                            >
                                                <FaBriefcase className="w-5 h-5 text-[#715A5A]" />
                                            </motion.div>
                                            <motion.div 
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.2 + index * 0.05 }}
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    report.matchScore >= 80 
                                                        ? 'bg-green-100 text-green-700 border border-green-200' 
                                                        : report.matchScore >= 60 
                                                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' 
                                                        : 'bg-red-100 text-red-700 border border-red-200'
                                                }`}
                                            >
                                                {report.matchScore}% Match
                                            </motion.div>
                                        </div>
                                        <h3 className="font-bold text-[#37353E] mb-2 truncate text-lg">
                                            {report.title || 'Untitled Position'}
                                        </h3>
                                        <p className="text-sm text-[#44444E]/60 mb-4">
                                            Generated on {new Date(report.createdAt).toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'short', 
                                                day: 'numeric' 
                                            })}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1 text-xs text-[#715A5A] font-medium">
                                                <span>View Details</span>
                                                <motion.div
                                                    animate={{ x: [0, 3, 0] }}
                                                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                                                >
                                                    <FaArrowRight className="w-3 h-3" />
                                                </motion.div>
                                            </div>
                                            <motion.div 
                                                whileHover={{ scale: 1.2, rotate: 360 }}
                                                transition={{ duration: 0.3 }}
                                                className="w-8 h-8 rounded-full bg-gradient-to-r from-[#715A5A]/20 to-[#715A5A]/10 flex items-center justify-center"
                                            >
                                                <FaStar className="w-3 h-3 text-[#715A5A]" />
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* Page Footer */}
                <motion.footer 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="border-t border-[#715A5A]/20 pt-8 text-center"
                >
                    <div className="flex justify-center gap-8 mb-4">
                        {['Privacy Policy', 'Terms of Service', 'Help Center'].map((text) => (
                            <motion.a
                                key={text}
                                href="#"
                                whileHover={{ scale: 1.05, color: "#715A5A" }}
                                className="text-[#44444E]/60 hover:text-[#715A5A] text-sm transition-colors font-medium"
                            >
                                {text}
                            </motion.a>
                        ))}
                    </div>
                    <motion.p 
                        whileHover={{ scale: 1.02 }}
                        className="text-[#44444E]/50 text-xs"
                    >
                        © 2024 RvisionAI. All rights reserved.
                    </motion.p>
                </motion.footer>
            </div>
        </motion.div>
    )
}

export default InterviewHome
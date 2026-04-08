import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate, useParams } from 'react-router'
import Loading from '../../auth/components/Loading.jsx'
import Navbar from '../../auth/components/Navbar.jsx'
import { 
    FaCode, 
    FaComments, 
    FaRoad, 
    FaDownload, 
    FaChevronDown,
    FaChevronUp,
    FaCheckCircle,
    FaLightbulb,
    FaStar,
    FaChartLine,
    FaExclamationTriangle,
    FaBars,
    FaTimes
} from 'react-icons/fa'

const NAV_ITEMS = [
    { id: 'technical', label: 'Technical Questions', icon: FaCode },
    { id: 'behavioral', label: 'Behavioral Questions', icon: FaComments },
    { id: 'roadmap', label: 'Road Map', icon: FaRoad },
]

const QuestionCard = ({ item, index }) => {
    const [open, setOpen] = useState(false)
    
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ y: -2 }}
            className="group bg-white rounded-xl border border-[#715A5A]/10 hover:border-[#715A5A]/30 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md"
        >
            <motion.div 
                className="flex items-start sm:items-center gap-3 p-4 cursor-pointer hover:bg-gradient-to-r hover:from-[#715A5A]/5 hover:to-transparent transition-all duration-300"
                onClick={() => setOpen(o => !o)}
                whileTap={{ scale: 0.99 }}
            >
                <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-r from-[#715A5A]/20 to-[#715A5A]/10 flex items-center justify-center"
                >
                    <span className="text-[#715A5A] font-bold text-xs">Q{index + 1}</span>
                </motion.div>
                <p className="flex-1 text-[#37353E] font-medium text-sm leading-relaxed line-clamp-2">
                    {item.question || item.text || 'Question not available'}
                </p>
                <motion.div 
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-[#715A5A] flex-shrink-0"
                >
                    <FaChevronDown size={12} />
                </motion.div>
            </motion.div>
            
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-4 pb-4 space-y-3"
                    >
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-r from-[#D3DAD9]/30 to-white rounded-lg p-3 border-l-4 border-[#715A5A]"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <FaLightbulb className="w-3 h-3 text-[#715A5A]" />
                                <span className="text-[10px] font-semibold text-[#715A5A] uppercase tracking-wider">
                                    Intention
                                </span>
                            </div>
                            <p className="text-[#44444E] text-xs leading-relaxed">
                                {item.intention || item.purpose || 'No intention provided'}
                            </p>
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-r from-[#D3DAD9]/20 to-white rounded-lg p-3"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <FaCheckCircle className="w-3 h-3 text-[#715A5A]" />
                                <span className="text-[10px] font-semibold text-[#715A5A] uppercase tracking-wider">
                                    Model Answer
                                </span>
                            </div>
                            <p className="text-[#44444E] text-xs leading-relaxed">
                                {item.answer || item.modelAnswer || item.sampleAnswer || 'No answer provided'}
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

const Interview = () => {
    const [activeNav, setActiveNav] = useState('technical')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { report, getReportById, loading, getResumePdf } = useInterview()
    const { interviewId } = useParams()

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        }
    }, [interviewId])

    if (loading || !report) {
        return <Loading fullScreen/>
    }

    const normalizeQuestions = (questions) => {
        if (!questions) return []
        
        if (Array.isArray(questions) && questions.length > 0 && questions[0].question) {
            return questions
        }
        
        if (Array.isArray(questions) && typeof questions[0] === 'string') {
            return questions.map((q, i) => ({
                question: q,
                intention: `Intention for question ${i + 1}`,
                answer: `Model answer for: ${q}`
            }))
        }
        
        const normalized = []
        if (typeof questions === 'object') {
            const questionKeys = Object.keys(questions).filter(key => key.includes('question') || key.includes('Question'))
            questionKeys.forEach(key => {
                const index = key.match(/\d+/)?.[0]
                if (index) {
                    normalized.push({
                        question: questions[key],
                        intention: questions[`intention${index}`] || questions[`Intention${index}`] || 'No intention provided',
                        answer: questions[`answer${index}`] || questions[`Answer${index}`] || 'No answer provided'
                    })
                }
            })
        }
        
        return normalized.length > 0 ? normalized : []
    }

    const getCurrentQuestions = () => {
        if (activeNav === 'technical') {
            return normalizeQuestions(report.technicalQuestions || report.technical || [])
        } else if (activeNav === 'behavioral') {
            return normalizeQuestions(report.behavioralQuestions || report.behavioral || [])
        }
        return []
    }

    const currentQuestions = getCurrentQuestions()
    const scoreColor = report.matchScore >= 80 ? 'text-green-600' : report.matchScore >= 60 ? 'text-yellow-600' : 'text-red-600'
    const scoreBgColor = report.matchScore >= 80 ? 'bg-green-50' : report.matchScore >= 60 ? 'bg-yellow-50' : 'bg-red-50'

    const skillGaps = Array.isArray(report.skillGaps) 
        ? report.skillGaps 
        : report.skillGaps?.map ? report.skillGaps : 
          report.gaps ? report.gaps : 
          report.missingSkills ? report.missingSkills : []

    // Animation variants
    const pageVariants = {
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
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    }

    const sidebarVariants = {
        hidden: { opacity: 0, x: -30 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    }

    const contentVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut", delay: 0.2 }
        }
    }

    const rightSidebarVariants = {
        hidden: { opacity: 0, x: 30 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.5, ease: "easeOut", delay: 0.3 }
        }
    }

    const mobileMenuVariants = {
        hidden: { opacity: 0, y: -20, height: 0 },
        visible: {
            opacity: 1,
            y: 0,
            height: "auto",
            transition: { duration: 0.3, ease: "easeOut" }
        },
        exit: {
            opacity: 0,
            y: -20,
            height: 0,
            transition: { duration: 0.2, ease: "easeIn" }
        }
    }

    const mobileMenuItemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.3 }
        }
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={pageVariants}
            className="min-h-screen bg-gradient-to-br from-[#D3DAD9]/20 via-white to-[#D3DAD9]/30"
        >
            <Navbar/>
            
            {/* Mobile Header with Navigation Toggle */}
            <motion.div 
                variants={itemVariants}
                className="lg:hidden sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-[#715A5A]/20 px-4 py-3"
            >
                <div className="flex items-center justify-between">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-[#715A5A]/10 to-transparent"
                    >
                        {mobileMenuOpen ? (
                            <FaTimes className="w-4 h-4 text-[#715A5A]" />
                        ) : (
                            <FaBars className="w-4 h-4 text-[#715A5A]" />
                        )}
                        <span className="text-sm font-semibold text-[#715A5A]">
                            {NAV_ITEMS.find(item => item.id === activeNav)?.label}
                        </span>
                    </motion.button>
                    
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => getResumePdf && getResumePdf(interviewId)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-[#715A5A] to-[#5a4848] text-white text-sm font-semibold"
                    >
                        <FaDownload className="w-3 h-3" />
                        <span>Resume</span>
                    </motion.button>
                </div>
                
                {/* Mobile Navigation Menu with AnimatePresence */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            variants={mobileMenuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="absolute top-full left-0 right-0 bg-white shadow-xl border-b border-[#715A5A]/20 mt-2 py-2 z-50"
                        >
                            {NAV_ITEMS.map((item, idx) => {
                                const Icon = item.icon
                                return (
                                    <motion.button
                                        key={item.id}
                                        variants={mobileMenuItemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => {
                                            setActiveNav(item.id)
                                            setMobileMenuOpen(false)
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
                                            activeNav === item.id 
                                                ? 'bg-gradient-to-r from-[#715A5A]/20 to-transparent text-[#715A5A] border-l-4 border-[#715A5A]' 
                                                : 'text-[#44444E] hover:bg-[#D3DAD9]/30'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </motion.button>
                                )
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
                {/* Desktop Layout - 3 columns */}
                <div className="hidden lg:grid lg:grid-cols-[280px_1fr_300px] gap-6">
                    
                    {/* Left Nav - Desktop */}
                    <motion.nav 
                        variants={sidebarVariants}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[#715A5A]/20 p-5 h-fit sticky top-24"
                    >
                        <div className="space-y-5">
                            <div className="pb-3 border-b border-[#715A5A]/20">
                                <p className="text-xs font-bold text-[#715A5A] uppercase tracking-wider">Sections</p>
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: 48 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                    className="h-1 bg-gradient-to-r from-[#715A5A] to-[#9b7b7b] rounded-full mt-1"
                                />
                            </div>
                            <div className="space-y-1">
                                {NAV_ITEMS.map((item, idx) => {
                                    const Icon = item.icon
                                    return (
                                        <motion.button
                                            key={item.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            whileHover={{ scale: 1.02, x: 5 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                                                activeNav === item.id 
                                                    ? 'bg-gradient-to-r from-[#715A5A] to-[#5a4848] text-white shadow-md' 
                                                    : 'text-[#44444E] hover:bg-gradient-to-r hover:from-[#715A5A]/10 hover:to-transparent hover:text-[#715A5A]'
                                            }`}
                                            onClick={() => setActiveNav(item.id)}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </motion.button>
                                    )
                                })}
                            </div>
                        </div>
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-6 pt-5 border-t border-[#715A5A]/20"
                        >
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => getResumePdf && getResumePdf(interviewId)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#715A5A] to-[#5a4848] text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg"
                            >
                                <FaDownload className="w-3 h-3" />
                                <span className="text-sm">Download Resume</span>
                            </motion.button>
                        </motion.div>
                    </motion.nav>

                    {/* Center Content - Desktop */}
                    <motion.main 
                        variants={contentVariants}
                        className="space-y-6"
                    >
                        {(activeNav === 'technical' || activeNav === 'behavioral') && (
                            <section>
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-between mb-5 flex-wrap gap-3"
                                >
                                    <div>
                                        <h2 className="text-2xl font-bold text-[#37353E]">
                                            {activeNav === 'technical' ? 'Technical Questions' : 'Behavioral Questions'}
                                        </h2>
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: 64 }}
                                            transition={{ delay: 0.2, duration: 0.5 }}
                                            className="h-1 bg-gradient-to-r from-[#715A5A] to-[#9b7b7b] rounded-full mt-1"
                                        />
                                    </div>
                                    <motion.div 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.3, type: "spring" }}
                                        className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#715A5A]/20 to-[#715A5A]/10 border border-[#715A5A]/30"
                                    >
                                        <span className="text-xs font-semibold text-[#715A5A]">
                                            {currentQuestions.length} questions
                                        </span>
                                    </motion.div>
                                </motion.div>
                                
                                {currentQuestions.length > 0 ? (
                                    <div className="space-y-3">
                                        {currentQuestions.map((q, i) => (
                                            <QuestionCard key={i} item={q} index={i} />
                                        ))}
                                    </div>
                                ) : (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#715A5A]/20 p-8 text-center"
                                    >
                                        <FaCode className="w-10 h-10 text-[#715A5A]/40 mx-auto mb-3" />
                                        <p className="text-[#44444E] text-sm">No questions available for this section.</p>
                                    </motion.div>
                                )}
                            </section>
                        )}

                        {activeNav === 'roadmap' && (
                            <section>
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-between mb-5 flex-wrap gap-3"
                                >
                                    <div>
                                        <h2 className="text-2xl font-bold text-[#37353E]">Preparation Road Map</h2>
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: 64 }}
                                            transition={{ delay: 0.2, duration: 0.5 }}
                                            className="h-1 bg-gradient-to-r from-[#715A5A] to-[#9b7b7b] rounded-full mt-1"
                                        />
                                    </div>
                                    <motion.div 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.3, type: "spring" }}
                                        className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#715A5A]/20 to-[#715A5A]/10 border border-[#715A5A]/30"
                                    >
                                        <span className="text-xs font-semibold text-[#715A5A]">
                                            {report.preparationPlan?.length || 0}-day plan
                                        </span>
                                    </motion.div>
                                </motion.div>
                                <div className="space-y-3">
                                    {report.preparationPlan?.map((day, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            whileHover={{ y: -2 }}
                                            className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#715A5A]/20 p-4 hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <motion.div 
                                                    whileHover={{ scale: 1.1 }}
                                                    className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-r from-[#715A5A] to-[#5a4848] flex items-center justify-center"
                                                >
                                                    <span className="text-white font-bold text-sm">{day.day || idx + 1}</span>
                                                </motion.div>
                                                <h3 className="text-base font-bold text-[#37353E]">{day.focus || day.title || 'Day ' + (idx + 1)}</h3>
                                            </div>
                                            <ul className="space-y-2 ml-2">
                                                {(day.tasks || day.items || []).map((task, i) => (
                                                    <motion.li 
                                                        key={i}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.05 + i * 0.03 }}
                                                        className="flex items-start gap-2 text-[#44444E] text-sm"
                                                    >
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#715A5A] mt-1.5 flex-shrink-0"></div>
                                                        <span className="leading-relaxed">{task}</span>
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </motion.main>

                    {/* Right Sidebar - Desktop */}
                    <motion.aside 
                        variants={rightSidebarVariants}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[#715A5A]/20 p-5 h-fit sticky top-24 space-y-5"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.4, type: "spring" }}
                            className="text-center"
                        >
                            <p className="text-xs font-bold text-[#715A5A] uppercase tracking-wider mb-3">Match Score</p>
                            <div className="relative inline-flex items-center justify-center">
                                <svg className="w-28 h-28 transform -rotate-90">
                                    <circle
                                        className="text-[#D3DAD9]"
                                        strokeWidth="8"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="48"
                                        cx="56"
                                        cy="56"
                                    />
                                    <motion.circle
                                        initial={{ strokeDasharray: "0 302" }}
                                        animate={{ strokeDasharray: `${(report.matchScore / 100) * 302} 302` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className={scoreColor}
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="48"
                                        cx="56"
                                        cy="56"
                                    />
                                </svg>
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.6, type: "spring" }}
                                    className="absolute inset-0 flex flex-col items-center justify-center"
                                >
                                    <span className={`text-2xl font-bold ${scoreColor}`}>{report.matchScore}</span>
                                    <span className={`text-xs font-medium ${scoreColor}`}>%</span>
                                </motion.div>
                            </div>
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                className={`mt-3 px-3 py-1.5 rounded-lg ${scoreBgColor} border border-current/20`}
                            >
                                <p className={`text-xs font-medium ${scoreColor}`}>
                                    {report.matchScore >= 80 ? 'Excellent match' : 
                                     report.matchScore >= 60 ? 'Good match' : 
                                     'Needs improvement'}
                                </p>
                            </motion.div>
                        </motion.div>

                        <div className="border-t border-[#715A5A]/20"></div>

                        {skillGaps.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <FaExclamationTriangle className="w-3 h-3 text-[#715A5A]" />
                                    <p className="text-xs font-bold text-[#715A5A] uppercase tracking-wider">Skill Gaps</p>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {skillGaps.slice(0, 5).map((gap, i) => (
                                        <motion.span
                                            key={i}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.9 + i * 0.05 }}
                                            whileHover={{ scale: 1.05 }}
                                            className="inline-block px-2 py-1 rounded-lg text-[10px] font-medium bg-red-50 text-red-700 border border-red-200 cursor-pointer"
                                        >
                                            {gap.skill || gap.name || gap}
                                        </motion.span>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </motion.aside>
                </div>

                {/* Mobile Layout - Single Column */}
                <div className="lg:hidden space-y-5">
                    {/* Main Content */}
                    <main className="space-y-5">
                        {(activeNav === 'technical' || activeNav === 'behavioral') && (
                            <motion.section
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="mb-4">
                                    <h2 className="text-xl font-bold text-[#37353E]">
                                        {activeNav === 'technical' ? 'Technical Questions' : 'Behavioral Questions'}
                                    </h2>
                                    <div className="h-0.5 w-12 bg-gradient-to-r from-[#715A5A] to-[#9b7b7b] rounded-full mt-1"></div>
                                </div>
                                
                                {currentQuestions.length > 0 ? (
                                    <div className="space-y-3">
                                        {currentQuestions.map((q, i) => (
                                            <QuestionCard key={i} item={q} index={i} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#715A5A]/20 p-6 text-center">
                                        <p className="text-[#44444E] text-sm">No questions available.</p>
                                    </div>
                                )}
                            </motion.section>
                        )}

                        {activeNav === 'roadmap' && (
                            <motion.section
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="mb-4">
                                    <h2 className="text-xl font-bold text-[#37353E]">Preparation Road Map</h2>
                                    <div className="h-0.5 w-12 bg-gradient-to-r from-[#715A5A] to-[#9b7b7b] rounded-full mt-1"></div>
                                </div>
                                <div className="space-y-3">
                                    {report.preparationPlan?.slice(0, 5).map((day, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#715A5A]/20 p-4"
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-r from-[#715A5A] to-[#5a4848] flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">{day.day || idx + 1}</span>
                                                </div>
                                                <h3 className="text-sm font-bold text-[#37353E] flex-1">{day.focus || day.title || 'Day ' + (idx + 1)}</h3>
                                            </div>
                                            <ul className="space-y-2 ml-2">
                                                {(day.tasks || day.items || []).slice(0, 3).map((task, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-[#44444E] text-xs">
                                                        <div className="w-1 h-1 rounded-full bg-[#715A5A] mt-1.5 flex-shrink-0"></div>
                                                        <span className="leading-relaxed">{task}</span>
                                                    </li>
                                                ))}
                                                {(day.tasks || day.items || []).length > 3 && (
                                                    <li className="text-xs text-[#715A5A] font-medium ml-3">
                                                        +{(day.tasks || day.items || []).length - 3} more tasks
                                                    </li>
                                                )}
                                            </ul>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.section>
                        )}
                    </main>

                    {/* Mobile Stats Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#715A5A]/20 p-4 mt-5"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-[#715A5A] uppercase tracking-wider">Match Score</p>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className={`text-2xl font-bold ${scoreColor}`}>{report.matchScore}</span>
                                    <span className={`text-sm font-medium ${scoreColor}`}>%</span>
                                </div>
                            </div>
                            <div className={`px-3 py-1.5 rounded-lg ${scoreBgColor} border border-current/20`}>
                                <p className={`text-xs font-medium ${scoreColor}`}>
                                    {report.matchScore >= 80 ? 'Excellent' : 
                                     report.matchScore >= 60 ? 'Good' : 
                                     'Needs work'}
                                </p>
                            </div>
                        </div>
                        
                        {skillGaps.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-[#715A5A]/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <FaExclamationTriangle className="w-3 h-3 text-[#715A5A]" />
                                    <p className="text-xs font-bold text-[#715A5A] uppercase tracking-wider">Skill Gaps</p>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {skillGaps.slice(0, 4).map((gap, i) => (
                                        <span key={i} className="inline-block px-2 py-1 rounded-lg text-[10px] font-medium bg-red-50 text-red-700 border border-red-200">
                                            {gap.skill || gap.name || gap}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            <style jsx>{`
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </motion.div>
    )
}

export default Interview
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { 
    FaArrowRight, 
    FaRobot, 
    FaFileAlt, 
    FaQuestionCircle, 
    FaChartLine, 
    FaClipboardList,
    FaCheckCircle,
    FaStar,
    FaBrain,
    FaRocket,
    FaShieldAlt
} from 'react-icons/fa';

const Hero = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { scrollY } = useScroll();
    
    // Parallax effects
    const y1 = useTransform(scrollY, [0, 500], [0, 100]);
    const y2 = useTransform(scrollY, [0, 500], [0, -50]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);

    const handleGenerateResume = () => {
        if (!user) {
            const event = new CustomEvent('openLoginModal');
            window.dispatchEvent(event);
        } else {
            navigate('/resume-builder');
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const fadeInUpVariants = {
        hidden: { opacity: 0, y: 60 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const scaleInVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    const badgeVariants = {
        hidden: { opacity: 0, y: -20, scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        },
        hover: {
            scale: 1.05,
            transition: { duration: 0.3 }
        }
    };

    const statVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.4 }
        },
        hover: {
            scale: 1.1,
            transition: { duration: 0.2 }
        }
    };

    const buttonVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        },
        hover: {
            scale: 1.05,
            y: -5,
            transition: { type: "spring", stiffness: 400, damping: 10 }
        },
        tap: { scale: 0.95 }
    };

    const floatingOrbVariants = {
        animate: {
            y: [0, -20, 0],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const rotatingCircleVariants = {
        animate: {
            rotate: 360,
            transition: {
                duration: 20,
                repeat: Infinity,
                ease: "linear"
            }
        }
    };

    const companyVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4 }
        },
        hover: {
            scale: 1.1,
            transition: { duration: 0.2 }
        }
    };

    return (
        <section className="relative overflow-hidden min-h-screen flex items-center">
            {/* Modern Gradient Background */}
            <motion.div 
                style={{ opacity }}
                className="absolute inset-0 bg-gradient-to-br from-[#D3DAD9]/30 via-white to-[#D3DAD9]/20" 
            />
            
            {/* Animated Grid Pattern */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ duration: 1 }}
                className="absolute inset-0"
            >
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, #715A5A 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }} />
            </motion.div>
            
            {/* Floating Gradient Orbs with Animation */}
            <motion.div
                variants={floatingOrbVariants}
                animate="animate"
                style={{ y: y1 }}
                className="absolute top-20 left-10 w-96 h-96 bg-[#715A5A]/20 rounded-full blur-3xl"
            />
            <motion.div
                variants={floatingOrbVariants}
                animate="animate"
                style={{ y: y2 }}
                transition={{ delay: 1 }}
                className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-[#715A5A]/10 rounded-full blur-3xl"
            />
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#44444E]/5 rounded-full blur-3xl"
            />
            
            {/* Animated Circles */}
            <motion.div
                variants={rotatingCircleVariants}
                animate="animate"
                className="absolute top-40 right-20 w-20 h-20 border-2 border-[#715A5A]/20 rounded-full"
            />
            <motion.div
                variants={rotatingCircleVariants}
                animate="animate"
                transition={{ duration: 25, ease: "linear" }}
                className="absolute bottom-40 left-20 w-32 h-32 border-2 border-[#715A5A]/10 rounded-full"
            />
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-center max-w-5xl mx-auto"
                >
                    {/* Animated Badge */}
                    <motion.div
                        variants={badgeVariants}
                        whileHover="hover"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#715A5A]/20 to-[#715A5A]/10 backdrop-blur-sm border border-[#715A5A]/30 mb-8"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                            <FaRobot className="w-4 h-4 text-[#715A5A]" />
                        </motion.div>
                        <span className="text-sm font-semibold bg-gradient-to-r from-[#37353E] to-[#715A5A] bg-clip-text text-transparent">
                            AI-Powered Resume Intelligence
                        </span>
                        <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="relative flex h-2 w-2"
                        >
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#715A5A] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#715A5A]"></span>
                        </motion.span>
                    </motion.div>
                    
                    {/* Main Heading with Gradient */}
                    <motion.h1 
                        variants={fadeInUpVariants}
                        className="text-5xl md:text-6xl lg:text-8xl font-bold mb-6 leading-tight"
                    >
                        <span className="text-[#37353E]">Create Your</span>
                        <br />
                        <motion.span 
                            whileHover={{ scale: 1.02 }}
                            className="relative inline-block mt-2"
                        >
                            <span className="bg-gradient-to-r from-[#715A5A] via-[#9b7b7b] to-[#715A5A] bg-clip-text text-transparent">
                                AI-Optimized Resume
                            </span>
                            {/* Animated Underline */}
                            <motion.svg 
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="absolute bottom-0 left-0 w-full h-4 -z-10" 
                                viewBox="0 0 400 20"
                            >
                                <motion.path 
                                    d="M0 10 L400 10" 
                                    stroke="url(#gradient)" 
                                    strokeWidth="2" 
                                    strokeDasharray="8 8"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.5, delay: 0.8 }}
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#715A5A" />
                                        <stop offset="50%" stopColor="#9b7b7b" />
                                        <stop offset="100%" stopColor="#715A5A" />
                                    </linearGradient>
                                </defs>
                            </motion.svg>
                        </motion.span>
                    </motion.h1>
                    
                    {/* Description */}
                    <motion.p 
                        variants={fadeInUpVariants}
                        className="text-xl md:text-2xl text-[#44444E] mb-10 leading-relaxed max-w-3xl mx-auto"
                    >
                        Transform your career with AI-powered resume optimization. 
                        Get ATS-friendly resumes, personalized interview questions, 
                        and a custom preparation roadmap.
                    </motion.p>
                    
                    {/* Modern Stats Row */}
                    <motion.div 
                        variants={containerVariants}
                        className="flex flex-wrap justify-center gap-8 mb-12"
                    >
                        {[
                            { icon: FaCheckCircle, text: "ATS Optimized", color: "#715A5A" },
                            { icon: FaChartLine, text: "95% Success Rate", color: "#715A5A" },
                            { icon: FaClipboardList, text: "1000+ Questions", color: "#715A5A" },
                            { icon: FaStar, text: "15k+ Users", color: "#715A5A" }
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                variants={statVariants}
                                whileHover="hover"
                                className="flex items-center gap-2 group cursor-pointer"
                            >
                                <motion.div
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <stat.icon className="text-[#715A5A] w-5 h-5" />
                                </motion.div>
                                <span className="text-[#44444E] font-medium group-hover:text-[#715A5A] transition-colors">
                                    {stat.text}
                                </span>
                            </motion.div>
                        ))}
                    </motion.div>
                    
                    {/* Dual CTA Buttons */}
                    <motion.div 
                        variants={containerVariants}
                        className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
                    >
                        <motion.div
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            <Link
                                to='/generateresumereport'
                                className="group relative px-8 py-4 bg-gradient-to-r from-[#715A5A] to-[#5a4848] text-white rounded-xl font-semibold text-lg inline-flex items-center gap-3 overflow-hidden"
                            >
                                <motion.div
                                    animate={{ x: [-100, 100] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                                />
                                <motion.div
                                    whileHover={{ rotate: 12 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <FaFileAlt className="w-5 h-5 relative z-10" />
                                </motion.div>
                                <span className="relative z-10">Generate Your AI Resume</span>
                                <motion.div
                                    whileHover={{ x: 5 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <FaArrowRight className="w-4 h-4 relative z-10" />
                                </motion.div>
                            </Link>
                        </motion.div>
                        
                        <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={handleGenerateResume}
                            className="group px-8 py-4 bg-transparent border-2 border-[#715A5A] text-[#715A5A] rounded-xl font-semibold text-lg inline-flex items-center gap-3"
                        >
                            <motion.div
                                whileHover={{ scale: 1.2 }}
                                transition={{ duration: 0.2 }}
                            >
                                <FaBrain className="w-5 h-5" />
                            </motion.div>
                            AI Analysis
                            <motion.div
                                whileHover={{ x: 5 }}
                                transition={{ duration: 0.2 }}
                            >
                                <FaArrowRight className="w-4 h-4" />
                            </motion.div>
                        </motion.button>
                    </motion.div>
                    
                    {/* Trust Indicators with Logos */}
                    <motion.div 
                        variants={containerVariants}
                        className="pt-8 border-t border-[#715A5A]/20"
                    >
                        <motion.p 
                            variants={itemVariants}
                            className="text-[#44444E]/60 text-sm mb-6 font-medium"
                        >
                            Trusted by professionals from
                        </motion.p>
                        <motion.div 
                            variants={containerVariants}
                            className="flex flex-wrap justify-center gap-10"
                        >
                            {['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix'].map((company, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={companyVariants}
                                    whileHover="hover"
                                    className="relative group"
                                >
                                    <span className="text-[#44444E] font-semibold opacity-60 group-hover:opacity-100 transition-all duration-300 cursor-pointer">
                                        {company}
                                    </span>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileHover={{ width: "100%" }}
                                        transition={{ duration: 0.3 }}
                                        className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-[#715A5A] to-[#9b7b7b]"
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
            
            {/* Modern Wave Decoration with Animation */}
            <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="absolute bottom-0 left-0 right-0"
            >
                <svg className="w-full h-16 text-[#D3DAD9]" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
                          fill="currentColor" 
                          opacity=".25"/>
                    <path d="M0,0V15.81C13,21.25,27.93,25.67,44.24,28.45c69.76,11,140.08,5.74,210-6.44C359.12,6.68,452,25.88,548,38.37c86.67,11,173.82,8.68,259.37-6.44,36.69-6.5,73.44-16.43,109.6-29.49C985.48,10,1092.45,1.5,1200,19.75V0Z" 
                          fill="currentColor" 
                          opacity=".5"/>
                    <path d="M0,0V52.41c68.68,13.28,138.7,21.47,210,19.37,80.19-2.36,160.89-23.74,240.87-39,88.56-16.92,177.34-32.09,266.84-30.86,86.88,1.2,173.86,15.07,260.53,31.23,34.65,6.46,69.23,13.81,103.86,20.45C1092.42,62.18,1145.62,54.45,1200,43.5V0Z" 
                          fill="currentColor" />
                </svg>
            </motion.div>
        </section>
    );
};

export default Hero;
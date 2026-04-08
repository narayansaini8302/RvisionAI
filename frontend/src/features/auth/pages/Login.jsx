import React from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';
import Loading from '../components/Loading';
import Swal from 'sweetalert2';
import { FaEnvelope, FaLock, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { loading, handlelogin, user } = useAuth();
    const navigate = useNavigate();
    
    useEffect(() => {
        console.log('User state in Login:', user);
    }, [user]);
    
    // Redirect if already logged in
    if (user) {
        console.log('User is logged in, redirecting to home');
        return <Navigate to="/" replace />;
    }
    
    async function handleSubmit(e) {
        e.preventDefault();
        
        try {
            console.log('Attempting login...');
            await handlelogin(email, password);
            
            Swal.fire({
                title: 'Success!',
                text: 'Login successful',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
            navigate('/');
            
        } catch (error) {
            console.error('Login failed:', error);
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.message || 'Invalid email or password',
                icon: 'error',
                timer: 2000,
                showConfirmButton: false
            });
        }
    }
    
    if (loading) {
        return <Loading fullScreen size='xl' />;
    }

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
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    const formVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    const inputVariants = {
        focus: { scale: 1.02, transition: { duration: 0.2 } },
        hover: { scale: 1.01, transition: { duration: 0.2 } }
    };

    const buttonVariants = {
        hover: { 
            scale: 1.05,
            transition: { type: "spring", stiffness: 400, damping: 10 }
        },
        tap: { scale: 0.95 }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-[#D3DAD9]/20 via-white to-[#D3DAD9]/30 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="absolute top-20 left-10 w-72 h-72 bg-[#715A5A]/10 rounded-full blur-3xl"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="absolute bottom-20 right-10 w-96 h-96 bg-[#715A5A]/10 rounded-full blur-3xl"
            />
            
            {/* Animated Grid Pattern */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                transition={{ duration: 1 }}
                className="absolute inset-0"
                style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, #715A5A 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md"
            >
                <motion.div
                    variants={formVariants}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-[#715A5A]/20"
                >
                    {/* Header */}
                    <motion.div variants={itemVariants} className="text-center mb-8">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-[#715A5A]/20 to-[#715A5A]/10 mb-4"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            >
                                <svg className="w-8 h-8 text-[#715A5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6-4h12a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2zm10 4v-4m-8 4v-4" />
                                </svg>
                            </motion.div>
                        </motion.div>
                        <h1 className="text-3xl font-bold text-[#37353E] mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-[#44444E]">
                            Sign in to continue with RvisionAI
                        </p>
                    </motion.div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Input */}
                        <motion.div variants={itemVariants}>
                            <label htmlFor="email" className="block text-[#44444E] text-sm font-medium mb-2">
                                Email Address
                            </label>
                            <motion.div
                                variants={inputVariants}
                                whileFocus="focus"
                                whileHover="hover"
                            >
                                <div className="relative">
                                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#44444E]/40 w-5 h-5" />
                                    <input 
                                        onChange={(e) => setEmail(e.target.value)}
                                        type="email" 
                                        id="email"
                                        name="email"
                                        value={email}
                                        placeholder="Enter your email"
                                        required 
                                        className="w-full pl-10 pr-4 py-3 border-2 border-[#715A5A]/20 rounded-xl bg-white/50 text-[#37353E] placeholder:text-[#44444E]/50 focus:outline-none focus:border-[#715A5A] focus:ring-4 focus:ring-[#715A5A]/20 transition-all duration-300"
                                    />
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Password Input */}
                        <motion.div variants={itemVariants}>
                            <label htmlFor="password" className="block text-[#44444E] text-sm font-medium mb-2">
                                Password
                            </label>
                            <motion.div
                                variants={inputVariants}
                                whileFocus="focus"
                                whileHover="hover"
                            >
                                <div className="relative">
                                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#44444E]/40 w-5 h-5" />
                                    <input 
                                        onChange={(e) => setPassword(e.target.value)}
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={password}
                                        placeholder="Enter your password"
                                        required 
                                        className="w-full pl-10 pr-12 py-3 border-2 border-[#715A5A]/20 rounded-xl bg-white/50 text-[#37353E] placeholder:text-[#44444E]/50 focus:outline-none focus:border-[#715A5A] focus:ring-4 focus:ring-[#715A5A]/20 transition-all duration-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#44444E]/40 hover:text-[#715A5A] transition-colors"
                                    >
                                        {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Forgot Password Link */}
                        <motion.div variants={itemVariants} className="text-right">
                            <Link 
                                to="/forgot-password" 
                                className="text-sm text-[#715A5A] hover:text-[#5a4848] transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            type='submit' 
                            disabled={loading}
                            className="relative w-full bg-gradient-to-r from-[#715A5A] to-[#5a4848] text-white font-semibold py-3 rounded-xl transition-all duration-300 overflow-hidden group"
                        >
                            <motion.div
                                animate={{ x: [-100, 100] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                            />
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                    />
                                ) : (
                                    <>
                                        Login
                                        <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                        </motion.button>

                        {/* Sign Up Link */}
                        <motion.div variants={itemVariants} className="text-center">
                            <span className="text-[#44444E]">Don't have an account? </span>
                            <Link 
                                to="/register" 
                                className="text-[#715A5A] hover:text-[#5a4848] font-medium transition-colors inline-flex items-center gap-1 group"
                            >
                                Sign up
                                <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    </form>
                </motion.div>

                {/* Decorative Elements */}
                <motion.div
                    variants={itemVariants}
                    className="mt-6 text-center"
                >
                    <p className="text-xs text-[#44444E]/60">
                        By continuing, you agree to our 
                        <Link to="/terms" className="text-[#715A5A] hover:underline mx-1">Terms</Link>
                        and
                        <Link to="/privacy" className="text-[#715A5A] hover:underline ml-1">Privacy Policy</Link>
                    </p>
                </motion.div>
            </motion.div>
        </main>
    );
};

export default Login;
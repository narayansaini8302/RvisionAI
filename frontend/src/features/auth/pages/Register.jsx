import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/Loading';
import Swal from 'sweetalert2';
import { FaEnvelope, FaLock, FaUser, FaArrowRight, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const { loading, handleregister } = useAuth();
    const navigate = useNavigate();
    
    // Password strength checker
    const checkPasswordStrength = (pwd) => {
        let strength = 0;
        if (pwd.length >= 8) strength++;
        if (pwd.match(/[a-z]/) && pwd.match(/[A-Z]/)) strength++;
        if (pwd.match(/\d/)) strength++;
        if (pwd.match(/[^a-zA-Z\d]/)) strength++;
        setPasswordStrength(strength);
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        checkPasswordStrength(newPassword);
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength === 0) return 'bg-gray-200';
        if (passwordStrength === 1) return 'bg-red-500';
        if (passwordStrength === 2) return 'bg-yellow-500';
        if (passwordStrength === 3) return 'bg-blue-500';
        return 'bg-green-500';
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength === 0) return 'No password';
        if (passwordStrength === 1) return 'Weak';
        if (passwordStrength === 2) return 'Fair';
        if (passwordStrength === 3) return 'Good';
        return 'Strong';
    };

    async function handleSubmit(e) {
        e.preventDefault();
        
        if (passwordStrength < 3) {
            Swal.fire({
                title: 'Weak Password!',
                text: 'Please use a stronger password (at least 8 characters with mix of cases, numbers, and symbols)',
                icon: 'warning',
                timer: 3000,
                showConfirmButton: false
            });
            return;
        }
        
        try {
            await handleregister(username, email, password);
            
            Swal.fire({
                title: 'Success!',
                text: 'Registration successful!',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
            
            navigate('/');
            e.target.reset();
            
        } catch(err) {
            console.log('Registration error:', err);
            Swal.fire({
                title: 'Error!',
                text: err.response?.data?.message || 'Registration failed. Please try again.',
                icon: 'error',
                timer: 2000,
                showConfirmButton: false
            });
        }
    }
    
    if(loading) {
        return <Loading fullScreen size="xl" />;
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
                                <FaUser className="w-8 h-8 text-[#715A5A]" />
                            </motion.div>
                        </motion.div>
                        <h1 className="text-3xl font-bold text-[#37353E] mb-2">
                            Create Account
                        </h1>
                        <p className="text-[#44444E]">
                            Join us to start your AI journey
                        </p>
                    </motion.div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username Input */}
                        <motion.div variants={itemVariants}>
                            <label htmlFor="username" className="block text-[#44444E] text-sm font-medium mb-2">
                                Username
                            </label>
                            <motion.div
                                variants={inputVariants}
                                whileFocus="focus"
                                whileHover="hover"
                            >
                                <div className="relative">
                                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#44444E]/40 w-5 h-5" />
                                    <input 
                                        onChange={(e) => setUsername(e.target.value)}
                                        type="text" 
                                        id="username"
                                        name="username"
                                        value={username}
                                        placeholder="Choose a username"
                                        required 
                                        className="w-full pl-10 pr-4 py-3 border-2 border-[#715A5A]/20 rounded-xl bg-white/50 text-[#37353E] placeholder:text-[#44444E]/50 focus:outline-none focus:border-[#715A5A] focus:ring-4 focus:ring-[#715A5A]/20 transition-all duration-300"
                                    />
                                </div>
                            </motion.div>
                        </motion.div>

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
                                        onChange={handlePasswordChange}
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={password}
                                        placeholder="Create a strong password"
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
                            
                            {/* Password Strength Indicator */}
                            {password && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-2"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(passwordStrength / 4) * 100}%` }}
                                                transition={{ duration: 0.3 }}
                                                className={`h-full ${getPasswordStrengthColor()} rounded-full`}
                                            />
                                        </div>
                                        <span className={`text-xs font-medium ${
                                            passwordStrength === 1 ? 'text-red-500' :
                                            passwordStrength === 2 ? 'text-yellow-500' :
                                            passwordStrength === 3 ? 'text-blue-500' :
                                            passwordStrength === 4 ? 'text-green-500' :
                                            'text-gray-400'
                                        }`}>
                                            {getPasswordStrengthText()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#44444E]/60">
                                        Use 8+ chars with mix of cases, numbers & symbols
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Password Requirements */}
                        <motion.div variants={itemVariants} className="space-y-1">
                            <p className="text-xs text-[#44444E]/60 mb-2">Password must contain:</p>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { text: "At least 8 characters", check: password.length >= 8 },
                                    { text: "Uppercase & lowercase", check: /[a-z]/.test(password) && /[A-Z]/.test(password) },
                                    { text: "At least one number", check: /\d/.test(password) },
                                    { text: "At least one symbol", check: /[^a-zA-Z\d]/.test(password) }
                                ].map((req, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex items-center gap-1.5"
                                    >
                                        <FaCheckCircle className={`w-3 h-3 ${req.check ? 'text-green-500' : 'text-gray-300'}`} />
                                        <span className={`text-xs ${req.check ? 'text-[#44444E]/80' : 'text-[#44444E]/40'}`}>
                                            {req.text}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            type='submit' 
                            disabled={loading}
                            className="relative w-full bg-gradient-to-r from-[#715A5A] to-[#5a4848] text-white font-semibold py-3 rounded-xl transition-all duration-300 overflow-hidden group mt-6"
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
                                        Create Account
                                        <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                        </motion.button>

                        {/* Login Link */}
                        <motion.div variants={itemVariants} className="text-center">
                            <span className="text-[#44444E]">Already have an account? </span>
                            <Link 
                                to="/login" 
                                className="text-[#715A5A] hover:text-[#5a4848] font-medium transition-colors inline-flex items-center gap-1 group"
                            >
                                Login
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
                        By creating an account, you agree to our 
                        <Link to="/terms" className="text-[#715A5A] hover:underline mx-1">Terms</Link>
                        and
                        <Link to="/privacy" className="text-[#715A5A] hover:underline ml-1">Privacy Policy</Link>
                    </p>
                </motion.div>
            </motion.div>
        </main>
    );
};

export default Register;
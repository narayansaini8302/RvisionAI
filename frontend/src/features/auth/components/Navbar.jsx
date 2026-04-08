import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";

const Navbar = ({ onLoginClick, onRegisterClick }) => {
    const { user, handlelogout } = useAuth();
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = async () => {
        await handlelogout();
        navigate("/");
        setIsMobileMenuOpen(false);
    };

    // Navigation handlers
    const handleLoginClick = () => {
        setIsMobileMenuOpen(false);
        navigate("/login");
    };

    const handleRegisterClick = () => {
        setIsMobileMenuOpen(false);
        navigate("/register");
    };

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
        { name: "Features", path: "/features" },
        { name: "Pricing", path: "/pricing" },
        { name: "Contact", path: "/contact" },
    ];

    // Animation variants
    const navVariants = {
        hidden: { y: -100, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { 
                type: "spring", 
                stiffness: 100, 
                damping: 20,
                duration: 0.5 
            }
        }
    };

    const logoVariants = {
        initial: { scale: 1 },
        hover: { 
            scale: 1.05,
            rotate: 3,
            transition: { type: "spring", stiffness: 400, damping: 10 }
        },
        tap: { scale: 0.95 }
    };

    const logoGlowVariants = {
        initial: { opacity: 0.5, scale: 0.8 },
        hover: { 
            opacity: 0.75, 
            scale: 1.1,
            transition: { duration: 0.3 }
        }
    };

    const linkVariants = {
        initial: { opacity: 0, y: -20 },
        animate: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.3 }
        },
        hover: { 
            scale: 1.05,
            transition: { type: "spring", stiffness: 400, damping: 10 }
        }
    };

    const buttonVariants = {
        initial: { opacity: 0, scale: 0.9 },
        animate: { 
            opacity: 1, 
            scale: 1,
            transition: { duration: 0.3 }
        },
        hover: { 
            scale: 1.05,
            transition: { type: "spring", stiffness: 400, damping: 10 }
        },
        tap: { scale: 0.95 }
    };

    const mobileMenuVariants = {
        hidden: { 
            opacity: 0, 
            height: 0,
            transition: { duration: 0.3, ease: "easeInOut" }
        },
        visible: { 
            opacity: 1, 
            height: "auto",
            transition: { 
                duration: 0.4, 
                ease: "easeOut",
                staggerChildren: 0.05,
                delayChildren: 0.1
            }
        }
    };

    const mobileItemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { 
            opacity: 1, 
            x: 0,
            transition: { duration: 0.3 }
        }
    };

    return (
        <>
            <motion.nav
                variants={navVariants}
                initial="hidden"
                animate="visible"
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                    isScrolled
                        ? "bg-[#37353E]/95 backdrop-blur-xl shadow-2xl"
                        : "bg-[#D3DAD9]/80 backdrop-blur-md"
                }`}
                style={{
                    borderBottom: isScrolled ? "1px solid rgba(113, 90, 90, 0.2)" : "none",
                }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 md:h-20">
                        {/* Logo Section with Animation */}
                        <motion.div
                            variants={logoVariants}
                            initial="initial"
                            whileHover="hover"
                            whileTap="tap"
                        >
                            <Link
                                to="/"
                                className="flex items-center space-x-3 group"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <div className="relative">
                                    <motion.div
                                        variants={logoGlowVariants}
                                        initial="initial"
                                        whileHover="hover"
                                        className="absolute inset-0 bg-[#715A5A] rounded-xl blur-md"
                                    />
                                    <motion.div
                                        className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
                                        style={{
                                            background: `linear-gradient(135deg, #715A5A 0%, #5a4848 100%)`,
                                            boxShadow: "0 4px 15px rgba(113, 90, 90, 0.3)",
                                        }}
                                    >
                                        <motion.span
                                            animate={{ rotate: [0, 5, 0] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                            className="text-white font-bold text-xl"
                                        >
                                            R
                                        </motion.span>
                                    </motion.div>
                                </div>
                                
                                <div className="flex items-baseline">
                                    <motion.span
                                        className="text-xl md:text-2xl font-bold tracking-tight"
                                        style={{ color: isScrolled ? "#D3DAD9" : "#37353E" }}
                                    >
                                        Rvision
                                    </motion.span>
                                    <motion.span
                                        animate={{ 
                                            backgroundPosition: ["0%", "100%", "0%"],
                                        }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="text-xl md:text-2xl font-bold ml-0.5"
                                        style={{
                                            background: "linear-gradient(135deg, #715A5A 0%, #9b7b7b 50%, #715A5A 100%)",
                                            backgroundSize: "200% auto",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                            backgroundClip: "text",
                                        }}
                                    >
                                        AI
                                    </motion.span>
                                </div>
                            </Link>
                        </motion.div>

                        {/* Desktop Navigation Links */}
                        <div className="hidden md:flex items-center space-x-1">
                            {navLinks.map((link, index) => (
                                <motion.div
                                    key={link.name}
                                    variants={linkVariants}
                                    initial="initial"
                                    animate="animate"
                                    custom={index}
                                    whileHover="hover"
                                >
                                    <Link
                                        to={link.path}
                                        className="relative px-4 py-2 text-[#44444E] hover:text-[#715A5A] transition-all duration-300 font-medium group"
                                        style={{ color: isScrolled ? "#D3DAD9" : "#44444E" }}
                                    >
                                        <span className="relative z-10">{link.name}</span>
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            whileHover={{ scale: 1 }}
                                            className="absolute inset-0 bg-[#715A5A]/10 rounded-lg origin-center"
                                        />
                                        <motion.span
                                            initial={{ width: 0, left: "50%" }}
                                            whileHover={{ width: 24, left: "50%", x: "-50%" }}
                                            className="absolute -bottom-1 h-0.5 bg-[#715A5A]"
                                            style={{ backgroundColor: "#715A5A" }}
                                        />
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {/* Auth Buttons - Desktop */}
                        <div className="hidden md:flex items-center space-x-3">
                            {user ? (
                                <motion.div
                                    variants={buttonVariants}
                                    initial="initial"
                                    animate="animate"
                                    className="flex items-center space-x-4"
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className="relative group"
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            whileHover={{ opacity: 0.5, scale: 1 }}
                                            className="absolute inset-0 bg-[#715A5A] rounded-full blur-md"
                                        />
                                        <div
                                            className="relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
                                            style={{
                                                background: `linear-gradient(135deg, #715A5A 0%, #5a4848 100%)`,
                                                boxShadow: "0 2px 10px rgba(113, 90, 90, 0.3)",
                                            }}
                                        >
                                            <span className="text-white text-sm font-semibold">
                                                {user.username?.charAt(0).toUpperCase() || "U"}
                                            </span>
                                        </div>
                                    </motion.div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleLogout}
                                        className="relative px-5 py-2 rounded-lg font-semibold text-sm overflow-hidden group"
                                        style={{
                                            background: "linear-gradient(135deg, #715A5A 0%, #5a4848 100%)",
                                            color: "#ffffff",
                                            boxShadow: "0 2px 10px rgba(113, 90, 90, 0.3)",
                                        }}
                                    >
                                        <span className="relative z-10">Logout</span>
                                        <motion.div
                                            initial={{ y: "100%" }}
                                            whileHover={{ y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="absolute inset-0 bg-white/20"
                                        />
                                    </motion.button>
                                </motion.div>
                            ) : (
                                <>
                                    <motion.button
                                        variants={buttonVariants}
                                        initial="initial"
                                        animate="animate"
                                        whileHover="hover"
                                        whileTap="tap"
                                        onClick={handleLoginClick}
                                        className="relative px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-300"
                                        style={{
                                            border: `2px solid ${isScrolled ? "#D3DAD9" : "#715A5A"}`,
                                            color: isScrolled ? "#D3DAD9" : "#715A5A",
                                            backgroundColor: "transparent",
                                        }}
                                    >
                                        <span className="relative z-10">Login</span>
                                    </motion.button>
                                    
                                    <motion.button
                                        variants={buttonVariants}
                                        initial="initial"
                                        animate="animate"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleRegisterClick}
                                        className="relative px-5 py-2 rounded-lg font-semibold text-sm overflow-hidden group"
                                        style={{
                                            background: "linear-gradient(135deg, #715A5A 0%, #5a4848 100%)",
                                            color: "#ffffff",
                                            boxShadow: "0 2px 10px rgba(113, 90, 90, 0.3)",
                                        }}
                                    >
                                        <span className="relative z-10">Sign Up</span>
                                        <motion.div
                                            initial={{ y: "100%" }}
                                            whileHover={{ y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="absolute inset-0 bg-white/20"
                                        />
                                    </motion.button>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden relative w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group"
                            style={{
                                backgroundColor: isMobileMenuOpen ? "#715A5A" : "transparent",
                                color: isScrolled ? "#D3DAD9" : "#37353E",
                            }}
                        >
                            <motion.div
                                animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                                transition={{ duration: 0.3 }}
                                className="relative z-10"
                            >
                                <svg
                                    className="w-5 h-5 transition-transform duration-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    {isMobileMenuOpen ? (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    ) : (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    )}
                                </svg>
                            </motion.div>
                            <motion.div
                                animate={{ 
                                    backgroundColor: isMobileMenuOpen ? "#715A5A" : "rgba(113, 90, 90, 0.1)",
                                    scale: isMobileMenuOpen ? 1 : 0.8
                                }}
                                className="absolute inset-0 rounded-lg"
                            />
                        </motion.button>
                    </div>
                </div>

                {/* Mobile Menu with AnimatePresence */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            variants={mobileMenuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="md:hidden overflow-hidden"
                            style={{
                                background: isScrolled 
                                    ? "linear-gradient(135deg, rgba(55, 53, 62, 0.98) 0%, rgba(68, 68, 78, 0.98) 100%)"
                                    : "linear-gradient(135deg, rgba(211, 218, 217, 0.98) 0%, rgba(211, 218, 217, 0.98) 100%)",
                                backdropFilter: "blur(10px)",
                            }}
                        >
                            <div className="px-6 pt-4 pb-6 space-y-3">
                                {navLinks.map((link) => (
                                    <motion.div
                                        key={link.name}
                                        variants={mobileItemVariants}
                                        whileHover={{ x: 8 }}
                                    >
                                        <Link
                                            to={link.path}
                                            className="block py-3 px-4 rounded-xl transition-all duration-300"
                                            style={{ 
                                                color: isScrolled ? "#D3DAD9" : "#44444E",
                                                backgroundColor: "transparent",
                                            }}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <span className="font-medium">{link.name}</span>
                                        </Link>
                                    </motion.div>
                                ))}
                                
                                <motion.div variants={mobileItemVariants} className="pt-4 space-y-3 border-t border-[#715A5A]/20">
                                    {user ? (
                                        <>
                                            <motion.div 
                                                whileHover={{ x: 8 }}
                                                className="flex items-center space-x-3 py-2 px-4"
                                            >
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    className="w-10 h-10 rounded-full flex items-center justify-center"
                                                    style={{
                                                        background: `linear-gradient(135deg, #715A5A 0%, #5a4848 100%)`,
                                                        boxShadow: "0 2px 8px rgba(113, 90, 90, 0.3)",
                                                    }}
                                                >
                                                    <span className="text-white text-sm font-semibold">
                                                        {user.username?.charAt(0).toUpperCase() || "U"}
                                                    </span>
                                                </motion.div>
                                                <span style={{ color: isScrolled ? "#D3DAD9" : "#37353E" }} className="font-medium">
                                                    {user.username}
                                                </span>
                                            </motion.div>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleLogout}
                                                className="w-full px-4 py-3 rounded-xl font-semibold transition-all duration-300"
                                                style={{
                                                    background: "linear-gradient(135deg, #715A5A 0%, #5a4848 100%)",
                                                    color: "#ffffff",
                                                    boxShadow: "0 4px 15px rgba(113, 90, 90, 0.3)",
                                                }}
                                            >
                                                Logout
                                            </motion.button>
                                        </>
                                    ) : (
                                        <>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleLoginClick}
                                                className="w-full px-4 py-3 rounded-xl font-semibold transition-all duration-300 border-2"
                                                style={{
                                                    borderColor: isScrolled ? "#D3DAD9" : "#715A5A",
                                                    color: isScrolled ? "#D3DAD9" : "#715A5A",
                                                    backgroundColor: "transparent",
                                                }}
                                            >
                                                Login
                                            </motion.button>
                                            
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleRegisterClick}
                                                className="w-full px-4 py-3 rounded-xl font-semibold transition-all duration-300"
                                                style={{
                                                    background: "linear-gradient(135deg, #715A5A 0%, #5a4848 100%)",
                                                    color: "#ffffff",
                                                    boxShadow: "0 4px 15px rgba(113, 90, 90, 0.3)",
                                                }}
                                            >
                                                Sign Up
                                            </motion.button>
                                        </>
                                    )}
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            {/* Spacer */}
            <div className="h-16 md:h-20" />
        </>
    );
};

export default Navbar;
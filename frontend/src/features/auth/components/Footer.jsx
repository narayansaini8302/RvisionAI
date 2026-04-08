import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { 
    FaGithub, 
    FaTwitter, 
    FaLinkedin, 
    FaDiscord, 
    FaEnvelope, 
    FaChevronRight,
    FaStar,
    FaShieldAlt,
    FaBook,
    FaUsers,
    FaBriefcase,
    FaGlobe,
    FaFileAlt,
    FaBalanceScale,
    FaCookieBite
} from 'react-icons/fa';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.1 });

    const footerLinks = {
        Product: [
            { name: 'Features', path: '/features', icon: FaStar },
            { name: 'Pricing', path: '/pricing', icon: FaShieldAlt },
            { name: 'API Documentation', path: '/docs', icon: FaBook },
            { name: 'Changelog', path: '/changelog', icon: FaFileAlt },
        ],
        Company: [
            { name: 'About Us', path: '/about', icon: FaUsers },
            { name: 'Blog', path: '/blog', icon: FaFileAlt },
            { name: 'Careers', path: '/careers', icon: FaBriefcase },
            { name: 'Press', path: '/press', icon: FaGlobe },
        ],
        Resources: [
            { name: 'Documentation', path: '/docs', icon: FaBook },
            { name: 'Tutorials', path: '/tutorials', icon: FaStar },
            { name: 'Support', path: '/support', icon: FaDiscord },
            { name: 'Community', path: '/community', icon: FaUsers },
        ],
        Legal: [
            { name: 'Privacy Policy', path: '/privacy', icon: FaShieldAlt },
            { name: 'Terms of Service', path: '/terms', icon: FaFileAlt },
            { name: 'Cookie Policy', path: '/cookies', icon: FaCookieBite },
            { name: 'GDPR', path: '/gdpr', icon: FaBalanceScale },
        ],
    };

    const socialLinks = [
        {
            name: 'GitHub',
            icon: FaGithub,
            url: 'https://github.com/rvisionai',
            color: '#333'
        },
        {
            name: 'Twitter',
            icon: FaTwitter,
            url: 'https://twitter.com/rvisionai',
            color: '#1DA1F2'
        },
        {
            name: 'LinkedIn',
            icon: FaLinkedin,
            url: 'https://linkedin.com/company/rvisionai',
            color: '#0077B5'
        },
        {
            name: 'Discord',
            icon: FaDiscord,
            url: 'https://discord.gg/rvisionai',
            color: '#5865F2'
        },
    ];

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
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    const categoryVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    const linkVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.3 }
        },
        hover: {
            x: 5,
            color: "#715A5A",
            transition: { duration: 0.2 }
        }
    };

    const newsletterVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const socialVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.3 }
        },
        hover: {
            scale: 1.1,
            y: -5,
            transition: { type: "spring", stiffness: 400, damping: 10 }
        },
        tap: { scale: 0.95 }
    };

    const logoVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        },
        hover: {
            scale: 1.05,
            transition: { type: "spring", stiffness: 400, damping: 10 }
        }
    };

    const copyrightVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.5, delay: 0.5 }
        }
    };

    return (
        <motion.footer
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="relative mt-auto"
        >
            <div 
                className="bg-background-dark/95 backdrop-blur-sm border-t border-accent/20 transition-all duration-300"
                style={{
                    backgroundColor: 'rgba(188, 198, 196, 0.98)',
                }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Top Section - Links */}
                    <motion.div 
                        variants={containerVariants}
                        className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12"
                    >
                        {Object.entries(footerLinks).map(([category, links]) => (
                            <motion.div 
                                key={category} 
                                variants={categoryVariants}
                                className="group"
                            >
                                <motion.h3 
                                    className="text-lg font-semibold mb-4 relative inline-block"
                                    style={{ color: '#37353E' }}
                                >
                                    {category}
                                    <motion.span 
                                        initial={{ width: 0 }}
                                        whileHover={{ width: "100%" }}
                                        transition={{ duration: 0.3 }}
                                        className="absolute bottom-0 left-0 h-0.5 bg-accent"
                                        style={{ backgroundColor: "#715A5A" }}
                                    />
                                </motion.h3>
                                <motion.ul 
                                    variants={containerVariants}
                                    className="space-y-3"
                                >
                                    {links.map((link) => {
                                        const IconComponent = link.icon;
                                        return (
                                            <motion.li 
                                                key={link.name}
                                                variants={linkVariants}
                                                whileHover="hover"
                                            >
                                                <Link
                                                    to={link.path}
                                                    className="group/link flex items-center gap-2 text-text-secondary hover:text-accent transition-all duration-300 text-sm"
                                                    style={{ color: '#6b6b78' }}
                                                >
                                                    <motion.div
                                                        whileHover={{ x: 3, scale: 1.1 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <IconComponent size={14} />
                                                    </motion.div>
                                                    <motion.span
                                                        whileHover={{ x: 3 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        {link.name}
                                                    </motion.span>
                                                    <motion.div
                                                        initial={{ opacity: 0, x: -5 }}
                                                        whileHover={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <FaChevronRight size={12} />
                                                    </motion.div>
                                                </Link>
                                            </motion.li>
                                        );
                                    })}
                                </motion.ul>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Middle Section - Newsletter */}
                    <motion.div 
                        variants={newsletterVariants}
                        className="border-t border-b border-accent/20 py-8 mb-8"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <motion.div 
                                variants={itemVariants}
                                className="text-center md:text-left"
                            >
                                <motion.h3 
                                    className="text-xl font-semibold mb-2 flex items-center gap-2 justify-center md:justify-start"
                                    style={{ color: '#37353E' }}
                                >
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    >
                                        <FaEnvelope className="w-5 h-5 text-accent" />
                                    </motion.div>
                                    Subscribe to our newsletter
                                </motion.h3>
                                <p className="text-text-secondary text-sm">
                                    Get the latest updates and news about RvisionAI
                                </p>
                            </motion.div>
                            <motion.div 
                                variants={itemVariants}
                                className="flex w-full md:w-auto group"
                            >
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 md:w-64 px-4 py-2 rounded-l-lg border border-accent/20 focus:outline-none focus:border-accent transition-all duration-300 group-hover:border-accent/40"
                                    style={{
                                        backgroundColor: 'rgba(211, 218, 217, 0.5)',
                                        color: '#37353E',
                                    }}
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="relative px-6 py-2 rounded-r-lg font-medium transition-all duration-300 overflow-hidden group/btn"
                                    style={{
                                        backgroundColor: '#715A5A',
                                        color: '#ffffff',
                                    }}
                                >
                                    <motion.span 
                                        initial={{ x: -50, opacity: 0 }}
                                        whileHover={{ x: 0, opacity: 1 }}
                                        className="absolute inset-0 flex items-center justify-center"
                                        style={{ backgroundColor: '#5a4848' }}
                                    />
                                    <span className="relative z-10 cursor-pointer">Subscribe</span>
                                </motion.button>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Bottom Section */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <motion.div
                            variants={logoVariants}
                            whileHover="hover"
                        >
                            <Link to="/" className="flex items-center space-x-2 group">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 3 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:shadow-lg"
                                    style={{
                                        background: 'linear-gradient(135deg, #715A5A 0%, #5a4848 100%)',
                                    }}
                                >
                                    <motion.span
                                        animate={{ rotate: [0, 5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        className="text-white font-bold text-lg"
                                    >
                                        R
                                    </motion.span>
                                </motion.div>
                                <motion.span
                                    whileHover={{ letterSpacing: "0.05em" }}
                                    className="text-xl font-bold transition-all duration-300"
                                    style={{ color: '#37353E' }}
                                >
                                    Rvision
                                    <motion.span
                                        animate={{ 
                                            backgroundPosition: ["0%", "100%", "0%"],
                                        }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
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
                                </motion.span>
                            </Link>
                        </motion.div>

                        <motion.div 
                            variants={containerVariants}
                            className="flex space-x-3"
                        >
                            {socialLinks.map((social) => {
                                const IconComponent = social.icon;
                                return (
                                    <motion.a
                                        key={social.name}
                                        variants={socialVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group/social relative"
                                        aria-label={social.name}
                                    >
                                        <motion.div 
                                            className="p-2 rounded-lg transition-all duration-300"
                                            style={{ 
                                                color: '#6b6b78',
                                                backgroundColor: 'rgba(211, 218, 217, 0.5)'
                                            }}
                                        >
                                            <IconComponent size={20} />
                                        </motion.div>
                                        <motion.span 
                                            initial={{ opacity: 0, y: 10 }}
                                            whileHover={{ opacity: 1, y: 0 }}
                                            className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-primary text-white text-xs rounded whitespace-nowrap pointer-events-none"
                                            style={{ backgroundColor: '#37353E' }}
                                        >
                                            {social.name}
                                        </motion.span>
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            whileHover={{ opacity: 1 }}
                                            className="absolute inset-0 rounded-lg transition-opacity duration-300"
                                            style={{ boxShadow: `0 0 15px ${social.color}` }}
                                        />
                                    </motion.a>
                                );
                            })}
                        </motion.div>

                        <motion.div 
                            variants={copyrightVariants}
                            className="text-text-secondary text-sm transition-all duration-300 hover:text-accent"
                            whileHover={{ scale: 1.05 }}
                        >
                            © {currentYear} RvisionAI. All rights reserved.
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.footer>
    );
};

export default Footer;
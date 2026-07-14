import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

/**
 * Modern AuthCard container displaying the CivicPulse logo, header text, 
 * and handles animated transitions between LoginForm and SignupForm.
 */
export const AuthCard = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
  };

  // Animation configurations
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  const formVariants = {
    initial: { opacity: 0, x: mode === 'login' ? -15 : 15 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.35, ease: 'easeOut' }
    },
    exit: { 
      opacity: 0, 
      x: mode === 'login' ? 15 : -15,
      transition: { duration: 0.25, ease: 'easeIn' }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-[450px] bg-white border border-slate-100 rounded-[20px] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.06)] overflow-hidden"
    >
      <div className="p-8 sm:p-10 flex flex-col">
        {/* TOP OF CARD: Logo & Header */}
        <div className="flex flex-col items-center text-center mb-8 select-none">
          {/* CivicPulse Premium SVG Logo */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary-500/20 mb-4 hover:scale-105 transition-transform duration-300">
            <svg 
              className="w-6 h-6 text-white" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2.5}
            >
              {/* Pulse & building silhouette combination */}
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M13 10V3L4 14h7v7l9-11h-7z" 
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 max-w-[280px]">
            {mode === 'login' 
              ? 'Sign in to continue managing civic services.' 
              : 'Get started with intelligent municipal operations.'
            }
          </p>
        </div>

        {/* Auth Forms with smooth transition animations */}
        <div className="relative min-h-[300px]">
          <AnimatePresence mode="wait" initial={false}>
            {mode === 'login' ? (
              <motion.div
                key="login"
                variants={formVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <LoginForm onToggleMode={toggleMode} />
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                variants={formVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <SignupForm onToggleMode={toggleMode} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default AuthCard;

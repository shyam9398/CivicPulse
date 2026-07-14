import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Map, BarChart3, Shield, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import AuthCard from '../components/AuthCard';
import smartCityImg from '../assets/smart_city_illustration.png';

/**
 * Modern split-screen authentication page.
 * Left (40%): Brand presentation, smart city vector, feature badges.
 * Right (60%): Centered AuthCard.
 */
export const LoginPage = () => {
  const { toasts, removeToast } = useAuth();

  const features = [
    {
      icon: Cpu,
      title: 'AI Complaint Management',
      desc: 'Automatic sorting, sentiment parsing & smart dispatch.'
    },
    {
      icon: Map,
      title: 'Real-Time Tracking',
      desc: 'Live telemetry of municipal assets & civic dispatches.'
    },
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      desc: 'Predictive data modeling on city metrics & infrastructure.'
    },
    {
      icon: Shield,
      title: 'Transparent Governance',
      desc: 'Encrypted public logs ensuring auditability & trust.'
    }
  ];

  // Animation config for badges
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  // Toast theme maps
  const toastThemes = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200',
      iconColor: 'text-emerald-500',
      icon: CheckCircle2,
      textColor: 'text-emerald-800'
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      iconColor: 'text-red-500',
      icon: AlertCircle,
      textColor: 'text-red-800'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-500',
      icon: Info,
      textColor: 'text-blue-800'
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 relative overflow-hidden">
      
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const theme = toastThemes[toast.type] || toastThemes.info;
            const IconComponent = theme.icon;

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } }}
                className={`
                  pointer-events-auto w-full p-4 rounded-xl border shadow-lg flex gap-3 items-start
                  ${theme.bg} transition-all duration-300
                `}
                role="alert"
              >
                <IconComponent size={20} className={`${theme.iconColor} mt-0.5 flex-shrink-0`} />
                <div className="flex-1 text-sm font-medium leading-normal text-slate-700">
                  {toast.message}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none rounded-lg p-0.5 hover:bg-slate-100"
                  aria-label="Close notification"
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* LEFT SIDE (40% width on Desktop) */}
      <div className="relative hidden lg:flex lg:w-[40%] bg-[#0B132B] flex-col justify-between p-10 xl:p-12 overflow-hidden border-r border-slate-900 select-none">
        {/* Modern grid & glow backdrop decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#1e3a8a_0%,transparent_50%)] opacity-40"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35"></div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-primary-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <svg 
              className="w-5 h-5 text-white" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-wider text-white">CivicPulse</span>
          <span className="px-2 py-0.5 text-[10px] font-semibold text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 rounded-full uppercase tracking-widest">
            AI Platform
          </span>
        </div>

        {/* Vector Image Illustration with floating animation */}
        <div className="relative z-10 my-auto flex flex-col items-center">
          <div className="relative w-full max-w-[280px] xl:max-w-[340px] aspect-square rounded-2xl overflow-hidden bg-slate-950/30 border border-white/5 shadow-2xl shadow-black/40">
            {/* Soft inner glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b132b]/80 via-transparent to-transparent z-10"></div>
            
            <img 
              src={smartCityImg} 
              alt="Smart City Illustration" 
              className="w-full h-full object-cover animate-float-slow"
              onError={(e) => {
                // Fallback icon outline in case of file issues
                e.target.style.display = 'none';
                console.error('Failed to load smart city illustration image');
              }}
            />
          </div>

          <div className="text-center mt-6 max-w-sm">
            <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">
              CivicPulse
            </h2>
            <p className="text-slate-400 text-sm mt-2 font-medium">
              Building Smarter Cities Through Intelligent Civic Management
            </p>
          </div>
        </div>

        {/* Feature Badges Container */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 grid grid-cols-2 gap-3"
        >
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md flex flex-col gap-1.5 hover:bg-white/[0.06] transition-all duration-300 group hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary-500/10 text-cyan-400 border border-primary-500/10 group-hover:scale-105 transition-transform duration-200">
                    <Icon size={16} />
                  </div>
                  <span className="text-xs font-bold text-white tracking-wide">
                    {feat.title}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  {feat.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* RIGHT SIDE (60% width on Desktop, full width on Mobile/Tablet) */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-20 relative bg-slate-50">
        
        {/* Compact logo shown only on mobile */}
        <div className="lg:hidden flex items-center gap-2 mb-8 select-none">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-cyan-500 flex items-center justify-center shadow-md">
            <svg 
              className="w-4 h-4 text-white" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-slate-800 tracking-wide">CivicPulse</span>
        </div>

        {/* Center AuthCard Component */}
        <AuthCard />

        {/* Footer info/legal text */}
        <div className="mt-8 text-center text-xs text-slate-400 select-none max-w-xs leading-normal">
          Secure authentication system. Encrypted using SHA-256 and JSON Web Token (JWT) standards. 
          <div className="mt-1 font-medium text-slate-400">
            © {new Date().getFullYear()} CivicPulse. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

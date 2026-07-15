import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, FileText, MapPin, ShieldAlert, Cpu } from 'lucide-react';

export const HelpPage = () => {
  const [openIdx, setOpenIdx] = useState(null);

  const toggleAccordion = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  const faqs = [
    {
      icon: Cpu,
      q: "How does the AI auto-assignment system work?",
      a: "When you select a category (e.g. Street Light or road damage), our system parses the category type and immediately maps it to the responsible municipal department. This cuts sorting bottlenecks, sending your ticket directly to the appropriate operations queue."
    },
    {
      icon: MapPin,
      q: "Why does CivicPulse require location permissions?",
      a: "CivicPulse uses browser GPS capabilities and geocoding services to pinpoint coordinates. This maps issues on GIS software for public works staff. You do not need to type the address; GPS lock does this automatically."
    },
    {
      icon: FileText,
      q: "How do I download a complaint receipt PDF?",
      a: "Navigate to the History page. You can click on the download button in the table row, or click on the row to open the details drawer and select the 'Download Receipt (PDF)' button. This generates a document containing ticket IDs, timestamps, and coordinates."
    },
    {
      icon: ShieldAlert,
      q: "What do the different priority levels mean?",
      a: "Priority governs response times. Emergency (e.g. active gas leak, exposed grid lines) flags dispatcher dispatches within 24 hours. High priority targets 1-2 days. Medium defaults to 3-5 days, and Low priority targets 7-10 days."
    },
    {
      icon: HelpCircle,
      q: "Can I delete or modify a complaint after registering it?",
      a: "To ensure governance integrity, submitted complaints cannot be deleted or modified by citizens once verified. If details require updating, contact the municipal office and reference your docket ID."
    }
  ];

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Help & Support Console</h1>
        <p className="text-slate-500 text-sm mt-1">Access platform FAQs, understand municipal operational protocols, and view support contact options.</p>
      </div>

      {/* FAQs Accordion */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-3">
          Frequently Asked Questions
        </h3>

        <div className="divide-y divide-slate-150">
          {faqs.map((faq, idx) => {
            const Icon = faq.icon;
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="py-4 first:pt-0 last:pb-0">
                <button
                  type="button"
                  onClick={() => toggleAccordion(idx)}
                  className="w-full flex items-center justify-between gap-4 cursor-pointer text-left focus:outline-none group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-primary-50 group-hover:border-primary-100 group-hover:text-primary-600 transition-colors text-slate-400">
                      <Icon size={16} />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                      {faq.q}
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronUp size={16} className="text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="mt-3 pl-[42px] pr-4 animate-fadeIn">
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Support Card */}
      <div className="bg-slate-900 border border-slate-950 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_120%,#2563eb_0%,transparent_50%)] opacity-50"></div>
        <div className="relative z-10 space-y-4">
          <h3 className="text-base font-bold tracking-tight">Still need assistance?</h3>
          <p className="text-xs text-slate-300 leading-relaxed font-semibold max-w-lg">
            Our municipal dispatch helpdesk is available 24/7. For urgent city infrastructure hazards, please call the emergency hotline directly.
          </p>
          <div className="flex gap-6 text-xs font-bold pt-2">
            <div>
              <span className="text-[10px] text-cyan-400 uppercase tracking-wider block">Hotline</span>
              <span className="text-white text-sm">+1 (800) 555-0199</span>
            </div>
            <div className="border-l border-white/10 pl-6">
              <span className="text-[10px] text-cyan-400 uppercase tracking-wider block">Email Support</span>
              <span className="text-white text-sm">support@civicpulse.gov</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HelpPage;

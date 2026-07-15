import React, { useState } from 'react';
import { 
  Settings, Globe, Bell, Shield, Eye, 
  Check, Volume2, Moon, Sun, Smartphone 
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

export const SettingsPage = () => {
  const { showToast } = useAuth();

  // Settings states
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [pushAlerts, setPushAlerts] = useState(true);

  const [shareLocation, setShareLocation] = useState(true);
  const [publicDocket, setPublicDocket] = useState(true);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    showToast('success', 'Preferences saved successfully.');
  };

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">System Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Configure your personal preferences, visual interfaces, languages, and alert thresholds.</p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* Theme Settings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Sun size={16} className="text-slate-400" />
            <span>Theme Preferences</span>
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${theme === 'light' ? 'border-primary-500 bg-primary-50/30 text-primary-600 font-bold' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
              <Sun size={18} />
              <span className="text-xs">Light Mode</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${theme === 'dark' ? 'border-primary-500 bg-primary-50/30 text-primary-600 font-bold' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
              <Moon size={18} />
              <span className="text-xs">Dark Mode</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${theme === 'system' ? 'border-primary-500 bg-primary-50/30 text-primary-600 font-bold' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
              <Smartphone size={18} />
              <span className="text-xs">System Default</span>
            </button>
          </div>
        </div>

        {/* Localization Settings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Globe size={16} className="text-slate-400" />
            <span>Language & Localization</span>
          </h3>

          <div className="flex flex-col gap-1.5 max-w-xs">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-4 py-3 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none bg-slate-50/50 cursor-pointer"
            >
              <option value="en">English (US)</option>
              <option value="es">Español (Spanish)</option>
              <option value="fr">Français (French)</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </div>
        </div>

        {/* Notifications Checkboxes */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Bell size={16} className="text-slate-400" />
            <span>Alert & Notifications</span>
          </h3>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="mt-0.5 w-4.5 h-4.5 text-primary-600 border-slate-350 rounded focus:ring-primary-500 focus:ring-offset-0 accent-primary-600 transition-colors"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-700">Email Notifications</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-normal font-semibold">Receive monthly status logs and docket updates in your registered inbox.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="mt-0.5 w-4.5 h-4.5 text-primary-600 border-slate-350 rounded focus:ring-primary-500 focus:ring-offset-0 accent-primary-600 transition-colors"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-700">SMS / Text Notifications</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-normal font-semibold">Receive instant alerts regarding active officer dispatches on your mobile number.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={pushAlerts}
                onChange={(e) => setPushAlerts(e.target.checked)}
                className="mt-0.5 w-4.5 h-4.5 text-primary-600 border-slate-350 rounded focus:ring-primary-500 focus:ring-offset-0 accent-primary-600 transition-colors"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-700">Web Push Notifications</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-normal font-semibold">Display direct desktop browser popups immediately when updates occur.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Security & Privacy Settings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Shield size={16} className="text-slate-400" />
            <span>Privacy Controls</span>
          </h3>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={shareLocation}
                onChange={(e) => setShareLocation(e.target.checked)}
                className="mt-0.5 w-4.5 h-4.5 text-primary-600 border-slate-350 rounded focus:ring-primary-500 focus:ring-offset-0 accent-primary-600 transition-colors"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-700">GPS Location Telemetry</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-normal font-semibold">Allow CivicPulse to save coordinate records for geocoding accuracy checks.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={publicDocket}
                onChange={(e) => setPublicDocket(e.target.checked)}
                className="mt-0.5 w-4.5 h-4.5 text-primary-600 border-slate-350 rounded focus:ring-primary-500 focus:ring-offset-0 accent-primary-600 transition-colors"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-700">Public Docket Visibility</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-normal font-semibold">Make incident reports (excluding user details) publicly viewable in general search consoles.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-primary-500/10 focus:outline-none transition-colors"
        >
          <Check size={14} />
          <span>Save Preferences</span>
        </button>

      </form>
    </div>
  );
};

export default SettingsPage;

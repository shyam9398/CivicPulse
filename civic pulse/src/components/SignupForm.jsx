import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Loader2, UserPlus, Check, X } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import InputField from './InputField';
import PasswordInput from './PasswordInput';
import { validateEmail, validatePassword, validateConfirmPassword } from '../utils/validators';

export const SignupForm = ({ onToggleMode }) => {
  const { register } = useAuth();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Errors states
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: '',
  });

  // Password rules real-time check
  const [passChecks, setPassChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const [showPassRequirements, setShowPassRequirements] = useState(false);

  // Run validation whenever password changes
  useEffect(() => {
    if (password) {
      const res = validatePassword(password);
      setPassChecks(res.checks);
    } else {
      setPassChecks({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      });
    }
  }, [password]);

  // Form input changes
  const handleNameChange = (e) => {
    setName(e.target.value);
    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: validateEmail(val) || '' }));
    }
  };

  const handlePhoneChange = (e) => {
    // Basic phone formatter (digits only or standard characters)
    setPhone(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setShowPassRequirements(true);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: '' }));
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: '' }));
    }
  };

  // Blur validation triggers
  const handleEmailBlur = () => {
    setErrors((prev) => ({ ...prev, email: validateEmail(email) || '' }));
  };

  const handleConfirmPasswordBlur = () => {
    setErrors((prev) => ({ 
      ...prev, 
      confirmPassword: validateConfirmPassword(password, confirmPassword) || '' 
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Run complete form validations
    const nameErr = name.trim() ? '' : 'Full Name is required';
    const emailErr = validateEmail(email) || '';
    const passRes = validatePassword(password);
    const passErr = passRes.message || '';
    const confirmErr = validateConfirmPassword(password, confirmPassword) || '';
    const termsErr = agreeTerms ? '' : 'You must agree to the Terms & Conditions';

    if (nameErr || emailErr || passErr || confirmErr || termsErr) {
      setErrors({
        name: nameErr,
        email: emailErr,
        password: passErr,
        confirmPassword: confirmErr,
        agreeTerms: termsErr,
      });
      if (passErr) {
        setShowPassRequirements(true);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, phone, password, confirmPassword);
      // Wait for success toast to register and switch mode
      setTimeout(() => {
        onToggleMode();
      }, 1000);
    } catch (err) {
      console.error('Registration form error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const RequirementItem = ({ checked, text }) => (
    <div className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${checked ? 'text-emerald-600' : 'text-slate-400'}`}>
      {checked ? (
        <Check size={14} className="stroke-[3]" />
      ) : (
        <X size={14} className="opacity-60" />
      )}
      <span>{text}</span>
    </div>
  );

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 animate-fadeIn">
      {/* Name Input */}
      <InputField
        label="Full Name"
        id="signup-name"
        name="name"
        value={name}
        onChange={handleNameChange}
        placeholder="E.g. Dr. Sarah Jenkins"
        error={errors.name}
        icon={User}
        disabled={isSubmitting}
        required
      />

      {/* Email Input */}
      <InputField
        label="Email Address"
        id="signup-email"
        name="email"
        type="email"
        value={email}
        onChange={handleEmailChange}
        onBlur={handleEmailBlur}
        placeholder="sarah.j@civicpulse.gov"
        error={errors.email}
        icon={Mail}
        disabled={isSubmitting}
        required
      />

      {/* Phone Number Input (Optional) */}
      <InputField
        label="Phone Number (Optional)"
        id="signup-phone"
        name="phone"
        type="tel"
        value={phone}
        onChange={handlePhoneChange}
        placeholder="+1 (555) 000-0000"
        icon={Phone}
        disabled={isSubmitting}
      />

      {/* Password Input */}
      <PasswordInput
        label="Password"
        id="signup-password"
        name="password"
        value={password}
        onChange={handlePasswordChange}
        placeholder="Create a complex password"
        error={errors.password}
        disabled={isSubmitting}
        required
      />

      {/* Real-time Password Strength Requirements */}
      {showPassRequirements && (
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1.5 animate-fadeIn">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Password Requirements</p>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            <RequirementItem checked={passChecks.length} text="8+ characters" />
            <RequirementItem checked={passChecks.uppercase} text="Uppercase letter" />
            <RequirementItem checked={passChecks.lowercase} text="Lowercase letter" />
            <RequirementItem checked={passChecks.number} text="Contains number" />
            <RequirementItem checked={passChecks.special} text="Special character" />
          </div>
        </div>
      )}

      {/* Confirm Password Input */}
      <PasswordInput
        label="Confirm Password"
        id="signup-confirm-password"
        name="confirmPassword"
        value={confirmPassword}
        onChange={handleConfirmPasswordChange}
        onBlur={handleConfirmPasswordBlur}
        placeholder="Re-enter your password"
        error={errors.confirmPassword}
        disabled={isSubmitting}
        required
      />

      {/* Terms & Conditions Checkbox */}
      <div className="flex flex-col gap-1">
        <label className="flex items-start gap-2 cursor-pointer select-none text-xs sm:text-sm text-slate-500 hover:text-slate-700">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => {
              setAgreeTerms(e.target.checked);
              if (errors.agreeTerms) setErrors((prev) => ({ ...prev, agreeTerms: '' }));
            }}
            disabled={isSubmitting}
            className="mt-0.5 w-4.5 h-4.5 text-primary-600 border-slate-300 rounded focus:ring-primary-500 focus:ring-offset-0 accent-primary-600 transition-colors"
          />
          <span className="leading-snug">
            I agree to the{' '}
            <a 
              href="#terms" 
              onClick={(e) => { e.preventDefault(); alert('Terms & Conditions: Default platform usage rules apply.'); }}
              className="font-medium text-primary-600 hover:underline hover:text-primary-700 focus:outline-none"
            >
              Terms & Conditions
            </a>{' '}
            and{' '}
            <a 
              href="#privacy" 
              onClick={(e) => { e.preventDefault(); alert('Privacy Policy: CivicPulse secures your data with strict encryption protocols.'); }}
              className="font-medium text-primary-600 hover:underline hover:text-primary-700 focus:outline-none"
            >
              Privacy Policy
            </a>
          </span>
        </label>
        {errors.agreeTerms && (
          <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-0.5" role="alert">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.agreeTerms}
          </span>
        )}
      </div>

      {/* Action Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`
          w-full py-3 px-4 flex items-center justify-center gap-2 mt-2
          text-sm font-semibold text-white bg-primary-600 rounded-lg shadow-md hover:bg-primary-700
          focus:outline-none focus:ring-4 focus:ring-primary-500/20 active:bg-primary-800
          transition-all duration-200 cursor-pointer
          disabled:opacity-75 disabled:cursor-not-allowed
        `}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Creating Account...</span>
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </>
        )}
      </button>

      {/* Toggle back to Login */}
      <p className="text-center text-sm text-slate-500 pt-2">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onToggleMode}
          disabled={isSubmitting}
          className="font-semibold text-primary-600 hover:text-primary-700 hover:underline focus:outline-none cursor-pointer transition-colors"
        >
          Login
        </button>
      </p>
    </form>
  );
};

export default SignupForm;

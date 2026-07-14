import React, { useState } from 'react';
import { Mail, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import InputField from './InputField';
import PasswordInput from './PasswordInput';
import { validateEmail } from '../utils/validators';

export const LoginForm = ({ onToggleMode }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Error states
  const [errors, setErrors] = useState({ email: '', password: '' });

  // Handle input changes
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: validateEmail(val) || '' }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: '' }));
    }
  };

  // Input blur validation
  const handleEmailBlur = () => {
    setErrors((prev) => ({ ...prev, email: validateEmail(email) || '' }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Perform final validations
    const emailError = validateEmail(email);
    const passwordError = password ? '' : 'Password is required';

    if (emailError || passwordError) {
      setErrors({
        email: emailError || '',
        password: passwordError,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      // Success toast is handled globally in AuthContext
      navigate('/dashboard');
    } catch (err) {
      // Errors are toasted globally, but we can set form-specific feedback if needed
      console.error('Login form error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5 animate-fadeIn">
      {/* Email Input */}
      <InputField
        label="Email Address"
        id="login-email"
        name="email"
        type="email"
        value={email}
        onChange={handleEmailChange}
        onBlur={handleEmailBlur}
        placeholder="you@civicpulse.gov"
        error={errors.email}
        icon={Mail}
        disabled={isSubmitting}
        required
      />

      {/* Password Input */}
      <PasswordInput
        label="Password"
        id="login-password"
        name="password"
        value={password}
        onChange={handlePasswordChange}
        placeholder="Enter your security password"
        error={errors.password}
        disabled={isSubmitting}
        required
      />

      {/* Remember Me and Forgot Password */}
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <label className="flex items-center gap-2 cursor-pointer select-none text-slate-500 hover:text-slate-700">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isSubmitting}
            className="w-4.5 h-4.5 text-primary-600 border-slate-300 rounded focus:ring-primary-500 focus:ring-offset-0 accent-primary-600 transition-colors"
          />
          <span>Remember me</span>
        </label>

        <a 
          href="#forgot-password" 
          onClick={(e) => {
            e.preventDefault();
            // Just display a dummy message since it's mockup
            alert('Forgot Password: Password reset instructions will be sent to ' + (email || 'your email.'));
          }}
          className="font-medium text-primary-600 hover:text-primary-700 focus:underline focus:outline-none transition-colors"
        >
          Forgot Password?
        </a>
      </div>

      {/* Action Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`
          w-full py-3 px-4 flex items-center justify-center gap-2
          text-sm font-semibold text-white bg-primary-600 rounded-lg shadow-md hover:bg-primary-700
          focus:outline-none focus:ring-4 focus:ring-primary-500/20 active:bg-primary-800
          transition-all duration-200 cursor-pointer
          disabled:opacity-75 disabled:cursor-not-allowed
        `}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Authenticating Account...</span>
          </>
        ) : (
          <>
            <span>Login to Portal</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Divider */}
      <div className="relative my-6 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <span className="relative px-3 bg-white text-xs font-semibold uppercase tracking-wider text-slate-400 select-none">
          OR
        </span>
      </div>

      {/* Toggle to Signup */}
      <p className="text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onToggleMode}
          disabled={isSubmitting}
          className="font-semibold text-primary-600 hover:text-primary-700 hover:underline focus:outline-none cursor-pointer transition-colors"
        >
          Sign Up
        </button>
      </p>
    </form>
  );
};

export default LoginForm;

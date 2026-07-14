/**
 * Validates an email address format.
 * @param {string} email 
 * @returns {string|null} Error message or null if valid.
 */
export const validateEmail = (email) => {
  if (!email) {
    return 'Email address is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email address format';
  }
  return null;
};

/**
 * Validates a password against security rules:
 * - Minimum 8 characters
 * - One uppercase letter
 * - One lowercase letter
 * - One number
 * - One special character
 * @param {string} password 
 * @returns {object} Validation status with checks and error message
 */
export const validatePassword = (password) => {
  if (!password) {
    return {
      isValid: false,
      message: 'Password is required',
      checks: {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      }
    };
  }

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const isValid = Object.values(checks).every(Boolean);
  
  let message = null;
  if (!isValid) {
    const missing = [];
    if (!checks.length) missing.push('8+ characters');
    if (!checks.uppercase) missing.push('an uppercase letter');
    if (!checks.lowercase) missing.push('a lowercase letter');
    if (!checks.number) missing.push('a number');
    if (!checks.special) missing.push('a special character');
    message = `Password must contain at least ${missing.join(', ')}`;
  }

  return { isValid, message, checks };
};

/**
 * Validates that the confirm password matches the password.
 * @param {string} password 
 * @param {string} confirmPassword 
 * @returns {string|null} Error message or null if they match.
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

/**
 * JanSamadhan – Input Validation Utilities
 * Validates registration and login payloads before database operations.
 */

const validateEmail = (email) => {
  const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
  return typeof email === 'string' && re.test(email.trim());
};

const validatePhone = (phone) => {
  // Accepts standard Indian (10 digits) and international numbers (+91...)
  const re = /^[0-9+() -]{7,20}$/;
  return typeof phone === 'string' && re.test(phone.trim());
};

const validatePasswordStrength = (password) => {
  if (typeof password !== 'string') return false;
  // Minimum 6 characters
  return password.length >= 6;
};

const validateRegistrationInput = ({
  name,
  email,
  phone,
  password,
  accountType,
  role,
  city,
  departmentName,
  organizationName,
  designation,
  areaOfExpertise,
  industryType,
}) => {
  const errors = [];

  const targetRole = (role || accountType || 'CITIZEN').toUpperCase();

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Full name must be at least 2 characters long');
  }

  if (!email || !validateEmail(email)) {
    errors.push('A valid email address is required');
  }

  if (phone && phone.trim().length > 0 && !validatePhone(phone)) {
    errors.push('A valid phone number is required');
  }

  if (!password || !validatePasswordStrength(password)) {
    errors.push('Password must be at least 6 characters long');
  }

  // Account-type specific checks
  if (targetRole === 'GOVERNMENT') {
    if (!departmentName && !organizationName) {
      errors.push('Government department and organization are required');
    }
  } else if (targetRole === 'UNIVERSITY') {
    if (!organizationName) {
      errors.push('University name is required');
    }
  } else if (targetRole === 'INDUSTRY') {
    if (!organizationName) {
      errors.push('Company name is required');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateLoginInput = ({ email, password }) => {
  const errors = [];

  if (!email || !validateEmail(email)) {
    errors.push('A valid email address is required');
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('Password is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateEmail,
  validatePhone,
  validatePasswordStrength,
  validateRegistrationInput,
  validateLoginInput,
};


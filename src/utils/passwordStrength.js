/**
 * Password Strength Checker Utility
 * Evaluates password strength based on multiple criteria
 */

/**
 * Check password strength and return detailed analysis
 * @param {string} password - Password to check
 * @returns {Object} Strength analysis with score, level, feedback, and criteria
 */
export const checkPasswordStrength = (password) => {
  if (!password) {
    return {
      score: 0,
      level: 'none',
      color: '#d9d9d9',
      percentage: 0,
      feedback: [],
      criteria: {
        length: false,
        lowercase: false,
        uppercase: false,
        number: false,
        special: false
      }
    };
  }

  const criteria = {
    length: password.length >= 8,
    minLength: password.length >= 12,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password)
  };

  // Calculate score (0-100)
  let score = 0;
  const feedback = [];

  // Length scoring (30 points)
  if (criteria.length) {
    score += 15;
  } else {
    feedback.push('At least 8 characters required');
  }

  if (criteria.minLength) {
    score += 15;
  } else if (criteria.length) {
    feedback.push('12+ characters for better strength');
  }

  // Character type scoring (70 points total)
  if (criteria.lowercase) {
    score += 15;
  } else {
    feedback.push('Add lowercase letters (a-z)');
  }

  if (criteria.uppercase) {
    score += 15;
  } else {
    feedback.push('Add uppercase letters (A-Z)');
  }

  if (criteria.number) {
    score += 20;
  } else {
    feedback.push('Add numbers (0-9)');
  }

  if (criteria.special) {
    score += 20;
  } else {
    feedback.push('Add special characters (@$!%*?&)');
  }

  // Determine strength level
  let level, color, label;
  if (score < 40) {
    level = 'weak';
    color = '#ff4d4f';
    label = 'Weak';
  } else if (score < 70) {
    level = 'medium';
    color = '#faad14';
    label = 'Medium';
  } else if (score < 90) {
    level = 'good';
    color = '#52c41a';
    label = 'Good';
  } else {
    level = 'strong';
    color = '#389e0d';
    label = 'Strong';
  }

  return {
    score,
    level,
    color,
    label,
    percentage: score,
    feedback,
    criteria,
    isValid: criteria.length && criteria.lowercase && criteria.uppercase && criteria.number && criteria.special
  };
};

/**
 * Get password requirements text
 * @returns {Array} List of password requirements
 */
export const getPasswordRequirements = () => {
  return [
    'At least 8 characters long',
    'Contains lowercase letter (a-z)',
    'Contains uppercase letter (A-Z)',
    'Contains number (0-9)',
    'Contains special character (@$!%*?&)'
  ];
};

/**
 * Validate password meets minimum requirements
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
export const validatePassword = (password) => {
  const strength = checkPasswordStrength(password);

  return {
    valid: strength.isValid,
    message: strength.isValid
      ? 'Password meets all requirements'
      : 'Password does not meet requirements',
    feedback: strength.feedback
  };
};

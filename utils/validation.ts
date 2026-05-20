export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email address is required.' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }
  return { isValid: true, error: null };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required.' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long.' };
  }
  return { isValid: true, error: null };
};

export const validatePhone = (phone: string): ValidationResult => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required.' };
  }
  // Matches simple international / local formats
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, error: 'Please enter a valid phone number (e.g. +1234567890).' };
  }
  return { isValid: true, error: null };
};

export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required.` };
  }
  return { isValid: true, error: null };
};

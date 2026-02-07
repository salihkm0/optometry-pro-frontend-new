export const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
export const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Invalid email address';
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return 'Phone number is required';
  if (!phoneRegex.test(phone)) return 'Invalid phone number';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  // if (!passwordRegex.test(password)) return 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character';
  return null;
};

export const validateRequired = (value, fieldName) => {
  if (!value || value.toString().trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateNumber = (value, fieldName, min = null, max = null) => {
  if (value === undefined || value === null || value === '') return null;
  
  const num = Number(value);
  if (isNaN(num)) return `${fieldName} must be a number`;
  if (min !== null && num < min) return `${fieldName} must be at least ${min}`;
  if (max !== null && num > max) return `${fieldName} must be at most ${max}`;
  return null;
};

export const validateDate = (date) => {
  if (!date) return null;
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';
  
  const today = new Date();
  if (d > today) return 'Date cannot be in the future';
  return null;
};

export const validateAge = (age) => {
  if (!age) return null;
  return validateNumber(age, 'Age', 0, 150);
};
// Utility functions for the billing system

export const generateInvoiceNumber = (prefix = 'INV', count) => {
  const paddedCount = String(count).padStart(3, '0');
  return `${prefix}-${paddedCount}`;
};

export const generateQuotationNumber = (prefix = 'QUO', count) => {
  const paddedCount = String(count).padStart(3, '0');
  return `${prefix}-${paddedCount}`;
};

export const calculateTax = (amount, taxRate) => {
  return (amount * taxRate) / 100;
};

export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.length >= 10;
};

export const validateGSTIN = (gstin) => {
  if (!gstin) return true; // Optional field
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin);
};

export const validatePAN = (pan) => {
  if (!pan) return true; // Optional field
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
};

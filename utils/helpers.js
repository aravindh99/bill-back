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

// Returns the financial year code, e.g., 2025-2026 => '2526'
export function getFinancialYearCode(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  // Financial year in India: April to March
  let startYear = month >= 4 ? year : year - 1;
  let endYear = startYear + 1;
  return `${String(startYear).slice(-2)}${String(endYear).slice(-2)}`;
}

/**
 * Generates a document number in the format XX-2526-TYPE-SEQ
 * @param {string} companyCode - 2-letter company code
 * @param {string} yearCode - 4-digit year code (e.g., '2526')
 * @param {string} typeCode - Document type code (IV, QO, PIV, PO)
 * @param {number} sequence - Sequence number (1-based)
 * @returns {string}
 */
export function generateDocumentNumber(companyCode, yearCode, typeCode, sequence) {
  const paddedSeq = String(sequence).padStart(3, '0');
  return `${companyCode}-${yearCode}-${typeCode}-${paddedSeq}`;
}

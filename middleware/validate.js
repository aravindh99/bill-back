import { validateEmail, validatePhone, validateGSTIN, validatePAN } from '../utils/helpers.js';

export const validateClient = (req, res, next) => {
  const { companyName, email, phone, gstin, pan } = req.body;

  if (!companyName) {
    return res.status(400).json({ message: 'Company name is required' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (!validatePhone(phone)) {
    return res.status(400).json({ message: 'Invalid phone number' });
  }

  if (gstin && !validateGSTIN(gstin)) {
    return res.status(400).json({ message: 'Invalid GSTIN format' });
  }

  if (pan && !validatePAN(pan)) {
    return res.status(400).json({ message: 'Invalid PAN format' });
  }

  next();
};

export const validateInvoice = (req, res, next) => {
  const { clientId, invoiceNo, invoiceDate, dueDate, amount, items } = req.body;

  if (!clientId || !invoiceNo || !invoiceDate || !dueDate || !amount) {
    return res.status(400).json({ message: 'Required fields missing' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Invoice must have at least one item' });
  }

  if (parseFloat(amount) <= 0) {
    return res.status(400).json({ message: 'Invoice amount must be greater than 0' });
  }

  next();
};

export const validateUser = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  next();
};

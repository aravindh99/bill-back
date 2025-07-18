import express from 'express';
import { 
  createProformaInvoice, 
  getAllProformaInvoices, 
  getProformaInvoiceById, 
  updateProformaInvoice,
  deleteProformaInvoice,
  getProformaInvoicesByClient,
  getProformaInvoicesByQuotation
} from '../controllers/proformaController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createProformaInvoice);
router.get('/', protect, getAllProformaInvoices);
router.get('/:id', protect, getProformaInvoiceById);
router.put('/:id', protect, updateProformaInvoice);
router.delete('/:id', protect, deleteProformaInvoice);
router.get('/client/:clientId', protect, getProformaInvoicesByClient);
router.get('/quotation/:quotationId', protect, getProformaInvoicesByQuotation);

export default router; 
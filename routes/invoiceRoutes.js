import express from 'express';
import { createInvoice,getAllInvoices,
    getInvoiceById,updateInvoice,deleteInvoice,
    getInvoicesByClient,
    getInvoicesByProforma } from '../controllers/invoiceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createInvoice);
router.get('/', protect, getAllInvoices);
router.get('/:id', protect, getInvoiceById);
router.put('/:id', protect, updateInvoice);
router.delete('/:id', protect, deleteInvoice);
router.get('/client/:clientId', protect, getInvoicesByClient);
router.get('/proforma/:proformaInvoiceId', protect, getInvoicesByProforma);

export default router;


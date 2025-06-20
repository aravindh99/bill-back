import express from 'express';
import { createQuotation, getAllQuotations,
    getQuotationById,
    updateQuotation,
    deleteQuotation } from '../controllers/quotationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createQuotation);
router.get('/', protect, getAllQuotations);
router.get('/:id', protect, getQuotationById);
router.put('/:id', protect, updateQuotation);
router.delete('/:id', protect, deleteQuotation);

export default router;

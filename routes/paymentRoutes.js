import express from 'express';
import { 
  createPayment, 
  getAllPayments, 
  getPaymentById, 
  updatePayment,
  deletePayment,
  getPaymentsByDateRange,
  getPaymentsTotal,
  getPaymentsByClient
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createPayment);
router.get('/', protect, getAllPayments);
router.get('/total', protect, getPaymentsTotal);
router.get('/date-range', protect, getPaymentsByDateRange);
router.get('/:id', protect, getPaymentById);
router.put('/:id', protect, updatePayment);
router.delete('/:id', protect, deletePayment);
router.get('/client/:clientId', protect, getPaymentsByClient);

export default router; 
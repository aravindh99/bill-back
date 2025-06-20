import express from 'express';
import { 
  createDeliveryChalan, 
  getAllDeliveryChalans, 
  getDeliveryChalanById, 
  updateDeliveryChalan,
  deleteDeliveryChalan,
  getDeliveryChalansByClient,
  getDeliveryChalansByInvoice
} from '../controllers/deliveryChalanController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createDeliveryChalan);
router.get('/', protect, getAllDeliveryChalans);
router.get('/:id', protect, getDeliveryChalanById);
router.put('/:id', protect, updateDeliveryChalan);
router.delete('/:id', protect, deleteDeliveryChalan);
router.get('/client/:clientId', protect, getDeliveryChalansByClient);
router.get('/invoice/:invoiceId', protect, getDeliveryChalansByInvoice);

export default router; 
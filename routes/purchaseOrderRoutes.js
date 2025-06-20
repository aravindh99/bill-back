import express from 'express';
import { 
  createPurchaseOrder, 
  getAllPurchaseOrders, 
  getPurchaseOrderById, 
  updatePurchaseOrder,
  deletePurchaseOrder,
  getPurchaseOrdersByVendor
} from '../controllers/purchaseOrderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createPurchaseOrder);
router.get('/', protect, getAllPurchaseOrders);
router.get('/:id', protect, getPurchaseOrderById);
router.put('/:id', protect, updatePurchaseOrder);
router.delete('/:id', protect, deletePurchaseOrder);
router.get('/vendor/:vendorId', protect, getPurchaseOrdersByVendor);

export default router; 
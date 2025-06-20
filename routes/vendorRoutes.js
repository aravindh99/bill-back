import express from 'express';
import { 
  createVendor, 
  getAllVendors, 
  getVendorById, 
  updateVendor,
  deleteVendor 
} from '../controllers/vendorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createVendor);
router.get('/', protect, getAllVendors);
router.get('/:id', protect, getVendorById);
router.put('/:id', protect, updateVendor);
router.delete('/:id', protect, deleteVendor);

export default router; 
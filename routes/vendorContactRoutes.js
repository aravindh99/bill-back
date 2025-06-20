import express from 'express';
import {
  createVendorContact,
  getAllVendorContacts,
  updateVendorContact,
  deleteVendorContact,
} from '../controllers/vendorContactController.js';

const router = express.Router();

router.post('/', createVendorContact);
router.get('/', getAllVendorContacts);
router.put('/:id', updateVendorContact);
router.delete('/:id', deleteVendorContact);

export default router; 
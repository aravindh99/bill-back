import express from 'express';
import { 
  createProfile, 
  getAllProfiles, 
  getProfileById, 
  updateProfile,
  deleteProfile,
  addBankDetail,
  updateBankDetail,
  deleteBankDetail,
  getCurrentProfile
} from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Profile routes
router.post('/', protect, createProfile);
router.get('/', protect, getAllProfiles);
router.get('/current', protect, getCurrentProfile);
router.get('/:id', protect, getProfileById);
router.put('/:id', protect, updateProfile);
router.delete('/:id', protect, deleteProfile);

// Bank detail routes
router.post('/:profileId/bank-details', protect, addBankDetail);
router.put('/bank-details/:id', protect, updateBankDetail);
router.delete('/bank-details/:id', protect, deleteBankDetail);

export default router; 
import express from 'express';
import {
  createBankDetail,
  getAllBankDetails,
  getBankDetailById,
  updateBankDetail,
  deleteBankDetail,
} from '../controllers/bankDetailController.js';

const router = express.Router();

router.post('/', createBankDetail);
router.get('/', getAllBankDetails);
router.get('/:id', getBankDetailById);
router.put('/:id', updateBankDetail);
router.delete('/:id', deleteBankDetail);

export default router;

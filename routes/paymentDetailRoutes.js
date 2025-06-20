import express from 'express';
import {
  createPaymentDetail,
  getAllPaymentDetails,
  deletePaymentDetail,
} from '../controllers/paymentDetailController.js';

const router = express.Router();

router.post('/', createPaymentDetail);
router.get('/', getAllPaymentDetails);
router.delete('/:id', deletePaymentDetail);

export default router;

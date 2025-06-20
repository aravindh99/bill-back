import express from 'express';
import { 
  createDebitNote, 
  getAllDebitNotes, 
  getDebitNoteById, 
  updateDebitNote,
  deleteDebitNote,
  getDebitNotesByClient,
  getDebitNotesByInvoice,
  getDebitNotesTotal
} from '../controllers/debitNoteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createDebitNote);
router.get('/', protect, getAllDebitNotes);
router.get('/total', protect, getDebitNotesTotal);
router.get('/:id', protect, getDebitNoteById);
router.put('/:id', protect, updateDebitNote);
router.delete('/:id', protect, deleteDebitNote);
router.get('/client/:clientId', protect, getDebitNotesByClient);
router.get('/invoice/:invoiceId', protect, getDebitNotesByInvoice);

export default router; 
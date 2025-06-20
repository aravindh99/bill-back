import express from 'express';
import { 
  createCreditNote, 
  getAllCreditNotes, 
  getCreditNoteById, 
  updateCreditNote,
  deleteCreditNote,
  getCreditNotesByClient,
  getCreditNotesByInvoice,
  getCreditNotesTotal
} from '../controllers/creditNoteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createCreditNote);
router.get('/', protect, getAllCreditNotes);
router.get('/total', protect, getCreditNotesTotal);
router.get('/:id', protect, getCreditNoteById);
router.put('/:id', protect, updateCreditNote);
router.delete('/:id', protect, deleteCreditNote);
router.get('/client/:clientId', protect, getCreditNotesByClient);
router.get('/invoice/:invoiceId', protect, getCreditNotesByInvoice);

export default router; 
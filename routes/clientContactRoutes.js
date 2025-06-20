import express from 'express';
import {
  createClientContact,
  getAllClientContacts,
  updateClientContact,
  deleteClientContact
} from '../controllers/clientContactController.js';

const router = express.Router();

router.post('/', createClientContact);
router.get('/', getAllClientContacts);
router.put('/:id', updateClientContact);
router.delete('/:id', deleteClientContact);

export default router;

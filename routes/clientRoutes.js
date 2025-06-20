import express from 'express';
import { createClient, getAllClients, updateClient, deleteClient } from '../controllers/clientController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();


router.get('/', protect, getAllClients);
router.post('/', protect, createClient);
router.put('/:id', protect, updateClient);  
router.delete('/:id', protect, deleteClient);
export default router;

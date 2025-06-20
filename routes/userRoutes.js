import express from 'express';
import { registerUser, loginUser } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';





const router = express.Router();

router.post('/', registerUser);
router.post('/login', loginUser);

router.get('/me', protect, (req, res) => {
    res.json({ message: 'Secure route', user: req.user });
  });
  

export default router;

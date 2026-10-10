import { Router } from 'express';
import { register, login, getMe, getLoginAccounts } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/accounts', getLoginAccounts);
router.get('/me', protect, getMe);

export default router;

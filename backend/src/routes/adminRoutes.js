import { Router } from 'express';
import {
  getAdminStats,
  getAdminDoctors,
  getAdminPatients,
  toggleDoctorStatus,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all admin routes for admin role only
router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/doctors', getAdminDoctors);
router.get('/patients', getAdminPatients);
router.patch('/doctors/:id/toggle-status', toggleDoctorStatus);

export default router;

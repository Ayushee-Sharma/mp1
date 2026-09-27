import { Router } from 'express';
import {
  getDoctors,
  getDoctorById,
  getAvailableSlots,
  updateDoctorProfile,
  updateDoctorAvailability,
} from '../controllers/doctorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

// Public doctor endpoints
router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/available-slots', getAvailableSlots);

// Protected doctor management endpoints
router.put('/profile', protect, authorize('doctor'), updateDoctorProfile);
router.put('/availability', protect, authorize('doctor'), updateDoctorAvailability);

export default router;

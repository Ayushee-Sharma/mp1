import { Router } from 'express';
import {
  createPrescription,
  getMyPrescriptions,
  getPrescriptionById,
} from '../controllers/prescriptionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(authorize('patient', 'doctor'), getMyPrescriptions)
  .post(authorize('doctor'), createPrescription);

router.get('/:id', authorize('patient', 'doctor'), getPrescriptionById);

export default router;

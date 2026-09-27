import { Router } from 'express';
import { getHospitals, getHospitalById } from '../controllers/hospitalController.js';

const router = Router();

router.get('/', getHospitals);
router.get('/:id', getHospitalById);

export default router;

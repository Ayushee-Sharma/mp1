import { Router } from 'express';
import authRoutes from './authRoutes.js';
import doctorRoutes from './doctorRoutes.js';
import appointmentRoutes from './appointmentRoutes.js';
import hospitalRoutes from './hospitalRoutes.js';
import adminRoutes from './adminRoutes.js';
import prescriptionRoutes from './prescriptionRoutes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Reaching the Unreached API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// Mounted domain routes
router.use('/auth', authRoutes);
router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/hospitals', hospitalRoutes);
router.use('/admin', adminRoutes);

export default router;

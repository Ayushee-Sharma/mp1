import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import Hospital from '../models/Hospital.js';

/**
 * @desc    Get dashboard metrics for administrative oversight
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
export const getAdminStats = async (req, res) => {
  try {
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      totalHospitals,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments,
      recentAppointments,
    ] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Hospital.countDocuments(),
      Appointment.countDocuments({ status: 'Pending' }),
      Appointment.countDocuments({ status: 'Confirmed' }),
      Appointment.countDocuments({ status: 'Completed' }),
      Appointment.countDocuments({ status: 'Cancelled' }),
      Appointment.find()
        .populate('doctor', 'name specialization hospital')
        .populate('patient', 'name email phone')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    const hospitals = await Hospital.find();
    const totalBeds = hospitals.reduce((acc, h) => acc + (h.totalBeds || 0), 0);
    const availableBeds = hospitals.reduce((acc, h) => acc + (h.availableBeds || 0), 0);

    return res.status(200).json({
      success: true,
      stats: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        totalHospitals,
        totalBeds,
        availableBeds,
        statusBreakdown: {
          pending: pendingAppointments,
          confirmed: confirmedAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments,
        },
      },
      recentAppointments,
    });
  } catch (error) {
    console.error('[Admin Stats Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve administrative statistics',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all registered doctors for admin management
 * @route   GET /api/admin/doctors
 * @access  Private (Admin only)
 */
export const getAdminDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('user', 'email phone createdAt').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve doctors', error: error.message });
  }
};

/**
 * @desc    Get all registered patients for admin management
 * @route   GET /api/admin/patients
 * @access  Private (Admin only)
 */
export const getAdminPatients = async (req, res) => {
  try {
    const patients = await Patient.find().populate('user', 'email phone createdAt').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: patients.length, patients });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve patients', error: error.message });
  }
};

/**
 * @desc    Toggle doctor active status (Admin only)
 * @route   PATCH /api/admin/doctors/:id/toggle-status
 * @access  Private (Admin only)
 */
export const toggleDoctorStatus = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    doctor.isActive = !doctor.isActive;
    await doctor.save();

    return res.status(200).json({
      success: true,
      message: `Doctor status updated to ${doctor.isActive ? 'Active' : 'Inactive'}`,
      doctor,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to toggle status', error: error.message });
  }
};

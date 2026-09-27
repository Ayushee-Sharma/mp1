import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Prescription from '../models/Prescription.js';

const normalizeMedicine = (medicine) => {
  if (!medicine || !medicine.name || !medicine.dosage || !medicine.frequency || !medicine.duration) {
    throw new Error('Each medicine entry must include name, dosage, frequency, and duration');
  }

  return {
    name: String(medicine.name).trim(),
    dosage: String(medicine.dosage).trim(),
    frequency: String(medicine.frequency).trim(),
    duration: String(medicine.duration).trim(),
  };
};

export const createPrescription = async (req, res) => {
  try {
    const { appointmentId, diagnosis, medications, instructions, notes, followUpDate } = req.body;

    if (!appointmentId || !diagnosis || !Array.isArray(medications) || medications.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Prescription requires appointment, diagnosis, and at least one medicine.',
      });
    }

    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found for this account.',
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    if (appointment.doctor.toString() !== doctorProfile._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Doctors can only create prescriptions for their own patients.',
      });
    }

    if (!['Confirmed', 'Completed'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: 'A prescription can only be created for a confirmed or completed appointment.',
      });
    }

    const existingPrescription = await Prescription.findOne({ appointment: appointment._id });
    if (existingPrescription) {
      return res.status(409).json({
        success: false,
        message: 'A prescription already exists for this appointment.',
      });
    }

    const normalizedMedicines = medications.map(normalizeMedicine);

    const prescription = await Prescription.create({
      patient: appointment.patient,
      doctor: doctorProfile._id,
      appointment: appointment._id,
      diagnosis: String(diagnosis).trim(),
      medications: normalizedMedicines,
      instructions: instructions ? String(instructions).trim() : '',
      notes: notes ? String(notes).trim() : '',
      followUpDate: followUpDate ? String(followUpDate).trim() : '',
    });

    return res.status(201).json({
      success: true,
      message: 'Prescription created successfully.',
      prescription,
    });
  } catch (error) {
    console.error('[Create Prescription Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create prescription.',
    });
  }
};

export const getMyPrescriptions = async (req, res) => {
  try {
    if (!['patient', 'doctor'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only patients and doctors can access prescriptions.',
      });
    }

    let query = {};

    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ user: req.user._id });
      if (!doctorProfile) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile not found.',
        });
      }
      query.doctor = doctorProfile._id;
    }

    const prescriptions = await Prescription.find(query)
      .populate('doctor', 'name specialization hospital location')
      .populate('patient', 'name email phone')
      .populate('appointment', 'date time status reason')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    console.error('[Get Prescriptions Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve prescriptions.',
      error: error.message,
    });
  }
};

export const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('doctor', 'name specialization hospital location')
      .populate('patient', 'name email phone')
      .populate('appointment', 'date time status reason');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found.',
      });
    }

    if (!['patient', 'doctor'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only patients and doctors can access prescriptions.',
      });
    }

    if (req.user.role === 'patient' && prescription.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this prescription.',
      });
    }

    if (req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ user: req.user._id });
      if (!doctorProfile || prescription.doctor._id.toString() !== doctorProfile._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only view your own prescriptions.',
        });
      }
    }

    return res.status(200).json({
      success: true,
      prescription,
    });
  } catch (error) {
    console.error('[Get Prescription Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve prescription details.',
      error: error.message,
    });
  }
};

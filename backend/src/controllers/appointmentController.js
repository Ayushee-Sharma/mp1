import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';

/**
 * @desc    Create a new appointment with double-booking prevention
 * @route   POST /api/appointments
 * @access  Private (Patient only or authenticated user)
 */
export const createAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      date,
      time,
      reason,
      patientName,
      patientPhone,
      patientAge,
      patientGender,
      notes,
    } = req.body;

    if (!doctorId || !date || !time || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide doctor, date, time slot, and reason for appointment.',
      });
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'The selected doctor was not found or is no longer registered.',
      });
    }

    // CRITICAL REQUIREMENT: PREVENT DOUBLE BOOKING
    // Check if an active appointment already exists for this Doctor + Date + Time
    const existingAppointment = await Appointment.findOne({
      doctor: doctor._id,
      date: date.trim(),
      time: time.trim(),
      status: { $in: ['Pending', 'Confirmed'] },
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: 'This appointment slot is no longer available. Please choose another time.',
      });
    }

    // Resolve patient details
    let resolvedName = patientName;
    let resolvedPhone = patientPhone;
    let resolvedAge = patientAge;
    let resolvedGender = patientGender;

    if (!resolvedName || !resolvedPhone) {
      const patientProfile = await Patient.findOne({ user: req.user._id });
      resolvedName = resolvedName || (patientProfile ? patientProfile.name : req.user.name);
      resolvedPhone = resolvedPhone || (patientProfile ? patientProfile.phone : req.user.phone);
      resolvedAge = resolvedAge || (patientProfile ? patientProfile.age : undefined);
      resolvedGender = resolvedGender || (patientProfile ? patientProfile.gender : undefined);
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctor._id,
      patientName: resolvedName || 'Anonymous Patient',
      patientPhone: resolvedPhone || 'N/A',
      patientAge: resolvedAge,
      patientGender: resolvedGender,
      date: date.trim(),
      time: time.trim(),
      reason: reason.trim(),
      notes: notes || '',
      status: 'Pending',
    });

    // Populate doctor details for immediate confirmation receipt
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctor', 'name specialization qualification hospital location phone consultationFee profileImage')
      .populate('patient', 'name email phone');

    return res.status(201).json({
      success: true,
      message: 'Appointment successfully booked!',
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error('[Create Appointment Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
      error: error.message,
    });
  }
};

/**
 * @desc    Get appointments list based on user role (Patient sees theirs, Doctor sees their patients, Admin sees all)
 * @route   GET /api/appointments
 * @access  Private
 */
export const getAppointments = async (req, res) => {
  try {
    let query = {};
    const { status, date } = req.query;

    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ user: req.user._id });
      if (!doctorProfile) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile not found for this account',
        });
      }
      query.doctor = doctorProfile._id;
    } else if (req.user.role === 'admin') {
      // Admin sees everything
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (date) {
      query.date = date;
    }

    const appointments = await Appointment.find(query)
      .populate('doctor', 'name specialization qualification hospital location phone consultationFee profileImage')
      .populate('patient', 'name email phone')
      .sort({ date: -1, time: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error('[Get Appointments Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve appointments',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single appointment details
 * @route   GET /api/appointments/:id
 * @access  Private
 */
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor', 'name specialization qualification hospital location phone consultationFee profileImage')
      .populate('patient', 'name email phone');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Role-based access check
    if (req.user.role === 'patient' && appointment.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this appointment record',
      });
    }

    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor || appointment.doctor._id.toString() !== doctor._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access to this appointment record',
        });
      }
    }

    return res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve appointment details',
      error: error.message,
    });
  }
};

/**
 * @desc    Update appointment status (Pending, Confirmed, Rejected, Cancelled, Completed)
 * @route   PUT /api/appointments/:id/status
 * @access  Private
 */
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'Rejected'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Permissions check
    if (req.user.role === 'patient') {
      // Patients are only allowed to cancel their own appointments
      if (appointment.patient.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only manage your own appointments',
        });
      }
      if (status !== 'Cancelled') {
        return res.status(403).json({
          success: false,
          message: 'Patients may only cancel appointments',
        });
      }
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only update appointments scheduled with you',
        });
      }
    }

    appointment.status = status;
    if (notes !== undefined) {
      appointment.notes = notes;
    }

    const updated = await appointment.save();

    const populatedAppointment = await Appointment.findById(updated._id)
      .populate('doctor', 'name specialization qualification hospital location phone consultationFee profileImage')
      .populate('patient', 'name email phone');

    return res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}`,
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error('[Update Appointment Status Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update appointment status',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete / Cancel an appointment
 * @route   DELETE /api/appointments/:id
 * @access  Private
 */
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Role verification
    if (req.user.role === 'patient' && appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete or cancel your own appointment',
      });
    }

    // Mark as cancelled or remove
    appointment.status = 'Cancelled';
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: 'Appointment has been cancelled successfully',
      appointmentId: appointment._id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment',
      error: error.message,
    });
  }
};

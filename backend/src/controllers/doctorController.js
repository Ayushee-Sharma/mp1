import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';

/**
 * Helper to get day name from YYYY-MM-DD string
 */
const getDayName = (dateStr) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  return days[dateObj.getDay()];
};

/**
 * @desc    Get all active doctors with search and filter capabilities
 * @route   GET /api/doctors
 * @access  Public
 */
export const getDoctors = async (req, res) => {
  try {
    const { search, specialization, location } = req.query;

    let query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { hospital: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
      ];
    }

    if (specialization && specialization !== 'All') {
      query.specialization = specialization;
    }

    if (location && location !== 'All') {
      query.location = { $regex: location, $options: 'i' };
    }

    const doctors = await Doctor.find(query)
      .select('-__v')
      .sort({ rating: -1, experience: -1 });

    // Fetch distinct specializations for filter tabs in frontend
    const specializations = await Doctor.distinct('specialization', { isActive: true });

    return res.status(200).json({
      success: true,
      count: doctors.length,
      specializations,
      doctors,
    });
  } catch (error) {
    console.error('[Get Doctors Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve doctors list',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single doctor details by ID
 * @route   GET /api/doctors/:id
 * @access  Public
 */
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', 'name email phone');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    return res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve doctor details',
      error: error.message,
    });
  }
};

/**
 * @desc    Get real-time available time slots for a doctor on a specific date
 * @route   GET /api/doctors/:id/available-slots
 * @access  Public
 */
export const getAvailableSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query; // Expecting YYYY-MM-DD

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a date in YYYY-MM-DD format as a query parameter',
      });
    }

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    const dayName = getDayName(date);
    const daySchedule = doctor.availability.find(
      (a) => a.day.toLowerCase() === dayName.toLowerCase()
    );

    if (!daySchedule || !daySchedule.slots || daySchedule.slots.length === 0) {
      return res.status(200).json({
        success: true,
        date,
        day: dayName,
        isDayAvailable: false,
        message: `Doctor has no consultation slots scheduled on ${dayName}s.`,
        slots: [],
      });
    }

    // Retrieve active booked appointments on this date
    const bookedAppointments = await Appointment.find({
      doctor: doctor._id,
      date,
      status: { $in: ['Pending', 'Confirmed'] },
    }).select('time status');

    const bookedTimes = bookedAppointments.map((appt) => appt.time);

    // Build slot list with booked status
    const formattedSlots = daySchedule.slots.map((slotTime) => {
      const isBooked = bookedTimes.includes(slotTime);
      return {
        time: slotTime,
        isBooked,
      };
    });

    const availableSlots = formattedSlots.filter((s) => !s.isBooked).map((s) => s.time);

    return res.status(200).json({
      success: true,
      date,
      day: dayName,
      isDayAvailable: true,
      totalSlots: formattedSlots.length,
      availableCount: availableSlots.length,
      availableSlots,
      slots: formattedSlots,
    });
  } catch (error) {
    console.error('[Available Slots Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to compute slot availability',
      error: error.message,
    });
  }
};

/**
 * @desc    Update doctor profile (for logged in doctor)
 * @route   PUT /api/doctors/profile
 * @access  Private (Doctor only)
 */
export const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile associated with this account was not found',
      });
    }

    const {
      name,
      phone,
      specialization,
      qualification,
      experience,
      hospital,
      location,
      consultationFee,
      about,
      profileImage,
    } = req.body;

    if (name) doctor.name = name;
    if (phone) doctor.phone = phone;
    if (specialization) doctor.specialization = specialization;
    if (qualification) doctor.qualification = qualification;
    if (experience !== undefined) doctor.experience = Number(experience);
    if (hospital) doctor.hospital = hospital;
    if (location) doctor.location = location;
    if (consultationFee !== undefined) doctor.consultationFee = Number(consultationFee);
    if (about !== undefined) doctor.about = about;
    if (profileImage !== undefined) doctor.profileImage = profileImage;

    const updatedDoctor = await doctor.save();

    return res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully',
      doctor: updatedDoctor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update doctor profile',
      error: error.message,
    });
  }
};

/**
 * @desc    Update doctor weekly availability schedules
 * @route   PUT /api/doctors/availability
 * @access  Private (Doctor only)
 */
export const updateDoctorAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    if (!Array.isArray(availability)) {
      return res.status(400).json({
        success: false,
        message: 'Availability must be an array of daily schedules with time slots',
      });
    }

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found for this account',
      });
    }

    doctor.availability = availability;
    await doctor.save();

    return res.status(200).json({
      success: true,
      message: 'Availability schedule saved successfully',
      availability: doctor.availability,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update availability schedule',
      error: error.message,
    });
  }
};

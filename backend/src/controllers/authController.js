import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import { generateToken } from '../utils/generateToken.js';

// Default weekly schedule for newly registered doctors
const defaultDoctorSchedule = [
  { day: 'Monday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
  { day: 'Tuesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
  { day: 'Wednesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
  { day: 'Thursday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
  { day: 'Friday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
  { day: 'Saturday', slots: ['09:00 AM', '10:00 AM', '11:30 AM', '01:00 PM'] },
];

/**
 * @desc    Register a new user (Patient or Doctor)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = 'patient',
      phone,
      // Patient specific fields
      age,
      gender,
      location,
      bloodGroup,
      // Doctor specific fields
      specialization,
      qualification,
      experience,
      hospital,
      consultationFee,
      about,
    } = req.body;

    // Disallow public registration as admin
    if (role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Registration as Administrator is restricted to authorized personnel.',
      });
    }

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    // Role-specific validation
    if (role === 'doctor') {
      if (!specialization || !qualification || experience === undefined || !hospital || !location) {
        return res.status(400).json({
          success: false,
          message: 'Doctors must provide specialization, qualification, experience, hospital, and location.',
        });
      }
    } else if (role === 'patient') {
      if (age === undefined || !gender || !location) {
        return res.status(400).json({
          success: false,
          message: 'Patients must provide age, gender, and village/location.',
        });
      }
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Create base user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      phone: phone || '',
    });

    let profileData = null;

    if (role === 'doctor') {
      const doctor = await Doctor.create({
        user: user._id,
        name,
        email: email.toLowerCase(),
        phone: phone || '',
        specialization,
        qualification,
        experience: Number(experience),
        hospital,
        location,
        consultationFee: consultationFee ? Number(consultationFee) : 0,
        about: about || `Dr. ${name} is dedicated to serving rural and underserved communities in ${location}.`,
        availability: defaultDoctorSchedule,
      });
      profileData = doctor;
    } else if (role === 'patient') {
      const patient = await Patient.create({
        user: user._id,
        name,
        email: email.toLowerCase(),
        phone: phone || '',
        age: Number(age),
        gender,
        location,
        bloodGroup: bloodGroup || '',
      });
      profileData = patient;
    }

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profile: profileData,
      },
    });
  } catch (error) {
    console.error('[Register Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error occurred during registration',
    });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // Explicitly select password for comparison
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password',
      });
    }

    // Attach role-specific profile
    let profile = null;
    if (user.role === 'doctor') {
      profile = await Doctor.findOne({ user: user._id });
    } else if (user.role === 'patient') {
      profile = await Patient.findOne({ user: user._id });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profile,
      },
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error occurred during login',
    });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let profile = null;
    if (user.role === 'doctor') {
      profile = await Doctor.findOne({ user: user._id });
    } else if (user.role === 'patient') {
      profile = await Patient.findOne({ user: user._id });
    }

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profile,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving user data',
    });
  }
};

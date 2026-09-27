import Hospital from '../models/Hospital.js';

/**
 * @desc    Get all hospitals and healthcare facilities with bed availability
 * @route   GET /api/hospitals
 * @access  Public
 */
export const getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find().sort({ availableBeds: -1 });

    const totalBeds = hospitals.reduce((acc, h) => acc + (h.totalBeds || 0), 0);
    const availableBeds = hospitals.reduce((acc, h) => acc + (h.availableBeds || 0), 0);

    return res.status(200).json({
      success: true,
      count: hospitals.length,
      stats: {
        totalBeds,
        availableBeds,
        occupiedBeds: totalBeds - availableBeds,
      },
      hospitals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve hospitals',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single hospital details
 * @route   GET /api/hospitals/:id
 * @access  Public
 */
export const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found',
      });
    }

    return res.status(200).json({
      success: true,
      hospital,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve hospital',
      error: error.message,
    });
  }
};

import mongoose from 'mongoose';

const availabilitySlotSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    slots: [
      {
        type: String,
        required: true,
      },
    ],
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide doctor name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide doctor email'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
    },
    specialization: {
      type: String,
      required: [true, 'Please provide specialization'],
      trim: true,
    },
    qualification: {
      type: String,
      required: [true, 'Please provide qualification (e.g. MBBS, MD)'],
      trim: true,
    },
    experience: {
      type: Number,
      required: [true, 'Please provide years of experience'],
      min: 0,
    },
    hospital: {
      type: String,
      required: [true, 'Please provide affiliated hospital/clinic name'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide practice location or district'],
      trim: true,
    },
    consultationFee: {
      type: Number,
      default: 0, // Free for underserved community initiatives or nominal charge
    },
    about: {
      type: String,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    availability: [availabilitySlotSchema],
    rating: {
      type: Number,
      default: 4.8,
    },
    totalConsultations: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;

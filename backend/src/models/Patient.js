import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide patient name'],
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Please provide patient age'],
      min: 0,
      max: 130,
    },
    gender: {
      type: String,
      required: [true, 'Please select gender'],
      enum: ['Male', 'Female', 'Other'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide phone number'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide village, town, or district location'],
      trim: true,
    },
    bloodGroup: {
      type: String,
      default: '',
    },
    emergencyContact: {
      type: String,
      default: '',
    },
    medicalHistory: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;

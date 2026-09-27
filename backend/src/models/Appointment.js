import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    patientPhone: {
      type: String,
      required: true,
      trim: true,
    },
    patientAge: {
      type: Number,
    },
    patientGender: {
      type: String,
    },
    date: {
      type: String,
      required: [true, 'Please provide appointment date (YYYY-MM-DD)'],
      trim: true,
    },
    time: {
      type: String,
      required: [true, 'Please provide appointment time slot'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'Rejected'],
      default: 'Pending',
    },
    reason: {
      type: String,
      required: [true, 'Please provide reason for consultation'],
      trim: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to help enforce uniqueness on active appointments (Pending or Confirmed)
appointmentSchema.index({ doctor: 1, date: 1, time: 1, status: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;

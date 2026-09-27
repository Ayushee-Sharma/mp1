import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide hospital name'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide location/district'],
      trim: true,
    },
    contact: {
      type: String,
      required: [true, 'Please provide contact telephone or helpline'],
      trim: true,
    },
    totalBeds: {
      type: Number,
      required: [true, 'Please provide total bed capacity'],
      min: 0,
    },
    availableBeds: {
      type: Number,
      required: [true, 'Please provide currently available beds'],
      min: 0,
    },
    type: {
      type: String,
      default: 'Community Health Centre',
    },
    emergencyServices: {
      type: Boolean,
      default: true,
    },
    facilities: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Hospital = mongoose.model('Hospital', hospitalSchema);
export default Hospital;

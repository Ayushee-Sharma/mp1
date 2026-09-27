import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Hospital from '../models/Hospital.js';
import Appointment from '../models/Appointment.js';
import {
  demoCredentials,
  sampleDoctors,
  samplePatients,
  sampleHospitals,
  sampleDoctorSchedule,
} from './seedData.js';

const seedDatabase = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri || uri.trim() === '') {
    console.error('\n======================================================');
    console.error('[Database Seed Error]');
    console.error('MONGO_URI is empty in backend/.env.');
    console.error('Please paste your MongoDB Atlas connection string into "MONGO_URI".');
    console.error('Example: MONGO_URI=mongodb+srv://<user>:<pwd>@cluster0.mongodb.net/reaching_the_unreached?retryWrites=true&w=majority');
    console.error('======================================================\n');
    process.exit(1);
  }

  try {
    console.log('[Seed] Connecting to MongoDB Atlas...');
    await mongoose.connect(uri);
    console.log('[Seed] Connected successfully.');

    console.log('[Seed] Clearing existing demo records...');
    await Promise.all([
      User.deleteMany({}),
      Doctor.deleteMany({}),
      Patient.deleteMany({}),
      Hospital.deleteMany({}),
      Appointment.deleteMany({}),
    ]);
    console.log('[Seed] Collections cleared.');

    // 1. Seed Admin User
    console.log('[Seed] Creating Admin demo account...');
    const adminUser = await User.create({
      name: demoCredentials.admin.name,
      email: demoCredentials.admin.email,
      password: demoCredentials.admin.password,
      role: 'admin',
      phone: demoCredentials.admin.phone,
    });

    // 2. Seed Primary Demo Doctor
    console.log('[Seed] Creating Primary Doctor demo account...');
    const primaryDoctorUser = await User.create({
      name: demoCredentials.doctor.name,
      email: demoCredentials.doctor.email,
      password: demoCredentials.doctor.password,
      role: 'doctor',
      phone: demoCredentials.doctor.phone,
    });

    const primaryDoctorProfile = await Doctor.create({
      user: primaryDoctorUser._id,
      name: demoCredentials.doctor.name,
      email: demoCredentials.doctor.email,
      phone: demoCredentials.doctor.phone,
      specialization: demoCredentials.doctor.specialization,
      qualification: demoCredentials.doctor.qualification,
      experience: demoCredentials.doctor.experience,
      hospital: demoCredentials.doctor.hospital,
      location: demoCredentials.doctor.location,
      consultationFee: demoCredentials.doctor.consultationFee,
      about: demoCredentials.doctor.about,
      profileImage: demoCredentials.doctor.profileImage,
      availability: sampleDoctorSchedule,
      rating: 4.9,
    });

    // 3. Seed Primary Demo Patient
    console.log('[Seed] Creating Primary Patient demo account...');
    const primaryPatientUser = await User.create({
      name: demoCredentials.patient.name,
      email: demoCredentials.patient.email,
      password: demoCredentials.patient.password,
      role: 'patient',
      phone: demoCredentials.patient.phone,
    });

    const primaryPatientProfile = await Patient.create({
      user: primaryPatientUser._id,
      name: demoCredentials.patient.name,
      email: demoCredentials.patient.email,
      phone: demoCredentials.patient.phone,
      age: demoCredentials.patient.age,
      gender: demoCredentials.patient.gender,
      location: demoCredentials.patient.location,
      bloodGroup: demoCredentials.patient.bloodGroup,
      emergencyContact: demoCredentials.patient.emergencyContact,
    });

    // 4. Seed Additional Doctors
    console.log(`[Seed] Creating ${sampleDoctors.length} specialized healthcare doctors...`);
    const createdDoctors = [primaryDoctorProfile];

    for (const doc of sampleDoctors) {
      const user = await User.create({
        name: doc.name,
        email: doc.email,
        password: 'password123',
        role: 'doctor',
        phone: doc.phone,
      });

      const profile = await Doctor.create({
        user: user._id,
        name: doc.name,
        email: doc.email,
        phone: doc.phone,
        specialization: doc.specialization,
        qualification: doc.qualification,
        experience: doc.experience,
        hospital: doc.hospital,
        location: doc.location,
        consultationFee: doc.consultationFee,
        about: doc.about,
        profileImage: doc.profileImage,
        availability: sampleDoctorSchedule,
        rating: doc.rating,
      });
      createdDoctors.push(profile);
    }

    // 5. Seed Additional Patients
    console.log(`[Seed] Creating ${samplePatients.length} demo community patients...`);
    const createdPatients = [primaryPatientProfile];

    for (const pat of samplePatients) {
      const user = await User.create({
        name: pat.name,
        email: pat.email,
        password: 'password123',
        role: 'patient',
        phone: pat.phone,
      });

      const profile = await Patient.create({
        user: user._id,
        name: pat.name,
        email: pat.email,
        phone: pat.phone,
        age: pat.age,
        gender: pat.gender,
        location: pat.location,
        bloodGroup: pat.bloodGroup,
        emergencyContact: pat.emergencyContact,
      });
      createdPatients.push(profile);
    }

    // 6. Seed Hospitals
    console.log(`[Seed] Creating ${sampleHospitals.length} rural healthcare hospitals and bed availability...`);
    await Hospital.insertMany(sampleHospitals);

    // 7. Seed Sample Appointments
    console.log('[Seed] Seeding realistic sample appointments...');
    // Create appointments for tomorrow, day after tomorrow, and yesterday
    const today = new Date();
    const formatDate = (offsetDays) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offsetDays);
      return d.toISOString().split('T')[0];
    };

    const dateTomorrow = formatDate(1);
    const dateDayAfter = formatDate(2);
    const datePast = formatDate(-3);

    await Appointment.create([
      {
        patient: primaryPatientUser._id,
        doctor: primaryDoctorProfile._id,
        patientName: primaryPatientUser.name,
        patientPhone: primaryPatientUser.phone,
        patientAge: primaryPatientProfile.age,
        patientGender: primaryPatientProfile.gender,
        date: dateTomorrow,
        time: '10:00 AM',
        status: 'Confirmed',
        reason: 'Seasonal viral fever and body ache consultation for the past 4 days.',
        notes: 'Advised hydration and standard paracetamol dosage. Follow-up required if fever persists.',
      },
      {
        patient: primaryPatientUser._id,
        doctor: createdDoctors[1]._id, // Dr. Priya Nair (Cardiologist)
        patientName: primaryPatientUser.name,
        patientPhone: primaryPatientUser.phone,
        patientAge: primaryPatientProfile.age,
        patientGender: primaryPatientProfile.gender,
        date: dateDayAfter,
        time: '11:00 AM',
        status: 'Pending',
        reason: 'Routine blood pressure checkup and occasional chest tightness after farming work.',
        notes: '',
      },
      {
        patient: primaryPatientUser._id,
        doctor: primaryDoctorProfile._id,
        patientName: primaryPatientUser.name,
        patientPhone: primaryPatientUser.phone,
        patientAge: primaryPatientProfile.age,
        patientGender: primaryPatientProfile.gender,
        date: datePast,
        time: '02:00 PM',
        status: 'Completed',
        reason: 'Annual rural health wellness check and preventive advice.',
        notes: 'Patient vitals stable. Prescribed multivitamins and iron supplements.',
      },
    ]);

    console.log('\n======================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Demo Accounts Created:');
    console.log('  👑 Admin:   admin@example.com   | Password: password123');
    console.log('  🩺 Doctor:  doctor@example.com  | Password: password123');
    console.log('  🧑 Patient: patient@example.com | Password: password123');
    console.log(`Total Doctors:      ${createdDoctors.length}`);
    console.log(`Total Patients:     ${createdPatients.length}`);
    console.log(`Total Hospitals:    ${sampleHospitals.length}`);
    console.log('======================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Database Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();

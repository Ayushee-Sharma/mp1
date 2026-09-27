import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Building,
  Award,
  Calendar,
  Clock,
  Star,
  CheckCircle2,
  Stethoscope,
  Phone,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { doctorService } from '../services/doctorService';
import { appointmentService } from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';

const DoctorProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking form states
  const [selectedDate, setSelectedDate] = useState('');
  const [slotsData, setSlotsData] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [patientName, setPatientName] = useState(user?.name || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');
  const [patientAge, setPatientAge] = useState(user?.profile?.age || '');
  const [patientGender, setPatientGender] = useState(user?.profile?.gender || 'Male');

  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Initialize default date (tomorrow)
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Fetch Doctor profile
  useEffect(() => {
    const fetchDoc = async () => {
      try {
        setLoading(true);
        const data = await doctorService.getDoctorById(id);
        if (data.success) {
          setDoctor(data.doctor);
        }
      } catch (err) {
        setError(err.message || 'Failed to load doctor profile');
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [id]);

  // Fetch available slots whenever date or doctor changes
  useEffect(() => {
    if (!id || !selectedDate) return;

    const fetchSlots = async () => {
      try {
        setSlotsLoading(true);
        setBookingError('');
        setSelectedTime(''); // Reset selection when date changes
        const res = await doctorService.getAvailableSlots(id, selectedDate);
        if (res.success) {
          setSlotsData(res);
        }
      } catch (err) {
        console.error('Failed to calculate slot availability:', err);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [id, selectedDate]);

  // Handle appointment booking submission
  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/doctors/${id}` } });
      return;
    }

    if (user.role !== 'patient') {
      setBookingError('Only registered patients can book appointments. Please switch to a patient account.');
      return;
    }

    if (!selectedDate || !selectedTime) {
      setBookingError('Please choose both an appointment date and an available time slot.');
      return;
    }

    if (!reason.trim()) {
      setBookingError('Please describe the consultation reason or symptoms.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        doctorId: doctor._id,
        date: selectedDate,
        time: selectedTime,
        reason: reason.trim(),
        patientName: patientName || user.name,
        patientPhone: patientPhone || user.phone || '9999999999',
        patientAge: patientAge ? Number(patientAge) : undefined,
        patientGender,
      };

      const res = await appointmentService.createAppointment(payload);
      if (res.success) {
        setBookingSuccess(res.appointment);
        // Refresh slots so the newly booked slot shows as booked
        const updatedSlots = await doctorService.getAvailableSlots(id, selectedDate);
        if (updatedSlots.success) setSlotsData(updatedSlots);
      }
    } catch (err) {
      setBookingError(err.message || 'Failed to confirm booking.');
      // Refresh slots on double-booking error
      try {
        const refreshed = await doctorService.getAvailableSlots(id, selectedDate);
        if (refreshed.success) setSlotsData(refreshed);
      } catch {}
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner message="Loading doctor profile & schedule..." />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Alert type="error" message={error || 'Doctor not found'} />
        <Link
          to="/doctors"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Doctor Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/doctors"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to all doctors
        </Link>
      </div>

      {/* Doctor Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <img
            src={
              doctor.profileImage ||
              'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'
            }
            alt={doctor.name}
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover object-top border-2 border-emerald-100 shadow-sm shrink-0"
          />

          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                  {doctor.specialization}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  {doctor.name}
                </h1>
                <p className="text-sm font-medium text-slate-600">{doctor.qualification}</p>
              </div>

              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-amber-800 text-xs font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{doctor.rating || 4.8} / 5.0</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-600 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{doctor.experience} Years Experience</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="truncate">{doctor.hospital}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{doctor.location}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Consultation Fee:{' '}
                <strong className="text-slate-900 font-bold text-sm">
                  {doctor.consultationFee === 0 ? 'Free (Rural Initiative)' : `₹${doctor.consultationFee}`}
                </strong>
              </span>
              <div className="flex items-center gap-1 text-emerald-700 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" /> Verified Medical Volunteer
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Details (Left) + Interactive Booking (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: About & Weekly Schedule */}
        <div className="lg:col-span-7 space-y-6">
          {/* About Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-emerald-600" />
              About the Doctor
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {doctor.about || 'Dedicated to delivering compassionate, accessible healthcare services.'}
            </p>
          </div>

          {/* Regular Weekly Consultation Days */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              Weekly Consultation Schedule
            </h2>

            {doctor.availability && doctor.availability.length > 0 ? (
              <div className="space-y-3">
                {doctor.availability.map((sched, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <span className="font-semibold text-xs text-slate-800 w-24">
                      {sched.day}
                    </span>
                    <div className="flex flex-wrap gap-1.5 flex-1">
                      {sched.slots.map((slot, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 text-[11px] rounded bg-white border border-slate-200 text-slate-700 font-medium"
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Schedule available upon direct inquiry.</p>
            )}
          </div>
        </div>

        {/* Right Column: Complete Interactive Appointment Booking Workflow */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl border border-emerald-200/80 p-6 shadow-sm sticky top-20 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Book Appointment</h3>
                <p className="text-xs text-slate-500">Real-time slot reservation system</p>
              </div>
              <Calendar className="w-6 h-6 text-emerald-600" />
            </div>

            {/* Success Confirmation Modal/Card */}
            {bookingSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-emerald-950">Appointment Confirmed!</h4>
                  <p className="text-xs text-emerald-800 mt-1">
                    Your appointment has been registered in the system.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl text-left text-xs space-y-2 border border-emerald-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Doctor:</span>
                    <span className="font-bold text-slate-900">{doctor.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date:</span>
                    <span className="font-bold text-slate-900">{bookingSuccess.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Time:</span>
                    <span className="font-bold text-emerald-700">{bookingSuccess.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      {bookingSuccess.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Patient:</span>
                    <span className="font-semibold text-slate-800">{bookingSuccess.patientName}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Link
                    to="/appointments"
                    className="w-full block py-2.5 text-center text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
                  >
                    View My Appointments
                  </Link>
                  <button
                    onClick={() => {
                      setBookingSuccess(null);
                      setSelectedTime('');
                      setReason('');
                    }}
                    className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Book Another Slot
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-4">
                {bookingError && (
                  <Alert
                    type="error"
                    message={bookingError}
                    onClose={() => setBookingError('')}
                  />
                )}

                {/* 1. Date Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    1. Select Consultation Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    required
                  />
                  {slotsData && (
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Day: <strong className="text-slate-800">{slotsData.day}</strong>
                    </span>
                  )}
                </div>

                {/* 2. Available Slots */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      2. Available Time Slots
                    </label>
                    {slotsData?.isDayAvailable && (
                      <span className="text-[11px] font-semibold text-emerald-700">
                        {slotsData.availableCount} open
                      </span>
                    )}
                  </div>

                  {slotsLoading ? (
                    <div className="py-4 text-center">
                      <LoadingSpinner size="sm" message="Checking live availability..." />
                    </div>
                  ) : slotsData?.isDayAvailable === false ? (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                      Doctor does not have scheduled slots on this day. Please select another date.
                    </div>
                  ) : slotsData?.slots && slotsData.slots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {slotsData.slots.map((slot, sIdx) => {
                        const isSelected = selectedTime === slot.time;
                        return (
                          <button
                            key={sIdx}
                            type="button"
                            disabled={slot.isBooked}
                            onClick={() => setSelectedTime(slot.time)}
                            className={`py-2 px-2.5 text-xs font-semibold rounded-xl border transition-all text-center flex items-center justify-center gap-1.5 ${
                              slot.isBooked
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                                : isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 border-slate-200 hover:border-emerald-300'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            {slot.time}
                            {slot.isBooked && (
                              <span className="text-[9px] uppercase font-bold text-rose-500 no-underline">
                                (Booked)
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No slots available for this day.</p>
                  )}
                </div>

                {/* 3. Reason for Appointment */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    3. Reason for Consultation
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Briefly state symptoms, duration, or medical assistance needed..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    required
                  />
                </div>

                {/* Patient Information confirmation */}
                {isAuthenticated && user.role === 'patient' && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="font-semibold text-slate-800">Booking as: {user.name}</div>
                    <div className="text-slate-500">Phone: {user.phone || 'Will be recorded with booking'}</div>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting || !selectedTime || slotsData?.isDayAvailable === false}
                  className="w-full py-3.5 px-4 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01]"
                >
                  {submitting
                    ? 'Validating & Booking...'
                    : !isAuthenticated
                    ? 'Login to Book Appointment'
                    : selectedTime
                    ? `Confirm Booking for ${selectedTime}`
                    : 'Select a Time Slot to Proceed'}
                </button>

                {!isAuthenticated && (
                  <p className="text-[11px] text-center text-slate-500">
                    New here?{' '}
                    <Link to="/register" className="text-emerald-700 font-semibold underline">
                      Register as Patient
                    </Link>{' '}
                    in less than a minute.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfilePage;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/appointmentService';
import { hospitalService } from '../services/hospitalService';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Search,
  PlusCircle,
  Hospital,
  AlertCircle,
  XCircle,
  CheckCircle,
  Stethoscope,
  Activity,
  Heart,
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [apptRes, hospRes, prescriptionRes] = await Promise.allSettled([
        appointmentService.getAppointments(),
        hospitalService.getHospitals(),
        appointmentService.getPrescriptions(),
      ]);

      if (apptRes.status === 'fulfilled' && apptRes.value.success) {
        setAppointments(apptRes.value.appointments);
      }
      if (hospRes.status === 'fulfilled' && hospRes.value.success) {
        setHospitals(hospRes.value.hospitals.slice(0, 3));
      }
      if (prescriptionRes.status === 'fulfilled' && prescriptionRes.value.success) {
        setPrescriptions(prescriptionRes.value.prescriptions);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setPrescriptionsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled appointment?')) {
      return;
    }

    try {
      const res = await appointmentService.cancelAppointment(id);
      if (res.success) {
        setActionSuccess('Appointment was cancelled successfully.');
        loadDashboardData();
      }
    } catch (err) {
      setError(err.message || 'Failed to cancel appointment');
    }
  };

  // Partition appointments into upcoming and previous
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingAppointments = appointments.filter(
    (a) => (a.status === 'Pending' || a.status === 'Confirmed') && a.date >= todayStr
  );
  const pastAppointments = appointments.filter(
    (a) => a.status === 'Completed' || a.status === 'Cancelled' || a.status === 'Rejected' || a.date < todayStr
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome & Quick Action Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-200">
              Patient Health Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              Manage your doctor consultations, track medical visits, and explore community healthcare services.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/doctors"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 transition-all shadow-xs"
            >
              <Search className="w-4 h-4" /> Find a Doctor
            </Link>
            <Link
              to="/hospitals"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600/50 border border-emerald-400/40 text-white font-semibold text-xs hover:bg-emerald-600/70 transition-colors"
            >
              <Hospital className="w-4 h-4" /> Hospital Beds
            </Link>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <Alert type="success" message={actionSuccess} onClose={() => setActionSuccess('')} />
      )}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Main Grid: Appointments (Left) + Profile & Resources (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Appointments */}
        <div className="lg:col-span-8 space-y-8">
          {/* Upcoming Consultations */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Upcoming Appointments</h2>
                <p className="text-xs text-slate-500">Scheduled visits requiring doctor review</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                {upcomingAppointments.length} Active
              </span>
            </div>

            {loading ? (
              <LoadingSpinner size="sm" message="Loading appointments..." />
            ) : upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appt) => (
                  <div
                    key={appt._id}
                    className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                          DR
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            {appt.doctor?.name || 'Assigned Specialist'}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {appt.doctor?.specialization} • {appt.doctor?.hospital}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={appt.status} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Date: <strong>{appt.date}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Slot: <strong>{appt.time}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{appt.doctor?.location || 'Clinic'}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600">
                      <strong className="text-slate-800">Reason:</strong> {appt.reason}
                    </div>

                    {appt.notes && (
                      <div className="text-xs text-slate-500 bg-amber-50/60 p-2.5 rounded-lg border border-amber-100">
                        <strong className="text-amber-900">Doctor Note:</strong> {appt.notes}
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between border-t border-slate-200/60">
                      <span className="text-[11px] text-slate-400">
                        Booked on: {new Date(appt.createdAt).toLocaleDateString()}
                      </span>
                      {appt.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleCancelAppointment(appt._id)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors"
                        >
                          Cancel Appointment
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No upcoming appointments</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Need medical guidance or checkup?</p>
                <Link
                  to="/doctors"
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Book Consultation Now
                </Link>
              </div>
            )}
          </div>

          {/* Past / Completed Appointments */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">Previous Consultation History</h2>

            {pastAppointments.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {pastAppointments.map((appt) => (
                  <div key={appt._id} className="py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {appt.doctor?.name || 'Doctor Consultation'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {appt.date} at {appt.time} • {appt.reason}
                      </div>
                    </div>
                    <StatusBadge status={appt.status} size="sm" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No past appointments recorded.</p>
            )}
          </div>
        </div>

        {/* Right Column: Profile & Community Resources */}
        <div className="lg:col-span-4 space-y-6">
          {/* Patient Profile Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">{user?.name}</h3>
                <span className="text-xs text-slate-500 capitalize">{user?.role} Profile</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Phone:</span>
                <span className="font-medium text-slate-800">{user?.phone || 'Not recorded'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Email:</span>
                <span className="font-medium text-slate-800">{user?.email}</span>
              </div>
              {user?.profile?.age && (
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Age & Gender:</span>
                  <span className="font-medium text-slate-800">
                    {user.profile.age} yrs • {user.profile.gender}
                  </span>
                </div>
              )}
              {user?.profile?.location && (
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Village/Town:</span>
                  <span className="font-medium text-slate-800 truncate max-w-[160px]">
                    {user.profile.location}
                  </span>
                </div>
              )}
              {user?.profile?.bloodGroup && (
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Blood Group:</span>
                  <span className="font-bold text-rose-600">{user.profile.bloodGroup}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-sky-600" />
                My Prescriptions
              </h3>
              <span className="text-[11px] font-semibold text-sky-700">{prescriptions.length}</span>
            </div>

            {prescriptionsLoading ? (
              <LoadingSpinner size="sm" message="Loading prescriptions..." />
            ) : prescriptions.length > 0 ? (
              <div className="space-y-3">
                {prescriptions.slice(0, 3).map((prescription) => (
                  <div key={prescription._id} className="p-3 rounded-xl bg-sky-50 border border-sky-100">
                    <div className="text-xs font-bold text-slate-900">{prescription.doctor?.name}</div>
                    <div className="text-[11px] text-slate-500 mt-1">{prescription.diagnosis}</div>
                    <div className="text-[11px] text-sky-700 mt-2 font-semibold">
                      {prescription.medications?.length || 0} prescribed medication(s)
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No prescriptions yet for this patient.</p>
            )}
          </div>

          {/* Healthcare Resource Preview */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Hospital className="w-4 h-4 text-emerald-600" />
                Nearby Hospital Beds
              </h3>
              <Link to="/hospitals" className="text-[11px] font-semibold text-emerald-700 hover:underline">
                View all
              </Link>
            </div>

            {hospitals.length > 0 ? (
              <div className="space-y-3">
                {hospitals.map((hosp) => (
                  <div key={hosp._id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="text-xs font-bold text-slate-900 truncate">{hosp.name}</div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>{hosp.location}</span>
                      <span className="text-emerald-700 font-bold">
                        {hosp.availableBeds} beds open
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Loading nearby facilities...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;

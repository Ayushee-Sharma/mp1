import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/appointmentService';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  MapPin,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import { Link } from 'react-router-dom';

const AppointmentsPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadAppointments = async (status = 'All') => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (status !== 'All') params.status = status;

      const data = await appointmentService.getAppointments(params);
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (err) {
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments(selectedStatus);
  }, [selectedStatus]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await appointmentService.cancelAppointment(id);
      if (res.success) {
        setSuccess('Appointment successfully cancelled.');
        loadAppointments(selectedStatus);
      }
    } catch (err) {
      setError(err.message || 'Failed to cancel appointment');
    }
  };

  const handleDoctorStatus = async (id, status) => {
    try {
      const res = await appointmentService.updateStatus(id, status);
      if (res.success) {
        setSuccess(`Appointment updated to ${status}`);
        loadAppointments(selectedStatus);
      }
    } catch (err) {
      setError(err.message || 'Failed to update appointment');
    }
  };

  const statuses = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-emerald-700 tracking-wider">
            Consultation Records
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Appointments Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {user?.role === 'doctor'
              ? 'Appointments booked by patients with your clinic'
              : 'Your scheduled consultations with rural doctors'}
          </p>
        </div>

        {user?.role === 'patient' && (
          <Link
            to="/doctors"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            Book New Appointment <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider shrink-0 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Status:
        </span>
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedStatus === st
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <LoadingSpinner message="Retrieving appointments..." />
      ) : appointments.length > 0 ? (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div
              key={appt._id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between sm:justify-start gap-3">
                  <StatusBadge status={appt.status} />
                  <span className="text-xs text-slate-400">
                    ID: {appt._id.slice(-6).toUpperCase()}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {user?.role === 'doctor'
                      ? `Patient: ${appt.patientName}`
                      : appt.doctor?.name || 'Assigned Doctor'}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {user?.role === 'doctor'
                      ? `Phone: ${appt.patientPhone}`
                      : `${appt.doctor?.specialization} • ${appt.doctor?.hospital}`}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{appt.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{appt.time}</span>
                  </div>
                  {appt.doctor?.location && (
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{appt.doctor.location}</span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <strong>Reason:</strong> {appt.reason}
                </div>

                {appt.notes && (
                  <div className="text-xs text-emerald-900 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100">
                    <strong>Doctor Notes:</strong> {appt.notes}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex sm:flex-col gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                {user?.role === 'patient' && (appt.status === 'Pending' || appt.status === 'Confirmed') && (
                  <button
                    onClick={() => handleCancel(appt._id)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                  >
                    Cancel Appointment
                  </button>
                )}

                {user?.role === 'doctor' && appt.status === 'Pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDoctorStatus(appt._id, 'Confirmed')}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleDoctorStatus(appt._id, 'Rejected')}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {user?.role === 'doctor' && appt.status === 'Confirmed' && (
                  <button
                    onClick={() => handleDoctorStatus(appt._id, 'Completed')}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs"
                  >
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No appointments found</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {selectedStatus !== 'All'
              ? `There are no ${selectedStatus.toLowerCase()} appointments.`
              : 'You do not have any recorded consultations.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;

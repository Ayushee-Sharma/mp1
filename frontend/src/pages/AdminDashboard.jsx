import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { appointmentService } from '../services/appointmentService';
import {
  Shield,
  Users,
  Stethoscope,
  Calendar,
  Hospital,
  Activity,
  CheckCircle,
  Clock,
  MapPin,
  Check,
  X,
  Phone,
  RefreshCw,
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);

  const [activeTab, setActiveTab] = useState('overview'); // overview | doctors | patients | appointments
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, docRes, patRes, apptRes] = await Promise.allSettled([
        adminService.getStats(),
        adminService.getDoctors(),
        adminService.getPatients(),
        appointmentService.getAppointments(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.success) {
        setStats(statsRes.value.stats);
        setRecentAppointments(statsRes.value.recentAppointments || []);
      }
      if (docRes.status === 'fulfilled' && docRes.value.success) {
        setDoctorsList(docRes.value.doctors);
      }
      if (patRes.status === 'fulfilled' && patRes.value.success) {
        setPatientsList(patRes.value.patients);
      }
      if (apptRes.status === 'fulfilled' && apptRes.value.success) {
        setAllAppointments(apptRes.value.appointments);
      }
    } catch (err) {
      setError(err.message || 'Failed to load administrative overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleDoctor = async (id) => {
    try {
      setActionSuccess('');
      const res = await adminService.toggleDoctorStatus(id);
      if (res.success) {
        setActionSuccess(res.message);
        loadAdminData();
      }
    } catch (err) {
      setError(err.message || 'Failed to update doctor status');
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner message="Aggregating platform metrics from database..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                System Administration
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Health Mission Command
              </h1>
              <p className="text-xs text-slate-400">
                Live oversight of doctors, patients, bed capacities, and appointments
              </p>
            </div>
          </div>

          <button
            onClick={loadAdminData}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
          </button>
        </div>
      </div>

      {actionSuccess && (
        <Alert type="success" message={actionSuccess} onClose={() => setActionSuccess('')} />
      )}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Primary KPI Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Patients</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {stats?.totalPatients ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Registered in system</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Doctors</span>
            <Stethoscope className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {stats?.totalDoctors ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across 8+ specialties</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Appointments</span>
            <Calendar className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {stats?.totalAppointments ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {stats?.statusBreakdown?.confirmed ?? 0} confirmed
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Hospital Beds</span>
            <Hospital className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-700 mt-2">
            {stats?.availableBeds ?? 0}{' '}
            <span className="text-xs text-slate-400 font-normal">/ {stats?.totalBeds ?? 0}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Available across centers</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        {[
          { key: 'overview', label: 'Recent Appointments' },
          { key: 'doctors', label: `Doctors Directory (${doctorsList.length})` },
          { key: 'patients', label: `Registered Patients (${patientsList.length})` },
          { key: 'appointments', label: `All Consultations (${allAppointments.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content 1: Overview & Recent Appointments */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">
              Latest Recorded Appointments
            </h2>
            <span className="text-xs text-slate-500">Live MongoDB Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date & Slot</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Hospital</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAppointments.length > 0 ? (
                  recentAppointments.map((appt) => (
                    <tr key={appt._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        {appt.date} • {appt.time}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {appt.patientName}
                        <div className="text-[10px] text-slate-400">{appt.patientPhone}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {appt.doctor?.name || 'Assigned Doctor'}
                        <div className="text-[10px] text-emerald-700">
                          {appt.doctor?.specialization}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 truncate max-w-xs">
                        {appt.doctor?.hospital || 'Community Health Clinic'}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={appt.status} size="sm" />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-400">
                      No appointments recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 2: Doctors Management */}
      {activeTab === 'doctors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctorsList.map((doc) => (
            <div
              key={doc._id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start gap-3">
                <img
                  src={
                    doc.profileImage ||
                    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'
                  }
                  alt={doc.name}
                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                      {doc.specialization}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        doc.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {doc.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1 truncate">{doc.name}</h3>
                  <p className="text-[11px] text-slate-500 truncate">{doc.qualification}</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-3">
                <div className="truncate">
                  <strong>Hospital:</strong> {doc.hospital}
                </div>
                <div className="truncate">
                  <strong>Location:</strong> {doc.location}
                </div>
                <div>
                  <strong>Experience:</strong> {doc.experience} years
                </div>
              </div>

              <button
                onClick={() => handleToggleDoctor(doc._id)}
                className={`w-full py-2 text-xs font-semibold rounded-xl border transition-colors ${
                  doc.isActive
                    ? 'text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100'
                    : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                {doc.isActive ? 'Deactivate Doctor' : 'Activate Doctor'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content 3: Patients Directory */}
      {activeTab === 'patients' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Age / Gender</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Blood Group</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patientsList.map((pat) => (
                  <tr key={pat._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">{pat.name}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {pat.age} yrs • {pat.gender}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{pat.phone}</td>
                    <td className="py-3 px-4 text-slate-600">{pat.location}</td>
                    <td className="py-3 px-4 font-bold text-rose-600">
                      {pat.bloodGroup || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 4: All Consultations */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allAppointments.map((appt) => (
                  <tr key={appt._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      {appt.date} • {appt.time}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">{appt.patientName}</td>
                    <td className="py-3 px-4 text-slate-700">
                      {appt.doctor?.name} ({appt.doctor?.specialization})
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{appt.reason}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={appt.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

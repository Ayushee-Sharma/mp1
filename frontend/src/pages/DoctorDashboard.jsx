import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/appointmentService';
import { doctorService } from '../services/doctorService';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Check,
  Stethoscope,
  Building,
  MapPin,
  Award,
  Phone,
  Settings,
  AlertCircle,
  Plus,
  Trash2,
  Save,
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import MedicineAutocomplete from '../components/MedicineAutocomplete';
import PrescriptionFormErrorBoundary from '../components/PrescriptionFormErrorBoundary';
import {
  clearPrescriptionDraft,
  getPrescriptionDraft,
  getPrescriptionDraftKey,
  savePrescriptionDraft,
} from '../utils/prescriptionDrafts';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointmentsLoaded, setAppointmentsLoaded] = useState(false);
  const [prescriptionsLoaded, setPrescriptionsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('requests'); // requests | upcoming | availability | all
  const [loading, setLoading] = useState(true);
  const [prescribingAppointmentId, setPrescribingAppointmentId] = useState(null);
  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    instructions: '',
    notes: '',
    followUpDate: '',
  });
  const [savingPrescription, setSavingPrescription] = useState(false);
  const [prescriptionError, setPrescriptionError] = useState('');
  const [prescriptionOutcomeUncertain, setPrescriptionOutcomeUncertain] = useState(false);
  const [prescriptionSavedMessage, setPrescriptionSavedMessage] = useState('');
  const prescriptionRequestLock = useRef(false);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const initialLoadStarted = useRef(false);

  // Doctor availability state
  const [availabilitySchedule, setAvailabilitySchedule] = useState([]);
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Note modal / prompt state
  const [activeAppointmentId, setActiveAppointmentId] = useState(null);
  const [doctorNotes, setDoctorNotes] = useState('');
  const prescriptionDraftKey = getPrescriptionDraftKey(user?._id, prescribingAppointmentId);

  const updatePrescriptionForm = (update) => {
    setPrescriptionForm((previous) => {
      const next = typeof update === 'function' ? update(previous) : update;
      savePrescriptionDraft(prescriptionDraftKey, next);
      return next;
    });
  };

  const closePrescriptionForm = () => {
    clearPrescriptionDraft(prescriptionDraftKey);
    setPrescribingAppointmentId(null);
    setPrescriptionError('');
    setPrescriptionOutcomeUncertain(false);
    setPrescriptionSavedMessage('');
    setPrescriptionForm({
      diagnosis: '',
      medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
      instructions: '',
      notes: '',
      followUpDate: '',
    });
  };

  const loadDoctorData = async () => {
    try {
      setLoading(true);
      setError('');
      const [appointmentsResult, prescriptionsResult] = await Promise.allSettled([
        appointmentService.getAppointments(),
        appointmentService.getPrescriptions(),
      ]);
      const loadErrors = [];

      if (appointmentsResult.status === 'fulfilled' && appointmentsResult.value.success) {
        setAppointments(appointmentsResult.value.appointments);
        setAppointmentsLoaded(true);
      } else {
        loadErrors.push(
          appointmentsResult.status === 'rejected'
            ? appointmentsResult.reason.message
            : 'Failed to load doctor appointments.'
        );
      }

      if (prescriptionsResult.status === 'fulfilled' && prescriptionsResult.value.success) {
        setPrescriptions(prescriptionsResult.value.prescriptions);
        setPrescriptionsLoaded(true);
      } else {
        loadErrors.push(
          prescriptionsResult.status === 'rejected'
            ? prescriptionsResult.reason.message
            : 'Failed to load doctor prescriptions.'
        );
      }
      if (loadErrors.length) setError(loadErrors.join(' '));

      // Initialize doctor schedule from profile
      if (user?.profile?.availability) {
        setAvailabilitySchedule(user.profile.availability);
      }
    } catch (err) {
      setError(err.message || 'Failed to load doctor dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialLoadStarted.current) {
      initialLoadStarted.current = true;
      loadDoctorData();
    }
  }, []);

  const handleStatusChange = async (id, newStatus, notes = '') => {
    try {
      setActionSuccess('');
      setError('');
      const res = await appointmentService.updateStatus(id, newStatus, notes);
      if (res.success) {
        setActionSuccess(`Appointment successfully marked as ${newStatus}`);
        setActiveAppointmentId(null);
        setDoctorNotes('');
        loadDoctorData();
      }
    } catch (err) {
      setError(err.message || 'Failed to update appointment status');
    }
  };

  const openPrescriptionForm = (appointment) => {
    const draftKey = getPrescriptionDraftKey(user?._id, appointment._id);
    const savedDraft = getPrescriptionDraft(draftKey);
    const initialForm = savedDraft && Array.isArray(savedDraft.medications)
      ? savedDraft
      : {
          diagnosis: '',
          medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
          instructions: '',
          notes: '',
          followUpDate: '',
        };

    setPrescribingAppointmentId(appointment._id);
    setPrescriptionForm(initialForm);
    savePrescriptionDraft(draftKey, initialForm);
    setPrescriptionError('');
    setPrescriptionOutcomeUncertain(false);
    setPrescriptionSavedMessage('');
    setError('');
    setActionSuccess('');
  };

  const updateMedicineField = (index, field, value) => {
    updatePrescriptionForm((prev) => {
      const medicines = Array.isArray(prev.medications) ? [...prev.medications] : [];
      if (!medicines[index] || !['name', 'dosage', 'frequency', 'duration'].includes(field)) {
        return prev;
      }
      medicines[index] = { ...medicines[index], [field]: value };
      return { ...prev, medications: medicines };
    });
  };

  const addMedicationRow = () => {
    updatePrescriptionForm((prev) => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '' }],
    }));
  };

  const removeMedicationRow = (index) => {
    updatePrescriptionForm((prev) => ({
      ...prev,
      medications: prev.medications.length > 1 ? prev.medications.filter((_, i) => i !== index) : prev.medications,
    }));
  };

  const confirmPrescriptionSaved = (message = 'Prescription saved and confirmed by the server.') => {
    clearPrescriptionDraft(prescriptionDraftKey);
    setPrescriptionForm({
      diagnosis: '',
      medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
      instructions: '',
      notes: '',
      followUpDate: '',
    });
    setPrescriptionOutcomeUncertain(false);
    setPrescriptionError('');
    setPrescriptionSavedMessage(message);
    loadDoctorData();
  };

  const prescriptionExistsForAppointment = (prescriptions) =>
    prescriptions?.find((prescription) => {
      const appointmentId =
        typeof prescription?.appointment === 'string'
          ? prescription.appointment
          : prescription?.appointment?._id;
      return String(appointmentId || '') === String(prescribingAppointmentId || '');
    });

  const fetchPrescriptionList = async () => {
    const result = await appointmentService.getPrescriptions();
    if (!result.success || !Array.isArray(result.prescriptions)) {
      throw new Error(result.message || 'The server could not confirm the prescription status.');
    }
    return result.prescriptions;
  };

  const handleCheckPrescriptionStatus = async () => {
    if (prescriptionRequestLock.current) return;
    prescriptionRequestLock.current = true;
    setSavingPrescription(true);
    setPrescriptionError('');

    try {
      const prescriptions = await fetchPrescriptionList();
      const existingPrescription = prescriptionExistsForAppointment(prescriptions);
      if (existingPrescription) {
        confirmPrescriptionSaved('The server confirmed that this appointment already has a saved prescription.');
      } else {
        setPrescriptionOutcomeUncertain(false);
        setPrescriptionError('No saved prescription was found. Your draft is unchanged and can be submitted again.');
      }
    } catch (statusError) {
      setPrescriptionError(
        `${statusError.message || 'Unable to check prescription status.'} Do not retry the save until the server status can be checked.`
      );
    } finally {
      prescriptionRequestLock.current = false;
      setSavingPrescription(false);
    }
  };

  const handleCreatePrescription = async () => {
    if (prescriptionRequestLock.current || prescriptionOutcomeUncertain || prescriptionSavedMessage) return;

    setPrescriptionError('');
    if (!prescribingAppointmentId) {
      setPrescriptionError('Select an appointment before creating a prescription.');
      return;
    }

    if (!prescriptionForm.diagnosis.trim()) {
      setPrescriptionError('Diagnosis is required before creating a prescription.');
      return;
    }

    const enteredMedicines = Array.isArray(prescriptionForm.medications)
      ? prescriptionForm.medications
      : [];
    const hasValue = (value) => typeof value === 'string' && value.trim().length > 0;
    const hasAnyMedicineField = (medicine) =>
      ['name', 'dosage', 'frequency', 'duration'].some((field) => hasValue(medicine?.[field]));
    const incompleteMedicine = enteredMedicines.find((medicine) => {
      if (!hasAnyMedicineField(medicine)) return false;
      return !['name', 'dosage', 'frequency', 'duration'].every((field) =>
        hasValue(medicine?.[field])
      );
    });

    if (incompleteMedicine) {
      setPrescriptionError('Complete the name, dosage, frequency, and duration for each medicine row.');
      return;
    }

    const validMedicines = enteredMedicines
      .filter(hasAnyMedicineField)
      .map((medicine) => ({
        name: medicine.name.trim(),
        dosage: medicine.dosage.trim(),
        frequency: medicine.frequency.trim(),
        duration: medicine.duration.trim(),
      }));

    if (validMedicines.length === 0) {
      setPrescriptionError('Add at least one medicine with dosage, frequency, and duration.');
      return;
    }

    prescriptionRequestLock.current = true;
    setSavingPrescription(true);
    try {
      setActionSuccess('');
      const payload = {
        appointmentId: prescribingAppointmentId,
        diagnosis: prescriptionForm.diagnosis.trim(),
        medications: validMedicines,
        instructions: prescriptionForm.instructions.trim(),
        notes: prescriptionForm.notes.trim(),
        followUpDate: prescriptionForm.followUpDate,
      };

      const res = await appointmentService.createPrescription(payload);
      if (!res.success || !res.prescription?._id) {
        throw new Error(res.message || 'The server did not confirm that the prescription was saved.');
      }
      confirmPrescriptionSaved(res.message || 'Prescription saved and confirmed by the server.');
    } catch (err) {
      try {
        const prescriptions = await fetchPrescriptionList();
        if (prescriptionExistsForAppointment(prescriptions)) {
          confirmPrescriptionSaved('The server confirmed that this appointment has a saved prescription.');
        } else if (err.isNetworkError || err.status >= 500) {
          setPrescriptionOutcomeUncertain(true);
          setPrescriptionError(
            `${err.message || 'The save could not be confirmed.'} No prescription is visible yet. Your draft is preserved; check the save status before retrying.`
          );
        } else {
          setPrescriptionOutcomeUncertain(false);
          setPrescriptionError(err.message || 'Failed to create prescription. Your draft is preserved; you can correct the issue and retry.');
        }
      } catch (statusError) {
        setPrescriptionOutcomeUncertain(true);
        setPrescriptionError(
          `The save could not be confirmed, and the server status check failed: ${statusError.message || 'server unavailable'}. Your draft is preserved; check the save status before retrying.`
        );
      }
    } finally {
      prescriptionRequestLock.current = false;
      setSavingPrescription(false);
    }
  };

  // Availability schedule editor handlers
  const handleToggleDay = (day) => {
    const exists = availabilitySchedule.find((s) => s.day === day);
    if (exists) {
      setAvailabilitySchedule(availabilitySchedule.filter((s) => s.day !== day));
    } else {
      setAvailabilitySchedule([
        ...availabilitySchedule,
        { day, slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM'] },
      ]);
    }
  };

  const handleAddSlot = (day, newSlotTime) => {
    if (!newSlotTime) return;
    setAvailabilitySchedule(
      availabilitySchedule.map((s) => {
        if (s.day === day && !s.slots.includes(newSlotTime)) {
          return { ...s, slots: [...s.slots, newSlotTime] };
        }
        return s;
      })
    );
  };

  const handleRemoveSlot = (day, slotToRemove) => {
    setAvailabilitySchedule(
      availabilitySchedule.map((s) => {
        if (s.day === day) {
          return { ...s, slots: s.slots.filter((slot) => slot !== slotToRemove) };
        }
        return s;
      })
    );
  };

  const handleSaveAvailability = async () => {
    try {
      setSavingSchedule(true);
      setActionSuccess('');
      setError('');
      const res = await doctorService.updateAvailability(availabilitySchedule);
      if (res.success) {
        setActionSuccess('Weekly consultation availability saved successfully.');
      }
    } catch (err) {
      setError(err.message || 'Failed to update availability schedule.');
    } finally {
      setSavingSchedule(false);
    }
  };

  // Filter lists
  const pendingRequests = appointments.filter((a) => a.status === 'Pending');
  const confirmedAppointments = appointments.filter((a) => a.status === 'Confirmed');
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(
    (a) => a.date === todayStr && (a.status === 'Confirmed' || a.status === 'Pending')
  );
  const prescriptionByAppointment = new Map(
    prescriptions
      .map((prescription) => {
        const appointment = prescription.appointment;
        const appointmentId = typeof appointment === 'string' ? appointment : appointment?._id;
        return appointmentId ? [String(appointmentId), prescription] : null;
      })
      .filter(Boolean)
  );
  const getPrescriptionForAppointment = (appointmentId) =>
    prescriptionByAppointment.get(String(appointmentId));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Doctor Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <Stethoscope className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-teal-200">
                Medical Officer Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {user?.name || 'Dr. Practitioner'}
              </h1>
              <p className="text-xs text-teal-100">
                {user?.profile?.specialization || 'General Specialist'} • {user?.profile?.hospital}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('availability')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-teal-900 font-bold text-xs hover:bg-teal-50 transition-colors shadow-xs"
            >
              <Clock className="w-4 h-4" /> Manage Availability
            </button>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <Alert type="success" message={actionSuccess} onClose={() => setActionSuccess('')} />
      )}
      {error && (
        <div className="space-y-2">
          <Alert type="error" message={error} onClose={() => setError('')} />
          <button
            type="button"
            onClick={loadDoctorData}
            disabled={loading}
            className="text-xs font-semibold text-emerald-700 underline disabled:opacity-50"
          >
            {loading ? 'Retrying...' : 'Retry loading dashboard'}
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pending Requests
          </div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">
            {appointmentsLoaded ? pendingRequests.length : '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Require review</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Confirmed Visits
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            {appointmentsLoaded ? confirmedAppointments.length : '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Upcoming scheduled</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Today's Visits
          </div>
          <div className="text-2xl font-extrabold text-teal-600 mt-1">
            {todayAppointments.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{todayStr}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Consultations
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {appointmentsLoaded ? appointments.length : '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">All time records</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        {[
          { key: 'requests', label: `Pending Requests (${appointmentsLoaded ? pendingRequests.length : '—'})` },
          { key: 'upcoming', label: `Confirmed (${appointmentsLoaded ? confirmedAppointments.length : '—'})` },
          { key: 'all', label: `All Consultations (${appointmentsLoaded ? appointments.length : '—'})` },
          { key: 'prescriptions', label: `Prescriptions (${prescriptionsLoaded ? prescriptions.length : '—'})` },
          { key: 'availability', label: 'Availability Schedules' },
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

      {/* Tab 1: Pending Appointment Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">
              New Appointment Requests from Patients
            </h2>
            <span className="text-xs text-slate-500">
              Confirm or reject to update patient status
            </span>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading requests..." />
          ) : !appointmentsLoaded ? (
            <p className="text-xs text-rose-700">Appointment requests are unavailable. Retry loading the dashboard.</p>
          ) : pendingRequests.length > 0 ? (
            <div className="space-y-4">
              {pendingRequests.map((appt) => (
                <div
                  key={appt._id}
                  className="bg-white p-6 rounded-2xl border border-amber-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                        Pending Confirmation
                      </span>
                      <span className="text-xs text-slate-400">
                        Requested: {new Date(appt.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      Patient: {appt.patientName}
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600">
                      <div>
                        <strong>Date:</strong> {appt.date}
                      </div>
                      <div>
                        <strong>Slot:</strong> {appt.time}
                      </div>
                      <div>
                        <strong>Phone:</strong> {appt.patientPhone}
                      </div>
                      {appt.patientAge && (
                        <div>
                          <strong>Age/Gender:</strong> {appt.patientAge} / {appt.patientGender}
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <strong>Consultation Reason:</strong> {appt.reason}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleStatusChange(appt._id, 'Confirmed')}
                      className="flex-1 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Check className="w-4 h-4" /> Confirm
                    </button>
                    <button
                      onClick={() => handleStatusChange(appt._id, 'Rejected')}
                      className="flex-1 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">All caught up!</p>
              <p className="text-xs text-slate-500">There are no pending patient requests.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Confirmed Appointments */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">
            Confirmed Patient Appointments
          </h2>

          {loading ? (
            <LoadingSpinner message="Loading confirmed appointments..." />
          ) : !appointmentsLoaded ? (
            <p className="text-xs text-rose-700">Appointment information is unavailable. Retry loading the dashboard.</p>
          ) : confirmedAppointments.length > 0 ? (
            <div className="space-y-4">
              {confirmedAppointments.map((appt) => (
                <div
                  key={appt._id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {appt.patientName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Contact: {appt.patientPhone} • {appt.patientAge ? `Age ${appt.patientAge}` : ''}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={appt.status} />
                      {getPrescriptionForAppointment(appt._id) && (
                        <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-700">
                          Prescription issued
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{appt.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{appt.time}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      Reason: <strong className="text-slate-800">{appt.reason}</strong>
                    </div>
                  </div>

                  {activeAppointmentId === appt._id ? (
                    <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-3">
                      <label className="block text-xs font-bold text-emerald-900">
                        Clinical Consultation Notes & Prescription Advice:
                      </label>
                      <textarea
                        rows={2}
                        value={doctorNotes}
                        onChange={(e) => setDoctorNotes(e.target.value)}
                        placeholder="e.g. Prescribed antibiotic course. Advised follow-up in 7 days."
                        className="w-full p-2.5 text-xs bg-white border border-emerald-200 rounded-lg focus:outline-hidden"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setActiveAppointmentId(null)}
                          className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleStatusChange(appt._id, 'Completed', doctorNotes)}
                          className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                        >
                          Complete Consultation
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2 items-start justify-between pt-2 border-t border-slate-100">
                      <span className="text-[11px] text-slate-400">
                        Double-booking prevention active for this slot
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setActiveAppointmentId(appt._id);
                            setDoctorNotes(appt.notes || '');
                          }}
                          className="px-4 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
                        >
                          Mark as Completed
                        </button>
                        <button
                          onClick={() => openPrescriptionForm(appt)}
                          className="px-4 py-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-colors"
                        >
                          Create Prescription
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <p className="text-xs text-slate-500">No confirmed appointments scheduled.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: All Appointments History */}
      {activeTab === 'all' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {loading ? (
            <LoadingSpinner message="Loading appointment history..." />
          ) : !appointmentsLoaded ? (
            <p className="p-6 text-xs text-rose-700">Appointment history is unavailable. Retry loading the dashboard.</p>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((appt) => (
                  <tr key={appt._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      {appt.date} • {appt.time}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">{appt.patientName}</td>
                    <td className="py-3 px-4 text-slate-500">{appt.patientPhone}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{appt.reason}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={appt.status} size="sm" />
                      {getPrescriptionForAppointment(appt._id) && (
                        <div className="mt-1.5">
                          <span className="rounded-full bg-sky-50 px-2 py-1 text-[10px] font-bold text-sky-700">
                            Prescription issued
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {appt.status === 'Pending' && (
                        <button
                          onClick={() => handleStatusChange(appt._id, 'Confirmed')}
                          className="text-[11px] font-bold text-emerald-600 hover:underline mr-2"
                        >
                          Confirm
                        </button>
                      )}
                      {appt.status === 'Confirmed' && (
                        <button
                          onClick={() => handleStatusChange(appt._id, 'Completed')}
                          className="text-[11px] font-bold text-blue-600 hover:underline"
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      )}

      {activeTab === 'prescriptions' && (
        <section className="space-y-4" aria-labelledby="doctor-prescriptions-heading">
          <div>
            <h2 id="doctor-prescriptions-heading" className="text-base font-extrabold text-slate-900">
              E-Prescriptions
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Prescriptions associated with your doctor account.
            </p>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading prescriptions..." />
          ) : !prescriptionsLoaded ? (
            <p className="text-xs text-rose-700">Prescription information is unavailable. Retry loading the dashboard.</p>
          ) : prescriptions.length > 0 ? (
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <article
                  key={prescription._id}
                  className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {prescription.patient?.name || 'Patient'}
                      </h3>
                      {prescription.appointment && (
                        <p className="mt-1 text-xs text-slate-500">
                          Appointment: {prescription.appointment.date} at {prescription.appointment.time}
                        </p>
                      )}
                    </div>
                    {prescription.createdAt && (
                      <time className="text-[11px] text-slate-500" dateTime={prescription.createdAt}>
                        Prescribed {new Date(prescription.createdAt).toLocaleDateString()}
                      </time>
                    )}
                  </div>

                  {prescription.diagnosis && (
                    <p className="text-xs text-slate-700">
                      <strong>Diagnosis:</strong> {prescription.diagnosis}
                    </p>
                  )}

                  <div className="space-y-2">
                    {(Array.isArray(prescription.medications) ? prescription.medications : []).map(
                      (medicine, index) => (
                        <div
                          key={`${prescription._id}-medicine-${index}`}
                          className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600"
                        >
                          <div className="font-bold text-slate-900">
                            {medicine.name || 'Medicine details unavailable'}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                            {medicine.dosage && <span><strong>Dosage:</strong> {medicine.dosage}</span>}
                            {medicine.frequency && <span><strong>Frequency:</strong> {medicine.frequency}</span>}
                            {medicine.duration && <span><strong>Duration:</strong> {medicine.duration}</span>}
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {prescription.instructions && (
                    <p className="text-xs text-slate-600">
                      <strong>Instructions:</strong> {prescription.instructions}
                    </p>
                  )}
                  {prescription.notes && (
                    <p className="text-xs text-slate-600">
                      <strong>Notes:</strong> {prescription.notes}
                    </p>
                  )}
                  {prescription.followUpDate && (
                    <p className="text-xs text-slate-600">
                      <strong>Follow-up:</strong> {prescription.followUpDate}
                    </p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
              No prescriptions are available for this doctor account.
            </p>
          )}
        </section>
      )}

      {prescribingAppointmentId && (
        <PrescriptionFormErrorBoundary key={prescribingAppointmentId}>
        <div className="bg-white rounded-3xl border border-sky-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between gap-3 border-b border-sky-100 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Create e-Prescription</h2>
              <p className="text-xs text-slate-500">Doctor-issued prescription for the selected consultation.</p>
            </div>
            <button
              type="button"
              onClick={closePrescriptionForm}
              disabled={savingPrescription}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Close
            </button>
          </div>

          {prescriptionSavedMessage && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800" role="status">
              {prescriptionSavedMessage}
            </div>
          )}
          {prescriptionError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">
              <p>{prescriptionError}</p>
            </div>
          )}

          <fieldset
            disabled={savingPrescription || Boolean(prescriptionSavedMessage)}
            className="m-0 min-w-0 space-y-4 border-0 p-0 disabled:opacity-70"
          >
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Diagnosis</label>
              <textarea
                rows={2}
                value={prescriptionForm.diagnosis}
                onChange={(e) => updatePrescriptionForm((previous) => ({ ...previous, diagnosis: e.target.value }))}
                placeholder="Describe the clinical diagnosis"
                className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">Medicines</label>
                <button
                  type="button"
                  onClick={addMedicationRow}
                  className="text-xs font-bold text-sky-700 hover:text-sky-800"
                >
                  + Add medicine
                </button>
              </div>

              {prescriptionForm.medications.map((med, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 p-3 border border-slate-200 rounded-xl bg-slate-50">
                  <MedicineAutocomplete
                    value={med.name}
                    specialty={user?.profile?.specialization}
                    onChange={(value) => updateMedicineField(index, 'name', value)}
                    rowIndex={index}
                  />
                  <input
                    value={med.dosage}
                    onChange={(e) => updateMedicineField(index, 'dosage', e.target.value)}
                    placeholder="Dosage"
                    className="p-2 text-xs border border-slate-200 rounded-lg"
                  />
                  <input
                    value={med.frequency}
                    onChange={(e) => updateMedicineField(index, 'frequency', e.target.value)}
                    placeholder="Frequency"
                    className="p-2 text-xs border border-slate-200 rounded-lg"
                  />
                  <input
                    value={med.duration}
                    onChange={(e) => updateMedicineField(index, 'duration', e.target.value)}
                    placeholder="Duration"
                    className="p-2 text-xs border border-slate-200 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeMedicationRow(index)}
                    className="px-2 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <p className="text-[11px] text-slate-500">
                Suggestions are general reference aids. The prescribing doctor must verify suitability for the individual patient.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Instructions</label>
                <textarea
                  rows={2}
                  value={prescriptionForm.instructions}
                  onChange={(e) => updatePrescriptionForm((previous) => ({ ...previous, instructions: e.target.value }))}
                  placeholder="Patient guidance and usage notes"
                  className="w-full p-3 text-sm border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Follow-up date</label>
                <input
                  type="date"
                  value={prescriptionForm.followUpDate}
                  onChange={(e) => updatePrescriptionForm((previous) => ({ ...previous, followUpDate: e.target.value }))}
                  className="w-full p-3 text-sm border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Additional notes</label>
              <textarea
                rows={2}
                value={prescriptionForm.notes}
                onChange={(e) => updatePrescriptionForm((previous) => ({ ...previous, notes: e.target.value }))}
                placeholder="Optional remarks for the patient"
                className="w-full p-3 text-sm border border-slate-200 rounded-xl"
              />
            </div>
          </fieldset>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={closePrescriptionForm}
              disabled={savingPrescription}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              {prescriptionSavedMessage ? 'Done' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={prescriptionOutcomeUncertain ? handleCheckPrescriptionStatus : handleCreatePrescription}
              disabled={savingPrescription || Boolean(prescriptionSavedMessage)}
              className="px-5 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl disabled:opacity-60"
            >
              {savingPrescription ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  {prescriptionOutcomeUncertain ? 'Checking status...' : 'Saving...'}
                </span>
              ) : prescriptionSavedMessage ? (
                'Saved by server'
              ) : prescriptionOutcomeUncertain ? (
                'Check save status'
              ) : (
                'Save Prescription'
              )}
            </button>
          </div>
        </div>
        </PrescriptionFormErrorBoundary>
      )}

      {/* Tab 4: Doctor Availability Schedule Editor */}
      {activeTab === 'availability' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Manage Weekly Consultation Schedule
              </h2>
              <p className="text-xs text-slate-500">
                Configure days and consultation slots that patients can book in real-time.
              </p>
            </div>
            <button
              onClick={handleSaveAvailability}
              disabled={savingSchedule}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              {savingSchedule ? 'Saving...' : 'Save Schedule Changes'}
            </button>
          </div>

          <div className="space-y-4">
            {DAYS_OF_WEEK.map((day) => {
              const daySchedule = availabilitySchedule.find((s) => s.day === day);
              const isActive = !!daySchedule;

              return (
                <div
                  key={day}
                  className={`p-4 rounded-2xl border transition-all ${
                    isActive ? 'bg-slate-50/70 border-emerald-200' : 'bg-white border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => handleToggleDay(day)}
                        className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                        id={`day-${day}`}
                      />
                      <label
                        htmlFor={`day-${day}`}
                        className="text-sm font-bold text-slate-900 cursor-pointer"
                      >
                        {day}
                      </label>
                      <span className="text-[11px] text-slate-500">
                        {isActive
                          ? `${daySchedule.slots.length} consultation slots`
                          : 'Unavailable / Off'}
                      </span>
                    </div>

                    {isActive && (
                      <div className="flex flex-wrap items-center gap-2">
                        {daySchedule.slots.map((slot, sIdx) => (
                          <span
                            key={sIdx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs"
                          >
                            {slot}
                            <button
                              onClick={() => handleRemoveSlot(day, slot)}
                              className="text-slate-400 hover:text-rose-600 ml-1"
                              title="Remove slot"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}

                        {/* Quick Add Common Slot buttons */}
                        <div className="flex items-center gap-1 pl-2">
                          {['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'].map((preset) => {
                            if (daySchedule.slots.includes(preset)) return null;
                            return (
                              <button
                                key={preset}
                                onClick={() => handleAddSlot(day, preset)}
                                className="text-[10px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200"
                              >
                                + {preset}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;

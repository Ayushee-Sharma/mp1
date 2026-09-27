import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Clock,
  Star,
  Award,
  Stethoscope,
  Building,
  UserCheck,
} from 'lucide-react';
import { doctorService } from '../services/doctorService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';

const FindDoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDoctors = async (query = '', spec = 'All') => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (query.trim()) params.search = query.trim();
      if (spec !== 'All') params.specialization = spec;

      const data = await doctorService.getDoctors(params);
      if (data.success) {
        setDoctors(data.doctors);
        if (data.specializations && data.specializations.length > 0) {
          setSpecializations(['All', ...data.specializations]);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load doctors list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors(search, selectedSpec);
  };

  const handleSpecSelect = (spec) => {
    setSelectedSpec(spec);
    fetchDoctors(search, spec);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center sm:text-left max-w-2xl">
        <span className="text-xs uppercase font-bold text-emerald-700 tracking-wider">
          Healthcare Directory
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Find Doctors & Specialists
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Browse verified doctors providing primary and specialized care for rural and community clinics.
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by doctor name, hospital, clinic, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
          >
            Search
          </button>
        </form>

        {/* Specialization Filter Tabs */}
        {specializations.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Speciality:
            </span>
            {specializations.map((spec) => (
              <button
                key={spec}
                onClick={() => handleSpecSelect(spec)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedSpec === spec
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Doctor Cards Grid */}
      {loading ? (
        <LoadingSpinner message="Searching verified doctors..." />
      ) : doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor._id}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Card Header & Photo */}
              <div className="p-5 flex items-start gap-4">
                <img
                  src={
                    doctor.profileImage ||
                    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'
                  }
                  alt={doctor.name}
                  className="w-16 h-16 rounded-2xl object-cover object-top border border-slate-100 shrink-0 shadow-xs"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 truncate">
                      {doctor.specialization}
                    </span>
                    <span className="flex items-center text-xs font-bold text-amber-500 shrink-0">
                      <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                      {doctor.rating || 4.8}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1 truncate">
                    {doctor.name}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">{doctor.qualification}</p>
                </div>
              </div>

              {/* Details Body */}
              <div className="px-5 pb-4 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{doctor.experience} years clinical experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="truncate">{doctor.hospital}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{doctor.location}</span>
                </div>

                {/* Availability Preview */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {doctor.availability?.length
                        ? `${doctor.availability.length} active schedule days`
                        : 'Schedule on request'}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 text-xs">
                    {doctor.consultationFee === 0 ? 'Free' : `₹${doctor.consultationFee}`}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2">
                <Link
                  to={`/doctors/${doctor._id}`}
                  className="w-full py-2 text-center text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  View Profile
                </Link>
                <Link
                  to={`/doctors/${doctor._id}?book=true`}
                  className="w-full py-2 text-center text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
                >
                  Book Slot
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No doctors matched your criteria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or clear the specialization filter to view all medical personnel.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedSpec('All');
              fetchDoctors('', 'All');
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
};

export default FindDoctorsPage;

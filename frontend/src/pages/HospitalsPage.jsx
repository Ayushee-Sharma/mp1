import React, { useState, useEffect } from 'react';
import { hospitalService } from '../services/hospitalService';
import {
  Hospital,
  MapPin,
  Phone,
  Bed,
  Activity,
  ShieldCheck,
  AlertTriangle,
  PhoneCall,
  Search,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';

const HospitalsPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true);
        const data = await hospitalService.getHospitals();
        if (data.success) {
          setHospitals(data.hospitals);
          setStats(data.stats);
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve hospital capacities');
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  const filteredHospitals = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center sm:text-left max-w-2xl">
        <span className="text-xs uppercase font-bold text-emerald-700 tracking-wider">
          Community Infrastructure
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Rural Healthcare Facilities & Bed Capacity
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Real-time visibility into available hospital beds, trauma care, and community health centers
          across neighboring districts.
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Bed Stats Bar */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Total Bed Capacity</span>
              <Bed className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">{stats.totalBeds}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Across monitored rural centers</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-700 uppercase tracking-wider">
              <span>Available Beds Right Now</span>
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-700 mt-2">
              {stats.availableBeds}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
              Ready for immediate inpatient admission
            </div>
          </div>

          <div className="bg-gradient-to-r from-rose-600 to-rose-700 p-5 rounded-2xl text-white shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-rose-100 uppercase tracking-wider">
              <span>Emergency Ambulance</span>
              <PhoneCall className="w-4 h-4 text-rose-200" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-2">Dial 108</div>
            <div className="text-[11px] text-rose-100 mt-0.5">24x7 Government Emergency Response</div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by hospital name or location/district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Hospital Cards Grid */}
      {loading ? (
        <LoadingSpinner message="Checking hospital bed telemetry..." />
      ) : filteredHospitals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredHospitals.map((hospital) => {
            const percentage = hospital.totalBeds
              ? Math.round((hospital.availableBeds / hospital.totalBeds) * 100)
              : 0;

            return (
              <div
                key={hospital._id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {hospital.type || 'Community Hospital'}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 pt-1 leading-snug">
                      {hospital.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{hospital.location}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-2xl font-extrabold text-emerald-700">
                      {hospital.availableBeds}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">
                      / {hospital.totalBeds} Total Beds
                    </div>
                  </div>
                </div>

                {/* Occupancy Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Availability Ratio</span>
                    <span className="font-bold text-slate-700">{percentage}% Open</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentage > 30 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Facilities Badges */}
                {hospital.facilities && hospital.facilities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {hospital.facilities.map((fac, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md"
                      >
                        {fac}
                      </span>
                    ))}
                  </div>
                )}

                {/* Contact and Emergency Dispatch */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{hospital.contact}</span>
                  </div>
                  {hospital.emergencyServices && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                      <ShieldCheck className="w-3.5 h-3.5" /> 24x7 Emergency Active
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Hospital className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500">No healthcare facilities found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default HospitalsPage;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartPulse,
  Search,
  CalendarCheck,
  Hospital,
  ShieldCheck,
  Users,
  Stethoscope,
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
  PhoneCall,
  Activity,
  CheckCircle,
} from 'lucide-react';
import { doctorService } from '../services/doctorService';
import { hospitalService } from '../services/hospitalService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const HomePage = () => {
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [hospitalStats, setHospitalStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [docRes, hospRes] = await Promise.allSettled([
          doctorService.getDoctors(),
          hospitalService.getHospitals(),
        ]);

        if (docRes.status === 'fulfilled' && docRes.value.success) {
          setFeaturedDoctors(docRes.value.doctors.slice(0, 4));
        }

        if (hospRes.status === 'fulfilled' && hospRes.value.success) {
          setHospitalStats(hospRes.value.stats);
        }
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-teal-50/40 to-white pt-16 pb-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Rural Healthcare Access Initiative
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Reaching the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Unreached</span> with Quality Care
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                A dedicated digital health bridge connecting rural, tribal, and remote communities
                with verified doctors, real-time appointment scheduling, and local hospital bed resources.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/doctors"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.02]"
                >
                  <Search className="w-4 h-4" />
                  Find a Doctor
                </Link>
                <Link
                  to="/hospitals"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200 shadow-xs transition-all hover:border-slate-300"
                >
                  <Hospital className="w-4 h-4 text-emerald-600" />
                  View Hospital Beds
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium text-slate-600 hover:text-emerald-700"
                >
                  Join as Volunteer Doctor <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80">
                <div>
                  <div className="text-2xl font-bold text-slate-900">100%</div>
                  <div className="text-xs text-slate-500 font-medium">Free/Subsidized Care</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-700">8+</div>
                  <div className="text-xs text-slate-500 font-medium">Medical Specialties</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-teal-700">24/7</div>
                  <div className="text-xs text-slate-500 font-medium">Slot Availability</div>
                </div>
              </div>
            </div>

            {/* Right Card / Visual Banner */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 relative">
                <div className="absolute -top-3 -right-3 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  Active Mission
                </div>

                <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Community Health Portal</h3>
                    <p className="text-xs text-slate-500">Live rural healthcare dispatch</p>
                  </div>
                </div>

                <div className="space-y-4 pt-5">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                        DR
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-800">Primary General Care</div>
                        <div className="text-[11px] text-slate-500">Fever, respiratory, pediatrics</div>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Open Slots
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                        EM
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-800">Emergency & Bed Status</div>
                        <div className="text-[11px] text-slate-500">
                          {hospitalStats ? `${hospitalStats.availableBeds} beds available` : 'Real-time telemetry'}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                      Live
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white space-y-2">
                    <div className="text-xs uppercase tracking-wider text-emerald-100 font-semibold">
                      Need Immediate Help?
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">Ambulance: 108</span>
                      <PhoneCall className="w-5 h-5 text-emerald-200" />
                    </div>
                    <div className="text-[11px] text-emerald-100">
                      National emergency medical services available 24/7.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Designed for Underserved Communities
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Removing distance and access barriers to bring verified medical professionals directly to villages and towns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Verified Doctors</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Certified practitioners across Internal Medicine, Pediatrics, Cardiology, Obstetrics, and Orthopedics committed to rural health missions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Double-Booking Guard</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time slot reservation backend guarantees that patient time is respected and double-bookings are strictly prohibited.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
              <Hospital className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Rural Hospital Bed Tracker</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transparent live visibility into inpatient beds, ICU availability, and healthcare facilities across neighboring community health centers.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-50 py-16 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-bold text-emerald-700 tracking-wider">
              Step-by-Step Guidance
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              How the Consultation System Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Find Doctors',
                desc: 'Filter by specialty, village district, or hospital clinic affiliation.',
              },
              {
                step: '02',
                title: 'Choose Slot',
                desc: 'Select preferred date and pick an active unreserved time window.',
              },
              {
                step: '03',
                title: 'Confirm Booking',
                desc: 'State your symptoms or consultation reason and receive immediate confirmation.',
              },
              {
                step: '04',
                title: 'Receive Consultation',
                desc: 'Meet the doctor at the clinic or outreach center for treatment.',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative"
              >
                <div className="text-3xl font-extrabold text-emerald-600/30 mb-2">
                  {item.step}
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">{item.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors Section Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs uppercase font-bold text-emerald-700 tracking-wider">
              Dedicated Specialists
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Meet Available Doctors
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Verified healthcare providers ready for rural consultations
            </p>
          </div>
          <Link
            to="/doctors"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            View All Doctors ({featuredDoctors.length}+) <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading doctors..." />
        ) : featuredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDoctors.map((doc) => (
              <div
                key={doc._id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
              >
                <div className="h-44 bg-slate-100 overflow-hidden relative">
                  <img
                    src={doc.profileImage || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'}
                    alt={doc.name}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs text-[11px] font-bold text-emerald-800 px-2 py-0.5 rounded-md shadow-xs">
                    {doc.specialization}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{doc.name}</h3>
                    <p className="text-xs text-slate-500">{doc.qualification}</p>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{doc.hospital}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700">
                      {doc.consultationFee === 0 ? 'Free Consultation' : `₹${doc.consultationFee}`}
                    </span>
                    <Link
                      to={`/doctors/${doc._id}`}
                      className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors"
                    >
                      Book Slot
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50 rounded-2xl">
            <p className="text-sm text-slate-500">No doctors found in catalog. Run database seeding to view sample doctors.</p>
          </div>
        )}
      </section>

      {/* Healthcare Accessibility Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-800 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-200">
              Community Health Empowerment
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Are you a doctor or rural healthcare worker?
            </h2>
            <p className="text-sm text-emerald-100 leading-relaxed">
              Join our network of medical volunteers and clinic partners. Manage your availability
              schedules, accept patient appointments, and serve those who need it most.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="px-6 py-3 rounded-xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 transition-colors shadow-sm"
              >
                Register as Doctor
              </Link>
              <Link
                to="/hospitals"
                className="px-6 py-3 rounded-xl bg-emerald-600/40 border border-emerald-400/40 text-white font-semibold text-xs hover:bg-emerald-600/60 transition-colors"
              >
                Check Bed Availability
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

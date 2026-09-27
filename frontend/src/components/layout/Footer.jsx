import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, PhoneCall, ShieldCheck, MapPin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Mission & Brand */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="text-white font-bold tracking-tight text-base">
                Reaching the Unreached
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bridging the healthcare divide by connecting remote and underserved rural populations
              with qualified doctors, community clinics, and hospital bed resources.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Doctors & Direct Appointments</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-3">
              Explore Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/doctors" className="hover:text-emerald-400 transition-colors">
                  Find Doctors by Specialization
                </Link>
              </li>
              <li>
                <Link to="/hospitals" className="hover:text-emerald-400 transition-colors">
                  Hospital Bed Availability
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-emerald-400 transition-colors">
                  Register as Patient or Doctor
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors">
                  Account Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Specializations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-3">
              Specialized Care
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>General Physicians & Rural Medicine</li>
              <li>Pediatrics & Child Wellness</li>
              <li>Maternal & Gynecological Health</li>
              <li>Cardiovascular & Chronic Care</li>
              <li>Dermatology & Skin Disorders</li>
            </ul>
          </div>

          {/* Emergency & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-3">
              Rural Health Helpline
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-rose-400 font-semibold">
                <PhoneCall className="w-4 h-4" />
                <span>Emergency Ambulance: 108</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>Tele-Consult Toll Free: 1800-2026-CARE</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-4 h-4" />
                <span>care@reachingtheunreached.org</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} Reaching the Unreached. College Project Demonstration.</p>
          <div className="flex gap-4">
            <span>Powered by React, Node.js, Express & MongoDB Atlas</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

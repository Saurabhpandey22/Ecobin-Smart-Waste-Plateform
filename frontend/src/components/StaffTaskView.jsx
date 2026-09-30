import React, { useState, useEffect } from 'react';
import { 
  Navigation, MapPin, CheckCircle2, AlertTriangle, Truck, 
  Clock, Camera, ChevronRight, ShieldCheck, RefreshCw, Upload
} from 'lucide-react';
import translations from '../utils/i18n';
import { api } from '../services/api';

import ImageUploader from './ImageUploader';

export default function StaffTaskView({ user, lang }) {
  const t = translations[lang] || translations.en;
  
  const [route, setRoute] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proofPhotoUrl, setProofPhotoUrl] = useState('');
  const [resolvingId, setResolvingId] = useState(null);

  useEffect(() => {
    loadStaffTasks();
  }, [user]);

  const loadStaffTasks = async () => {
    try {
      setLoading(true);
      const [routeRes, compRes] = await Promise.all([
        api.getRouteOptimization(user ? user.id : 2),
        api.getComplaints()
      ]);

      if (routeRes.success) setRoute(routeRes.route);
      if (compRes.success) setComplaints(compRes.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveTask = async (complaintId) => {
    try {
      const res = await api.updateComplaintStatus(complaintId, {
        status: 'resolved',
        proof_photo_url: proofPhotoUrl || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80'
      });

      if (res.success) {
        alert(`Complaint #${complaintId} marked resolved! Verified proof photo attached.`);
        setResolvingId(null);
        setProofPhotoUrl('');
        loadStaffTasks();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Staff Mobile Hero Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-emerald-700/30">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            SANITATION OFFICER CONSOLE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1 tracking-tight">
            {user?.name || 'Sanitation Staff'}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/80 mt-1 flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Assigned Ward: {user?.ward_area || 'Ward 14 - Connaught Place'}</span>
          </p>
        </div>

        <button
          onClick={loadStaffTasks}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Tasks</span>
        </button>
      </div>

      {/* Smart Route Optimizer Card */}
      {route && (
        <div className="p-6 rounded-3xl glass-panel bg-white/90 dark:bg-slate-800/90 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  AI Smart Route Optimization
                </h3>
                <span className="text-xs text-slate-400">
                  Optimal path combining high-fill bins + urgent complaints
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 block">
                {route.totalDistanceKm} km
              </span>
              <span className="text-[11px] text-slate-400">Est. {route.estimatedTimeMinutes} mins</span>
            </div>
          </div>

          {/* Ordered Route Waypoint List */}
          <div className="space-y-2.5">
            {route.waypoints.map((wp) => (
              <div
                key={wp.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    {wp.step}
                  </span>
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">
                      {wp.title}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {wp.subtitle} ({wp.legDistanceKm} km leg)
                    </span>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                  wp.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-amber-100 text-amber-800'
                }`}>
                  {wp.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assigned Complaints Task Cards */}
      <div className="space-y-3">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
          Assigned Tasks & Action Console
        </h3>

        {complaints.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 glass-panel rounded-2xl">
            No pending tasks assigned in your ward. Great job!
          </div>
        ) : (
          complaints.map((c) => (
            <div
              key={c.id}
              className={`p-5 rounded-3xl glass-panel bg-white/90 dark:bg-slate-800/90 shadow-sm border ${
                c.status === 'resolved' ? 'border-emerald-300/60 opacity-80' : 'border-amber-300/80 dark:border-amber-700/60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block">
                    Task #{c.id} • {c.type.replace('_', ' ')}
                  </span>
                  <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-1">
                    {c.description}
                  </h4>
                  <span className="text-xs text-slate-400 mt-1 block">📍 {c.address_text}</span>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  c.status === 'resolved'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 animate-pulse'
                }`}>
                  {c.status}
                </span>
              </div>

              {/* Action Form to Mark Resolved with Proof Photo */}
              {c.status !== 'resolved' && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 space-y-3">
                  {resolvingId === c.id ? (
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 space-y-3">
                      <ImageUploader
                        value={proofPhotoUrl}
                        onChange={(url) => setProofPhotoUrl(url)}
                        label="Upload Proof-of-Collection Photo from Device"
                        presetSamples={[
                          { label: '✨ Clean Dustbin Proof', url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80' }
                        ]}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setResolvingId(null)}
                          className="px-3 py-1.5 rounded-xl bg-slate-200 text-xs font-bold text-slate-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleResolveTask(c.id)}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                        >
                          Submit Proof & Resolve
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setResolvingId(c.id);
                        setProofPhotoUrl('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80');
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Task Completed (Upload Proof)</span>
                    </button>
                  )}
                </div>
              )}

            </div>
          ))
        )}
      </div>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, Clock, CheckCircle2, RefreshCw, Filter, Search, 
  UserCheck, MapPin, Eye, Calendar, Sparkles, FileText, Download, ShieldAlert, X, PlusCircle
} from 'lucide-react';
import translations from '../utils/i18n';
import { api, socket } from '../services/api';

export default function AdminComplaintsDashboard({ user, lang, onOpenSustainabilityReport }) {
  const t = translations[lang] || translations.en;
  
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newAlertBadge, setNewAlertBadge] = useState(false);
  const [isCreatingDemo, setIsCreatingDemo] = useState(false);

  // Filters state
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [wardFilter, setWardFilter] = useState('all');
  const [staffFilter, setStaffFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDashboardData();

    // Listen to real-time complaint updates
    const handleNewComplaint = (newComp) => {
      setComplaints(prev => {
        if (prev.some(c => c.id === newComp.id)) return prev;
        return [newComp, ...prev];
      });
      setNewAlertBadge(true);
      loadDashboardData(false);
    };

    const handleUpdatedComplaint = (updatedComp) => {
      setComplaints(prev => prev.map(c => c.id === updatedComp.id ? { ...c, ...updatedComp } : c));
      loadDashboardData(false);
    };

    socket.on('new_complaint', handleNewComplaint);
    socket.on('complaint_updated', handleUpdatedComplaint);

    return () => {
      socket.off('new_complaint', handleNewComplaint);
      socket.off('complaint_updated', handleUpdatedComplaint);
    };
  }, [statusFilter, typeFilter, priorityFilter, wardFilter, staffFilter, searchQuery]);

  const loadDashboardData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      const [statsRes, complaintsRes] = await Promise.all([
        api.getSummaryStats().catch(err => {
          console.error('getSummaryStats error:', err);
          return { success: false };
        }),
        api.getComplaints({
          scope: 'all',
          status: statusFilter,
          type: typeFilter,
          priority: priorityFilter,
          ward_area: wardFilter,
          staff_id: staffFilter,
          search: searchQuery
        }).catch(err => {
          console.error('getComplaints error:', err);
          return { success: false };
        })
      ]);

      if (statsRes && statsRes.success) {
        setStats(statsRes.stats);
        setStaffList(statsRes.staffList || []);
      }

      if (complaintsRes && complaintsRes.success) {
        setComplaints(complaintsRes.complaints || []);
      }
    } catch (err) {
      console.error('Failed to load admin complaints dashboard data:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // 1-Click Demo Complaint Creator for testing real-time stream
  const handleCreateDemoComplaint = async () => {
    try {
      setIsCreatingDemo(true);
      const res = await api.createComplaint({
        type: 'overflowing_bin',
        description: `TEST GARBAGE OVERFLOW REPORT (Logged at ${new Date().toLocaleTimeString()}) - Needs urgent municipal truck dispatch.`,
        photo_url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
        latitude: 28.6315,
        longitude: 77.2167,
        address_text: 'Palika Bazaar Entry Gate No. 2, Connaught Place',
        ward_area: 'Ward 14 - Connaught Place',
        priority: 'high'
      });

      if (res.success) {
        setNewAlertBadge(true);
        loadDashboardData(false);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setIsCreatingDemo(false);
    }
  };

  const handleAssignStaff = async (complaintId, staffId) => {
    try {
      const res = await api.assignComplaintStaff(complaintId, staffId);
      if (res.success) {
        loadDashboardData(false);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateStatus = async (complaintId, newStatus) => {
    try {
      const res = await api.updateComplaintStatus(complaintId, { status: newStatus });
      if (res.success) {
        loadDashboardData(false);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white shadow-xl relative overflow-hidden border border-emerald-700/30">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              UNIFIED COMPLAINTS DASHBOARD
            </span>
            {newAlertBadge && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white animate-pulse">
                🔔 Live Complaint Arrived!
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mt-1 tracking-tight">
            Centralized Grievance Control Center
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/80 mt-1">
            Real-time municipal complaints tracking, instant staff assignment, & resolution timeline.
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-wrap">
          <button
            onClick={handleCreateDemoComplaint}
            disabled={isCreatingDemo}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-md"
            title="Create instant test complaint to verify live real-time stream"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isCreatingDemo ? 'Creating...' : '+ Test Demo Complaint'}</span>
          </button>

          <button
            onClick={() => onOpenSustainabilityReport && onOpenSustainabilityReport()}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-semibold text-white transition-colors flex items-center space-x-1.5 border border-white/20"
          >
            <FileText className="w-4 h-4 text-emerald-300" />
            <span>Impact Report</span>
          </button>

          <button
            onClick={() => loadDashboardData(true)}
            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            title="Refresh Complaints Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl glass-panel bg-white/90 dark:bg-slate-800/90 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">{t.totalComplaints}</span>
            <AlertCircle className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {stats ? stats.totalComplaints : '...'}
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">All Citizens & Wards</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel bg-amber-50/70 dark:bg-amber-950/20 shadow-sm border border-amber-200/60 dark:border-amber-800/40">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">{t.pendingComplaints}</span>
            <Clock className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <p className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-2">
            {stats ? stats.pendingComplaints : '...'}
          </p>
          <span className="text-[10px] text-amber-600 font-medium">Requires Staff Dispatch</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel bg-sky-50/70 dark:bg-sky-950/20 shadow-sm border border-sky-200/60 dark:border-sky-800/40">
          <div className="flex items-center justify-between text-sky-600 dark:text-sky-400">
            <span className="text-xs font-bold uppercase tracking-wider">{t.inProgressComplaints}</span>
            <RefreshCw className="w-4 h-4 text-sky-500 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <p className="text-2xl font-black text-sky-700 dark:text-sky-300 mt-2">
            {stats ? stats.inProgressComplaints : '...'}
          </p>
          <span className="text-[10px] text-sky-600 font-medium">Staff En-Route</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel bg-emerald-50/70 dark:bg-emerald-950/20 shadow-sm border border-emerald-200/60 dark:border-emerald-800/40">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">{t.resolvedToday}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-2">
            {stats ? stats.resolvedToday : '...'}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Verified Cleared</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel bg-purple-50/70 dark:bg-purple-950/20 shadow-sm border border-purple-200/60 dark:border-purple-800/40 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
            <span className="text-xs font-bold uppercase tracking-wider">{t.avgResolutionTime}</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-2">
            {stats ? `${stats.avgResolutionTimeHours} hrs` : '...'}
          </p>
          <span className="text-[10px] text-purple-600 font-medium">Municipal SLA Target</span>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="p-4 rounded-2xl glass-panel bg-white/90 dark:bg-slate-800/90 shadow-sm border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="reported">Reported (Pending)</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Ward Filter */}
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Wards / Zones</option>
              <option value="Ward 14 - Connaught Place">Ward 14 - Connaught Place</option>
              <option value="Ward 08 - South Extension">Ward 08 - South Extension</option>
              <option value="Ward 02 - Hauz Khas">Ward 02 - Hauz Khas</option>
              <option value="Ward 22 - Noida Sector 62">Ward 22 - Noida Sector 62</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Complaints Data Table */}
      <div className="rounded-2xl glass-panel bg-white/90 dark:bg-slate-800/90 shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Live Complaints Stream
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {complaints.length} Items
            </span>
          </div>
          <span className="text-xs text-slate-400 italic">Unresolved issues highlighted at top</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <th className="py-3.5 px-4">Complaint ID</th>
                <th className="py-3.5 px-4">Citizen</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Location / Ward</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Assigned Staff</th>
                <th className="py-3.5 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    Loading live complaints stream...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    No complaints found matching current filter parameters.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => {
                  const isUnresolved = c.status !== 'resolved';
                  return (
                    <tr
                      key={c.id}
                      className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-750 ${
                        isUnresolved ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                        #{c.id}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {c.citizen_name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3 px-4 capitalize font-medium text-slate-700 dark:text-slate-300">
                        {c.type.replace('_', ' ')}
                      </td>

                      <td className="py-3 px-4 max-w-xs truncate">
                        <span className="font-medium text-slate-800 dark:text-slate-200 block truncate">
                          {c.address_text || c.ward_area}
                        </span>
                        <span className="text-[10px] text-slate-400">{c.ward_area}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.priority === 'critical' || c.priority === 'high'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {c.priority}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={c.status}
                          onChange={(e) => handleUpdateStatus(c.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border focus:outline-none ${
                            c.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                              : c.status === 'in-progress'
                              ? 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          <option value="reported">Reported</option>
                          <option value="acknowledged">Acknowledged</option>
                          <option value="in-progress">In-Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={c.assigned_staff_id || ''}
                          onChange={(e) => handleAssignStaff(c.id, e.target.value)}
                          className="px-2 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
                        >
                          <option value="">-- Assign Staff --</option>
                          {staffList.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.ward_area})
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedComplaint(c)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-semibold text-xs transition-colors inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Panel Drawer for Full Complaint Detail */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl p-6 overflow-y-auto space-y-5 border-l border-slate-200 dark:border-slate-800">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase">Complaint Dossier</span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  Complaint #{selectedComplaint.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Preview */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 relative">
              <img
                src={selectedComplaint.photo_url}
                alt="Complaint evidence"
                className="w-full h-56 object-cover"
              />
              <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold bg-black/70 text-white backdrop-blur-md">
                🤖 AI Detection: {selectedComplaint.ai_classification || 'Waste Issue'}
              </span>
            </div>

            {/* Description & Metadata */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase">Citizen Description</span>
                <p className="mt-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                  {selectedComplaint.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-400 block font-semibold">Location / Address</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                    {selectedComplaint.address_text}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-400 block font-semibold">Ward / Area</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                    {selectedComplaint.ward_area}
                  </span>
                </div>
              </div>

              {/* Status & Staff Assignment Controls */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 block">Resolution Workflow</span>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedComplaint.status}
                    onChange={(e) => {
                      handleUpdateStatus(selectedComplaint.id, e.target.value);
                      setSelectedComplaint({ ...selectedComplaint, status: e.target.value });
                    }}
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border text-xs font-bold"
                  >
                    <option value="reported">Reported</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="in-progress">In-Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>

                  <select
                    value={selectedComplaint.assigned_staff_id || ''}
                    onChange={(e) => {
                      handleAssignStaff(selectedComplaint.id, e.target.value);
                      setSelectedComplaint({ ...selectedComplaint, assigned_staff_id: Number(e.target.value) });
                    }}
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border text-xs font-bold"
                  >
                    <option value="">Assign Officer</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Proof Photo if resolved */}
              {selectedComplaint.proof_photo_url && (
                <div>
                  <span className="font-bold text-emerald-600 block mb-1">Staff Proof-of-Collection Photo</span>
                  <img
                    src={selectedComplaint.proof_photo_url}
                    alt="Proof of resolution"
                    className="w-full h-40 object-cover rounded-xl border border-emerald-300"
                  />
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

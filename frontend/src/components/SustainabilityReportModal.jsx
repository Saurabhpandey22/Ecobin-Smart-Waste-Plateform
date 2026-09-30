import React, { useState, useEffect } from 'react';
import { FileText, Download, X, Printer, Leaf, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function SustainabilityReportModal({ isOpen, onClose }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadReport();
    }
  }, [isOpen]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await api.getSustainabilityReport();
      if (res.success) {
        setReport(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                OFFICIAL MUNICIPAL AUDIT REPORT
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
                Sustainability Impact Report
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Compiling monthly impact statistics...</div>
        ) : report ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-400 block">{report.tagline}</span>
                <span className="text-sm font-extrabold text-slate-100">{report.reportMonth}</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                Verified Clean Audit
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Waste Collected</span>
                <span className="text-lg font-black text-slate-900 dark:text-slate-100 mt-1 block">
                  {report.metrics.totalWasteCollectedKg} kg
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Recycling Rate</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {report.metrics.recyclingRatePercent}%
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">CO2 Saved</span>
                <span className="text-lg font-black text-cyan-600 dark:text-cyan-400 mt-1 block">
                  {report.metrics.co2EmissionsSavedKg} kg
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Landfill Diverted</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {report.metrics.landfillDivertedKg} kg
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Trees Equivalent</span>
                <span className="text-lg font-black text-amber-500 mt-1 block">
                  🌳 {report.metrics.treesPlantedEquivalent} trees
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Complaints Cleared</span>
                <span className="text-lg font-black text-purple-600 dark:text-purple-400 mt-1 block">
                  {report.metrics.totalComplaintsResolved}
                </span>
              </div>
            </div>

            {/* Ward Breakdown Table */}
            <div>
              <h4 className="font-bold text-xs uppercase text-slate-400 mb-2">Ward & Zone Performance Breakdown</h4>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                    <tr>
                      <th className="py-2 px-3">Ward / Area</th>
                      <th className="py-2 px-3">Waste Collected</th>
                      <th className="py-2 px-3 text-right">Recycling %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {report.wardBreakdown.map((w, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">{w.ward}</td>
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{w.wasteKg} kg</td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-600">{w.recyclingRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official PDF</span>
              </button>
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
}

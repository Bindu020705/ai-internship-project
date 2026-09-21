import React from 'react';
import type { AnalyticsResult, ForecastResult } from '../types';
import { ForecastChart } from '../components/charts/ForecastChart';
import { BarChart3, AlertTriangle } from 'lucide-react';

interface AnalyticsPageProps {
  analytics: AnalyticsResult | null;
  forecast: ForecastResult | null;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ analytics, forecast }) => {
  if (!analytics) {
    return (
      <div className="py-20 text-center text-slate-400">
        Please load or upload a dataset to view detailed data science metrics.
      </div>
    );
  }

  return (
    <div className="space-y-10 py-4">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-cyan-400" />
          Data Science & Analytics Engine
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Descriptive statistics, activity distribution ratios, statistical anomaly detection, and 7-day ML forecasting.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-slate-200">Descriptive Statistical Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">Total Volume</span>
            <span className="text-lg font-bold text-white">{analytics.total_consumption.toLocaleString()} L</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">Mean Daily</span>
            <span className="text-lg font-bold text-cyan-400">{analytics.mean_daily_consumption} L</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">Median Daily</span>
            <span className="text-lg font-bold text-slate-200">{analytics.median_daily_consumption} L</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">Min Daily</span>
            <span className="text-lg font-bold text-emerald-400">{analytics.min_daily_consumption} L</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">Max Daily</span>
            <span className="text-lg font-bold text-amber-400">{analytics.max_daily_consumption} L</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">Std Deviation</span>
            <span className="text-lg font-bold text-slate-300">±{analytics.std_dev_consumption} L</span>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20">
        <ForecastChart forecast={forecast} historicalRecent={analytics.daily_trend} />
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold text-slate-200">Flagged Statistical Anomalies (Z-Score & IQR)</h2>
        </div>

        {analytics.anomalies.length === 0 ? (
          <p className="text-xs text-slate-400">No statistically significant anomalies detected in this dataset.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/50">
                  <th className="p-3 font-semibold">Date</th>
                  <th className="p-3 font-semibold">Activity Primary</th>
                  <th className="p-3 font-semibold">Observed Vol</th>
                  <th className="p-3 font-semibold">Expected Avg</th>
                  <th className="p-3 font-semibold">Z-Score</th>
                  <th className="p-3 font-semibold">Severity</th>
                  <th className="p-3 font-semibold">Explanation Notice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {analytics.anomalies.map((anom, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-slate-200">{anom.date}</td>
                    <td className="p-3 text-cyan-300">{anom.activity}</td>
                    <td className="p-3 font-bold text-amber-400">{anom.observed_liters} L</td>
                    <td className="p-3 text-slate-400">{anom.expected_liters} L</td>
                    <td className="p-3 font-mono">{anom.z_score}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        anom.severity === 'High' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {anom.severity}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-slate-400 max-w-md leading-relaxed">{anom.explanation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-slate-200">Activity Percentage Distribution</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/50">
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 font-semibold">Total Volume (L)</th>
                <th className="p-3 font-semibold">Daily Average (L/day)</th>
                <th className="p-3 font-semibold">Percentage Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {analytics.activity_breakdown.map((act, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40">
                  <td className="p-3 font-semibold text-slate-200">{act.activity}</td>
                  <td className="p-3">{act.total_liters.toLocaleString()} L</td>
                  <td className="p-3">{act.average_liters} L/day</td>
                  <td className="p-3 font-bold text-cyan-400">{act.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

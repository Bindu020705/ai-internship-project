import React from 'react';
import type { AnalyticsResult, Dataset } from '../types';
import { DailyTrendChart } from '../components/charts/DailyTrendChart';
import { ActivityDonutChart } from '../components/charts/ActivityDonutChart';
import { Droplets, AlertTriangle, Sparkles, TrendingDown, ArrowUpRight, Award, CheckCircle2 } from 'lucide-react';

interface DashboardPageProps {
  analytics: AnalyticsResult | null;
  currentDataset: Dataset | null;
  onNavigateTab: (tab: string) => void;
  onLoadDemo: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  analytics,
  currentDataset,
  onNavigateTab,
  onLoadDemo
}) => {
  if (!analytics || !currentDataset) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="p-4 rounded-full bg-cyan-500/10 text-cyan-400 w-fit mx-auto">
          <Droplets className="w-10 h-10 animate-bounce" />
        </div>
        <h2 className="text-xl font-bold text-slate-200">No Active Water Dataset Loaded</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Start exploring water consumption analytics immediately by loading our 60-day synthetic demo dataset or uploading your own CSV file.
        </p>
        <button
          onClick={onLoadDemo}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20"
        >
          Explore Demo Dataset
        </button>
      </div>
    );
  }

  const weeklyTrend = analytics.weekly_trend || [];
  let weeklyChangePct = 0;
  if (weeklyTrend.length >= 2) {
    const prev = weeklyTrend[weeklyTrend.length - 2].average_total;
    const curr = weeklyTrend[weeklyTrend.length - 1].average_total;
    weeklyChangePct = prev > 0 ? ((curr - prev) / prev) * 100 : 0;
  }

  const topActivityPct = analytics.activity_breakdown.length > 0 ? analytics.activity_breakdown[0].percentage : 0;

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-2xl glass-panel border border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100">{currentDataset.name}</h1>
            {currentDataset.source === 'demo' && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Synthetic Demo Data
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Analyzing {analytics.daily_trend.length} recorded daily entries • SDG 6 Decision Support Active
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onNavigateTab('chat')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 hover:scale-105 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Ask AI Assistant
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-medium text-slate-400">Total Consumption</span>
          <div className="text-2xl font-black text-white">
            {analytics.total_consumption.toLocaleString()}{' '}
            <span className="text-xs font-normal text-cyan-400">Liters</span>
          </div>
          <p className="text-[11px] text-slate-400">Over recorded dataset period</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-medium text-slate-400">Average Daily Consumption</span>
          <div className="text-2xl font-black text-cyan-400">
            {analytics.mean_daily_consumption}{' '}
            <span className="text-xs font-normal text-slate-400">L/day</span>
          </div>
          <p className="text-[11px] text-slate-400">Median: {analytics.median_daily_consumption} L/day</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-medium text-slate-400">Top Consuming Category</span>
          <div className="text-2xl font-black text-emerald-400 truncate">
            {analytics.highest_consuming_activity}
          </div>
          <p className="text-[11px] text-slate-400">{topActivityPct}% of total volume</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-medium text-slate-400">Weekly Change</span>
          <div className={`text-2xl font-black flex items-center gap-1 ${weeklyChangePct <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {weeklyChangePct <= 0 ? (
              <TrendingDown className="w-5 h-5 text-emerald-400" />
            ) : (
              <ArrowUpRight className="w-5 h-5 text-amber-400" />
            )}
            {Math.abs(weeklyChangePct).toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-400">{weeklyChangePct <= 0 ? 'Reduction vs last week' : 'Increase vs last week'}</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/30 to-slate-900 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-semibold text-cyan-300">Sustainability Index</span>
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white glow-text-cyan">
            {analytics.sustainability_index}{' '}
            <span className="text-xs text-slate-400 font-normal">/ 100</span>
          </div>
          <p className="text-[9px] text-slate-400 leading-tight">
            ⚠️ {analytics.sustainability_index_label}
          </p>
        </div>
      </div>

      {analytics.anomalies.length > 0 && (
        <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <p className="font-bold text-amber-300">
              Unusual Usage Pattern Detected ({analytics.anomalies.length} Flagged Day{analytics.anomalies.length > 1 ? 's' : ''})
            </p>
            <p className="text-amber-200/90 leading-relaxed">
              {analytics.anomalies[0].explanation}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800">
          <DailyTrendChart data={analytics.daily_trend} />
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <ActivityDonutChart data={analytics.activity_breakdown} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            AI Decision Support Summary
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your recorded usage pattern indicates that <strong className="text-cyan-300">{analytics.highest_consuming_activity}</strong> represents the single largest contribution ({topActivityPct}% of total volume). Retaining efficient fixtures or adjusting duration in this category will yield the highest immediate conservation impact.
          </p>
          <button
            onClick={() => onNavigateTab('recommendations')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            View Personalized AI Recommendations →
          </button>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            High-Priority Conservation Actions
          </div>
          <ul className="text-xs space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5" />
              <span>Install aerated low-flow showerheads (6-8 LPM) to target bathing volume.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5" />
              <span>Perform overnight water meter dye test to verify silent flapper integrity.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5" />
              <span>Shift outdoor watering to early morning (before 8 AM) to reduce evaporation.</span>
            </li>
          </ul>
          <button
            onClick={() => onNavigateTab('actions')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            Manage Action Plan Tracker →
          </button>
        </div>
      </div>
    </div>
  );
};

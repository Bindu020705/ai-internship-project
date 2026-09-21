import React, { useState, useEffect } from 'react';
import { FileText, Printer, Droplets } from 'lucide-react';
import { apiService } from '../services/api';
import type { ReportResponse, Dataset, ActivityContribution, AnomalyItem, RecommendationItem } from '../types';

interface ReportsPageProps {
  currentDataset: Dataset | null;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ currentDataset }) => {
  const [reportData, setReportData] = useState<ReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentDataset) {
      loadReport(currentDataset.id);
    }
  }, [currentDataset]);

  const loadReport = async (datasetId: string) => {
    setIsLoading(true);
    try {
      const data = await apiService.getReport(datasetId);
      setReportData(data || null);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!currentDataset) {
    return (
      <div className="py-16 text-center text-slate-400 glass-panel rounded-2xl">
        Please select a dataset to view and export the summary report.
      </div>
    );
  }

  if (isLoading || !reportData) {
    return (
      <div className="py-16 text-center text-cyan-400 glass-panel rounded-2xl">
        Generating comprehensive water sustainability report...
      </div>
    );
  }

  const { analytics, recommendations } = reportData;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 print:py-0">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            Water Sustainability Summary Report
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Exportable summary report for dataset: <strong className="text-slate-200">{currentDataset.name}</strong>
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs shadow-md"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF Report
        </button>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-8 print:border-none print:shadow-none print:p-0 bg-slate-950 text-slate-200">
        <div className="border-b border-slate-800 pb-6 flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-lg">
              <Droplets className="w-6 h-6" />
              WaterWise AI Sustainability Report
            </div>
            <p className="text-xs text-slate-400">Dataset: {currentDataset.name} ({currentDataset.row_count} Days Recorded)</p>
          </div>
          <div className="text-right text-xs text-slate-400">
            <p>Generated: {new Date(reportData.generated_at).toLocaleDateString()}</p>
            <p className="text-emerald-400 font-semibold mt-1">SDG 6 Decision Support</p>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">1. Executive Analytics Metrics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Total Recorded Volume</span>
              <span className="text-base font-bold text-white">{analytics.total_consumption.toLocaleString()} L</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Daily Average</span>
              <span className="text-base font-bold text-cyan-400">{analytics.mean_daily_consumption} L/day</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Top Category</span>
              <span className="text-base font-bold text-emerald-400">{analytics.highest_consuming_activity}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Sustainability Index</span>
              <span className="text-base font-bold text-white">{analytics.sustainability_index} / 100</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">2. Activity Consumption Ratios</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {analytics.activity_breakdown.map((act: ActivityContribution, idx: number) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300 font-semibold">{act.activity}</span>
                <span className="font-bold text-cyan-400">{act.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">3. Flagged Unusual Usage Patterns</h2>
          {analytics.anomalies.length === 0 ? (
            <p className="text-xs text-slate-400">No anomalies flagged in this dataset.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {analytics.anomalies.map((anom: AnomalyItem, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-200">
                  <div className="flex justify-between font-bold text-amber-300 mb-1">
                    <span>{anom.date} — {anom.activity}</span>
                    <span>Observed: {anom.observed_liters} L (Avg: {anom.expected_liters} L)</span>
                  </div>
                  <p className="text-[11px] text-amber-200/80">{anom.explanation}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">4. AI-Generated Personalized Recommendations</h2>
          <div className="space-y-2 text-xs">
            {recommendations.slice(0, 3).map((rec: RecommendationItem, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-bold text-slate-100 flex justify-between">
                  <span>{rec.title}</span>
                  <span className="text-cyan-400 font-semibold">{rec.priority} Priority</span>
                </div>
                <p className="text-slate-300 text-[11px]">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

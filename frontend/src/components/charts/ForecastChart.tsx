import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import type { ForecastResult } from '../../types';
import { Sparkles, AlertCircle } from 'lucide-react';

interface ForecastChartProps {
  forecast: ForecastResult | null;
  historicalRecent: Array<{ date: string; total: number }>;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({ forecast, historicalRecent }) => {
  if (!forecast || !forecast.has_enough_data) {
    return (
      <div className="p-6 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-300 text-xs flex items-center gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-400" />
        <div>
          <p className="font-semibold">Insufficient Data for Forecasting</p>
          <p className="text-amber-400/80 mt-0.5">{forecast?.disclaimer || 'More historical data (minimum 7 days) is required to generate a reliable forecast.'}</p>
        </div>
      </div>
    );
  }

  const chartData = [
    ...historicalRecent.slice(-7).map(h => ({
      date: h.date,
      historical: h.total,
      forecast: null,
      type: 'Historical'
    })),
    ...forecast.predictions.map(f => ({
      date: f.date,
      historical: null,
      forecast: f.predicted_liters,
      type: 'Forecast'
    }))
  ];

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            7-Day Water Consumption ML Forecast
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{forecast.confidence}</p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
          Model Estimate
        </span>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 11 }} />
            <YAxis stroke="#64748B" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                borderColor: '#00ECEC',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Legend />
            <Bar dataKey="historical" name="Observed Daily Total (L)" fill="#00A8E8" radius={[4, 4, 0, 0]} />
            <Line
              type="monotone"
              dataKey="forecast"
              name="Predicted Estimate (L)"
              stroke="#00ECEC"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ r: 5, fill: '#00ECEC' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-slate-400 italic mt-3 text-center">
        ⚠️ Disclaimer: {forecast.disclaimer}
      </p>
    </div>
  );
};

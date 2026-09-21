import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

interface DailyTrendChartProps {
  data: Array<{ date: string; total: number; [key: string]: any }>;
}

export const DailyTrendChart: React.FC<DailyTrendChartProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'total' | 'stacked'>('total');

  if (!data || data.length === 0) {
    return <div className="text-slate-400 text-sm py-10 text-center">No trend data available.</div>;
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-slate-200">Daily Water Consumption Trend (Liters)</h3>
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('total')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              viewMode === 'total' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Total Volume
          </button>
          <button
            onClick={() => setViewMode('stacked')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              viewMode === 'stacked' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Activity Stack
          </button>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00A8E8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#00A8E8" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 11 }} />
            <YAxis stroke="#64748B" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                borderColor: '#00A8E8',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#F8FAFC'
              }}
            />
            {viewMode === 'total' ? (
              <Area
                type="monotone"
                dataKey="total"
                name="Total Liters"
                stroke="#00ECEC"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTotal)"
              />
            ) : (
              <>
                <Area type="monotone" dataKey="bathing" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="gardening" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="laundry" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                <Area type="monotone" dataKey="toilet" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="cleaning" stackId="1" stroke="#EC4899" fill="#EC4899" fillOpacity={0.6} />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

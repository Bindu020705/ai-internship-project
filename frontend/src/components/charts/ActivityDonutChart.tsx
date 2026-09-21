import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import type { ActivityContribution } from '../../types';

interface ActivityDonutChartProps {
  data: ActivityContribution[];
}

const COLORS = [
  '#00A8E8',
  '#00ECEC',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#64748B'
];

export const ActivityDonutChart: React.FC<ActivityDonutChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-slate-400 text-sm py-10 text-center">No activity data available.</div>;
  }

  const chartData = data.map((item) => ({
    name: item.activity,
    value: item.percentage,
    liters: item.total_liters,
    average: item.average_liters
  }));

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-slate-200 mb-4">Activity Percentage Breakdown</h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={95}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#0F172A" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-slate-900 border border-cyan-500/40 p-3 rounded-lg shadow-xl text-xs">
                      <p className="font-bold text-cyan-300 mb-1">{item.name}</p>
                      <p className="text-slate-200">Share: <span className="font-semibold text-emerald-400">{item.value}%</span></p>
                      <p className="text-slate-300">Total: {item.liters} L</p>
                      <p className="text-slate-400">Daily Avg: {item.average} L/day</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

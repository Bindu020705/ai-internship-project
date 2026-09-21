import React from 'react';
import { Droplets, ShieldCheck, Cpu, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-slate-950/90 text-slate-400 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-lg">
              <Droplets className="w-5 h-5 text-cyan-400" />
              <span>WaterWise AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-powered decision-support platform designed to transform raw water consumption data into actionable sustainability insights, anomaly alerts, and personalized conservation plans.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" />
              SDG 6 Alignment
            </h4>
            <ul className="text-xs space-y-1.5 text-slate-400">
              <li>Target 6.1 — Universal Safe Water Access</li>
              <li>Target 6.4 — Increase Water-Use Efficiency</li>
              <li>Target 6.b — Community Management Support</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Technology Stack
            </h4>
            <ul className="text-xs space-y-1.5 text-slate-400">
              <li>Data Science & Analytics (Pandas/NumPy)</li>
              <li>RAG Knowledge Engine (ChromaDB)</li>
              <li>IBM Granite AI Integration</li>
              <li>Scikit-Learn ML Forecasting</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              Grounded AI & Safety
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              All metrics are calculated strictly from recorded dataset values. Personal Water Sustainability Index is an application-defined indicator.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/50 text-center text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>© 2026 WaterWise AI. Built for SDG 6 Clean Water & Sanitation.</span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            System Operational • FastAPI Backend & React Frontend
          </span>
        </div>
      </div>
    </footer>
  );
};

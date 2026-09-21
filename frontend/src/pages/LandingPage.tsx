import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Database, Cpu, Bot, CheckCircle2, Award } from 'lucide-react';

interface LandingPageProps {
  onExploreDemo: () => void;
  onGoToUpload: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onExploreDemo, onGoToUpload }) => {
  return (
    <div className="space-y-16 py-6">
      <section className="relative overflow-hidden rounded-3xl glass-panel p-8 sm:p-14 border border-cyan-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Award className="w-3.5 h-3.5" />
            Aligned with UN SDG 6 — Clean Water & Sanitation
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Understand your water.{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent glow-text-cyan">
              Make every drop count.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Convert raw household water consumption measurements into actionable sustainability insights, anomaly alerts, 7-day ML forecasts, and personalized conservation plans using Data Science, RAG, and IBM Granite AI.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={onExploreDemo}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              Explore Demo Dataset
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onGoToUpload}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-cyan-500/30 transition-all hover:border-cyan-400"
            >
              <Database className="w-4 h-4 text-cyan-400" />
              Upload Your Water CSV
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-100">Grounded AI Architecture Pipeline</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Strict separation between measured data, data science math, RAG retrieval, and LLM synthesis.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { step: '01', title: 'Data Input', desc: 'CSV / Manual Entry', icon: Database, color: 'text-cyan-400' },
            { step: '02', title: 'Data Science', desc: 'Pandas & Anomalies', icon: Cpu, color: 'text-sky-400' },
            { step: '03', title: 'RAG Retrieval', desc: 'Authoritative Docs', icon: ShieldCheck, color: 'text-emerald-400' },
            { step: '04', title: 'IBM Granite', desc: 'Structured Prompts', icon: Bot, color: 'text-purple-400' },
            { step: '05', title: 'AI Insights', desc: 'Grounded Analysis', icon: Sparkles, color: 'text-amber-400' },
            { step: '06', title: 'Action Plan', desc: 'Tracked Impact', icon: CheckCircle2, color: 'text-emerald-400' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="glass-panel p-4 rounded-2xl border border-slate-800/80 text-center space-y-2 hover:border-cyan-500/30 transition-all">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  Step {item.step}
                </span>
                <div className="flex justify-center my-1">
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <h3 className="text-xs font-bold text-slate-200">{item.title}</h3>
                <p className="text-[11px] text-slate-400">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-100">Dynamic Activity & Anomaly Engine</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Calculates exact category percentages (bathing, laundry, gardening, etc.) and flags statistically unusual usage using Z-score and IQR algorithms without making unsupported leak diagnostic claims.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-100">RAG Knowledge Retrieval</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Retrieves verified water conservation guidance from authoritative sources (UN SDG 6, efficiency benchmarks, fixture aerators, rain harvesting) with full source citations attached.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 w-fit">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-100">IBM Granite & Action Planning</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Passes measured statistics + retrieved knowledge context into IBM Granite to produce tailored action plans. Easily convert AI recommendations into tracked daily goals.
          </p>
        </div>
      </section>
    </div>
  );
};

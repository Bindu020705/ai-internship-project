import React from 'react';
import { Droplets, LayoutDashboard, Database, BarChart3, Bot, Sparkles, CheckSquare, BookOpen, FileText, Globe } from 'lucide-react';
import type { Dataset } from '../../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  datasets: Dataset[];
  selectedDatasetId: string | null;
  onSelectDataset: (id: string) => void;
  onLoadDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  datasets,
  selectedDatasetId,
  onSelectDataset,
  onLoadDemo
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'data', label: 'My Data', icon: Database },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'chat', label: 'AI Assistant', icon: Bot },
    { id: 'recommendations', label: 'Insights', icon: Sparkles },
    { id: 'actions', label: 'Action Plan', icon: CheckSquare },
    { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-cyan-500/20 backdrop-blur-md bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
              <Droplets className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-white bg-clip-text text-transparent">
                WaterWise AI
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                SDG 6
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {datasets.length > 0 ? (
              <select
                value={selectedDatasetId || ''}
                onChange={(e) => onSelectDataset(e.target.value)}
                className="bg-slate-900/90 border border-cyan-500/30 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 max-w-[180px] sm:max-w-[240px] truncate"
              >
                {datasets.map((d) => {
                  let badge = '[CSV]';
                  if (d.source === 'demo' || d.source === 'synthetic') badge = '[Synthetic]';
                  if (d.source === 'manual') badge = '[Manual]';
                  return (
                    <option key={d.id} value={d.id}>
                      {badge} {d.name} ({d.row_count}d)
                    </option>
                  );
                })}
              </select>

            ) : (
              <button
                onClick={onLoadDemo}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 transition-all"
              >
                <Globe className="w-3.5 h-3.5" />
                Explore Demo
              </button>
            )}
          </div>
        </div>

        <div className="md:hidden flex items-center gap-1 overflow-x-auto py-2 custom-scrollbar border-t border-slate-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                  isActive ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

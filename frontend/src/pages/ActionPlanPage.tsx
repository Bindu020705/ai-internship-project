import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Trash2 } from 'lucide-react';
import { apiService } from '../services/api';
import type { ActionPlanItem } from '../types';

export const ActionPlanPage: React.FC = () => {
  const [actions, setActions] = useState<ActionPlanItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Not Started' | 'In Progress' | 'Completed'>('All');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    loadActions();
  }, []);

  const loadActions = async () => {
    try {
      const data = await apiService.getActionPlan();
      setActions(data);
    } catch (err) {
      console.error('Failed to load action plan:', err);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'Not Started' | 'In Progress' | 'Completed') => {
    try {
      await apiService.updateActionItemStatus(id, newStatus);
      setActions((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
    } catch (err) {
      console.error('Error updating action status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteActionItem(id);
      setActions((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Error deleting action:', err);
    }
  };

  const handleCreateAction = async () => {
    if (!newTitle.trim()) return;
    try {
      const item = await apiService.createActionItem(newTitle, newDesc, 'Medium', 'Easy');
      if (item) {
        setActions((prev) => [item, ...prev]);
        setNewTitle('');
        setNewDesc('');
        setShowAddModal(false);
      }
    } catch (err) {
      console.error('Error creating action:', err);
    }
  };

  const completedCount = actions.filter((a) => a.status === 'Completed').length;
  const totalCount = actions.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredActions = actions.filter((a) => {
    if (activeFilter === 'All') return true;
    return a.status === activeFilter;
  });

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 rounded-2xl glass-panel border border-emerald-500/20">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-emerald-400" />
            My Sustainability Action Plan Tracker
          </h1>
          <p className="text-xs text-slate-400">
            Convert AI insights into daily household habits and track your behavior changes over time.
          </p>
        </div>

        <div className="w-full md:w-72 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300">Action Plan Progress</span>
            <span className="font-bold text-emerald-400">{completedCount} / {totalCount} ({progressPct}%)</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
          {(['All', 'Not Started', 'In Progress', 'Completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeFilter === tab
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-semibold text-xs shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          Add Custom Action
        </button>
      </div>

      {filteredActions.length === 0 ? (
        <div className="p-12 text-center text-slate-400 glass-panel rounded-2xl">
          No action plan items found for this view.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredActions.map((item) => (
            <div
              key={item.id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
            >
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-100">{item.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.priority === 'High' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {item.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleStatusChange(item.id, 'Not Started')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    item.status === 'Not Started'
                      ? 'bg-slate-800 text-slate-200 border border-slate-700'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Not Started
                </button>
                <button
                  onClick={() => handleStatusChange(item.id, 'In Progress')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    item.status === 'In Progress'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => handleStatusChange(item.id, 'Completed')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    item.status === 'Completed'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Completed
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 max-w-md w-full space-y-4 bg-slate-900">
            <h3 className="text-base font-bold text-slate-100">Add Custom Sustainability Action</h3>

            <input
              type="text"
              placeholder="Action Title (e.g., Install Faucet Aerators)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            />

            <textarea
              placeholder="Action Description / Goal Details..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 h-24"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAction}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                Add Action Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, CheckCircle, Filter } from 'lucide-react';
import { apiService } from '../services/api';
import type { RecommendationItem, Dataset } from '../types';

interface RecommendationsPageProps {
  currentDataset: Dataset | null;
  onActionAdded: () => void;
}

export const RecommendationsPage: React.FC<RecommendationsPageProps> = ({ currentDataset, onActionAdded }) => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (currentDataset) {
      loadRecommendations(currentDataset.id);
    }
  }, [currentDataset]);

  const loadRecommendations = async (datasetId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getRecommendations(datasetId);
      setRecommendations(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load recommendations.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToPlan = async (item: RecommendationItem) => {
    try {
      await apiService.createActionItem(
        item.title,
        item.description,
        item.priority,
        item.difficulty
      );
      setAddedIds((prev) => new Set(prev).add(item.id));
      onActionAdded();
    } catch (err) {
      console.error('Failed to add action item:', err);
    }
  };

  const filteredRecs = recommendations.filter((r) => {
    if (priorityFilter !== 'All' && r.priority !== priorityFilter) return false;
    if (difficultyFilter !== 'All' && r.difficulty !== difficultyFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            Personalized AI Sustainability Recommendations
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Rule + IBM Granite AI recommendations generated directly from your observed dataset distribution and RAG knowledge.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none"
            >
              <option value="All" className="bg-slate-900">Priority: All</option>
              <option value="High" className="bg-slate-900">Priority: High</option>
              <option value="Medium" className="bg-slate-900">Priority: Medium</option>
              <option value="Low" className="bg-slate-900">Priority: Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none"
            >
              <option value="All" className="bg-slate-900">Difficulty: All</option>
              <option value="Easy" className="bg-slate-900">Easy</option>
              <option value="Moderate" className="bg-slate-900">Moderate</option>
              <option value="Advanced" className="bg-slate-900">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {!currentDataset ? (
        <div className="p-8 text-center text-slate-400 glass-panel rounded-2xl">
          Please select or load a dataset to view AI recommendations.
        </div>
      ) : isLoading ? (
        <div className="p-12 text-center text-cyan-400 space-y-2 glass-panel rounded-2xl">
          <Sparkles className="w-8 h-8 animate-spin mx-auto text-cyan-400" />
          <p className="text-xs font-semibold">Running Hybrid Rule Engine & IBM Granite AI...</p>
        </div>
      ) : error ? (
        <div className="p-6 text-center text-red-300 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRecs.map((rec) => {
            const isAdded = addedIds.has(rec.id);
            return (
              <div
                key={rec.id}
                className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-100">{rec.title}</h3>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rec.priority === 'High' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {rec.priority} Priority
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                        {rec.difficulty}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{rec.description}</p>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                    <span className="font-semibold text-cyan-400 text-[11px] block">Why This Is Relevant To You:</span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{rec.reason}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleAddToPlan(rec)}
                    disabled={isAdded}
                    className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
                      isAdded
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        Added to Action Plan
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add to My Action Plan
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

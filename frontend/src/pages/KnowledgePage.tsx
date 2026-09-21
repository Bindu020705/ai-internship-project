import React, { useState, useEffect } from 'react';
import { BookOpen, Search, FileText } from 'lucide-react';
import { apiService } from '../services/api';
import type { RAGChunk } from '../types';

export const KnowledgePage: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RAGChunk[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadKnowledgeDocs();
  }, []);

  const loadKnowledgeDocs = async () => {
    try {
      const data = await apiService.getKnowledgeDocuments();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load knowledge docs:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await apiService.searchKnowledge(searchQuery, 6);
      if (res) {
        setSearchResults(res.top_chunks);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-8 py-4">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-cyan-400" />
          RAG Knowledge Base & SDG 6 Library
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Explore authoritative water management documents, efficiency benchmarks, and SDG 6 guidelines used by RAG retrieval.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-4">
        <h3 className="text-sm font-bold text-slate-200">Semantic RAG Vector Search</h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search conservation knowledge (e.g., shower aerator flow rate, rain harvesting, silent leaks)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-1.5 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            Search RAG Vector Store
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold text-cyan-400">Top Semantic Retrieval Results ({searchResults.length} Chunks)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((chunk, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-200">{chunk.title}</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      {(chunk.similarity_score * 100).toFixed(0)}% Match
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 italic">Section: {chunk.section}</p>
                  <p className="text-slate-300 leading-relaxed text-[11px] line-clamp-4">{chunk.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          Indexed Knowledge Documents ({documents.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {documents.map((doc, idx) => (
            <div key={idx} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-semibold text-cyan-400">
                  <span>{doc.topic}</span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-400">{doc.chunk_count} Chunks</span>
                </div>
                <h3 className="text-sm font-bold text-slate-100">{doc.title}</h3>
                <p className="text-xs text-slate-400">Source: <span className="font-mono text-slate-300">{doc.source}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

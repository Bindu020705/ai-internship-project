import React, { useState } from 'react';
import { Bot, Send, User, BookOpen, RefreshCw, ShieldCheck } from 'lucide-react';
import { apiService } from '../services/api';
import type { ChatMessage, Dataset } from '../types';

interface AIChatPageProps {
  currentDataset: Dataset | null;
}

export const AIChatPage: React.FC<AIChatPageProps> = ({ currentDataset }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your AI Water Sustainability Assistant. I analyze your recorded water usage data and combine it with retrieved conservation knowledge (RAG) and IBM Granite AI to answer your questions accurately.\n\nHow can I help you conserve water today?`,
      created_at: new Date().toISOString()
    }
  ]);

  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

  const suggestedQuestions = [
    'How can I reduce my water consumption?',
    'Which activity uses the most water?',
    'Why is my water usage increasing?',
    'What sustainable actions can I start today?',
    'How can I reduce gardening water use?'
  ];

  const handleSendQuestion = async (qText?: string) => {
    const textToSend = qText || inputQuestion;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const res = await apiService.chatWithAI(textToSend, currentDataset?.id, sessionId);
      if (res) {
        setSessionId(res.session_id);
        const asstMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: res.answer,
          sources: res.sources,
          created_at: new Date().toISOString()
        };
        setMessages((prev) => [...prev, asstMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, the AI service encountered an error: ${err?.message || 'Failed to reach AI service'}. Your data science analytics are still available.`,
        created_at: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Bot className="w-6 h-6 text-cyan-400" />
            Conversational AI Assistant (RAG + IBM Granite)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Ask questions grounded strictly in your recorded statistics and retrieved conservation knowledge.
          </p>
        </div>

        {currentDataset && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            Context: {currentDataset.name}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-medium">Suggested:</span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendQuestion(q)}
            className="text-[11px] px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/20 hover:border-cyan-400 transition-all"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 min-h-[420px] max-h-[560px] overflow-y-auto custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`p-2 rounded-xl flex-shrink-0 ${
                msg.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-cyan-400 border border-cyan-500/20'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`space-y-3 max-w-[85%] ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium shadow-md'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 shadow-md'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-cyan-500/15 space-y-2 text-left">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-400">
                    <BookOpen className="w-3.5 h-3.5" />
                    Retrieved Knowledge Sources (RAG Attribution)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.sources.map((src, sIdx) => (
                      <div key={sIdx} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                        <div className="font-semibold text-slate-200 truncate">{src.title}</div>
                        <div className="text-[10px] text-slate-400 truncate">Source: {src.source}</div>
                        <div className="text-[10px] text-emerald-400 font-mono">Relevance: {(src.similarity_score * 100).toFixed(0)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 p-3 bg-slate-900/50 rounded-xl w-fit">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Querying RAG Vector Store & IBM Granite AI...
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendQuestion()}
          placeholder="Ask a question about your water consumption or conservation tips..."
          className="flex-1 bg-slate-900 border border-cyan-500/30 focus:border-cyan-400 text-slate-200 text-xs sm:text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
        />
        <button
          onClick={() => handleSendQuestion()}
          disabled={isLoading || !inputQuestion.trim()}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center gap-1.5"
        >
          <Send className="w-4 h-4" />
          Send
        </button>
      </div>
    </div>
  );
};

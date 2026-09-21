import React, { useState, useEffect } from 'react';
import { 
  Upload, FileText, CheckCircle, AlertCircle, Sparkles, RefreshCw, 
  Plus, Trash2, Edit3, Save, Database, Check, X
} from 'lucide-react';
import { apiService } from '../services/api';
import type { 
  Dataset, ConsumptionRecord, 
  ManualDatasetRecordInput 
} from '../types';


interface DataUploadPageProps {
  onDatasetLoaded: (dataset: Dataset) => void;
  onLoadDemo: () => void;
  currentDataset?: Dataset | null;
}

export const DataUploadPage: React.FC<DataUploadPageProps> = ({ 
  onDatasetLoaded, 
  onLoadDemo, 
  currentDataset 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'synthetic' | 'manual' | 'upload' | 'manage'>('synthetic');
  const [datasetsList, setDatasetsList] = useState<Dataset[]>([]);
  const [selectedDatasetIdForManage, setSelectedDatasetIdForManage] = useState<string | null>(currentDataset?.id || null);
  const [managedRecords, setManagedRecords] = useState<ConsumptionRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // General Notification messages
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Synthetic Generator state
  const [synthName, setSynthName] = useState('');
  const [synthDays, setSynthDays] = useState(60);
  const [synthMembers, setSynthMembers] = useState(4);
  const [synthAnomaly, setSynthAnomaly] = useState<'low' | 'medium' | 'high'>('medium');
  const [synthProfile, setSynthProfile] = useState<'standard' | 'eco' | 'high_usage'>('standard');

  // 2. Manual Dataset Builder state
  const [manualName, setManualName] = useState('My Manual Household Log');
  const [manualRows, setManualRows] = useState<ManualDatasetRecordInput[]>([
    {
      date: new Date().toISOString().split('T')[0],
      bathing: 120,
      laundry: 70,
      cleaning: 40,
      cooking: 25,
      gardening: 50,
      drinking: 12,
      toilet: 85,
      other: 20
    }
  ]);

  // 3. Single record append state for existing dataset
  const [newRecDate, setNewRecDate] = useState(new Date().toISOString().split('T')[0]);
  const [newRecBathing, setNewRecBathing] = useState(120);
  const [newRecLaundry, setNewRecLaundry] = useState(70);
  const [newRecCleaning, setNewRecCleaning] = useState(40);
  const [newRecCooking, setNewRecCooking] = useState(25);
  const [newRecGardening, setNewRecGardening] = useState(30);
  const [newRecDrinking, setNewRecDrinking] = useState(15);
  const [newRecToilet, setNewRecToilet] = useState(80);
  const [newRecOther, setNewRecOther] = useState(20);

  // 4. CSV Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 5. Inline Edit state
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editRowData, setEditRowData] = useState<Partial<ConsumptionRecord>>({});

  useEffect(() => {
    fetchDatasetsList();
  }, []);

  useEffect(() => {
    if (selectedDatasetIdForManage) {
      fetchRecordsForDataset(selectedDatasetIdForManage);
    }
  }, [selectedDatasetIdForManage]);

  const fetchDatasetsList = async () => {
    try {
      const list = await apiService.getDatasets();
      setDatasetsList(list);
      if (list.length > 0 && !selectedDatasetIdForManage) {
        setSelectedDatasetIdForManage(list[0].id);
      }
    } catch (err) {
      console.error('Error fetching datasets list:', err);
    }
  };

  const fetchRecordsForDataset = async (datasetId: string) => {
    setLoadingRecords(true);
    try {
      const details = await apiService.getDatasetDetails(datasetId);
      if (details) {
        setManagedRecords(details.records);
      }
    } catch (err) {
      console.error('Error fetching dataset records:', err);
    } finally {
      setLoadingRecords(false);
    }
  };

  // --- Handlers ---
  const handleGenerateSynthetic = async () => {
    setIsSubmitting(true);
    setStatusMsg(null);
    try {
      const ds = await apiService.createSyntheticDataset({
        name: synthName.trim() || undefined,
        num_days: synthDays,
        household_members: synthMembers,
        anomaly_level: synthAnomaly,
        profile: synthProfile
      });
      if (ds) {
        setStatusMsg({ type: 'success', text: `Synthetic dataset '${ds.name}' generated successfully with ${ds.row_count} records!` });
        await fetchDatasetsList();
        onDatasetLoaded(ds);
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.response?.data?.detail || err?.message || 'Failed to generate synthetic data.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddManualRow = () => {
    const lastDateStr = manualRows.length > 0 ? manualRows[manualRows.length - 1].date : new Date().toISOString().split('T')[0];
    const nextDate = new Date(lastDateStr);
    nextDate.setDate(nextDate.getDate() + 1);

    setManualRows([
      ...manualRows,
      {
        date: nextDate.toISOString().split('T')[0],
        bathing: 120,
        laundry: 70,
        cleaning: 40,
        cooking: 25,
        gardening: 30,
        drinking: 15,
        toilet: 80,
        other: 20
      }
    ]);
  };

  const handleUpdateManualRow = (index: number, field: keyof ManualDatasetRecordInput, value: any) => {
    const updated = [...manualRows];
    updated[index] = {
      ...updated[index],
      [field]: field === 'date' ? value : Math.max(0, parseFloat(value) || 0)
    };
    setManualRows(updated);
  };

  const handleRemoveManualRow = (index: number) => {
    if (manualRows.length <= 1) return;
    setManualRows(manualRows.filter((_, i) => i !== index));
  };

  const handleSaveManualDataset = async () => {
    if (!manualName.trim()) {
      setStatusMsg({ type: 'error', text: 'Please enter a dataset name.' });
      return;
    }
    if (manualRows.length === 0) {
      setStatusMsg({ type: 'error', text: 'Add at least one daily record.' });
      return;
    }
    setIsSubmitting(true);
    setStatusMsg(null);
    try {
      const ds = await apiService.createManualDataset({
        name: manualName.trim(),
        records: manualRows
      });
      if (ds) {
        setStatusMsg({ type: 'success', text: `Manual dataset '${ds.name}' created with ${ds.row_count} records!` });
        await fetchDatasetsList();
        onDatasetLoaded(ds);
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.response?.data?.detail || err?.message || 'Failed to create manual dataset.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadCSVSubmit = async () => {
    if (!selectedFile) return;
    setIsSubmitting(true);
    setStatusMsg(null);
    try {
      const res = await apiService.uploadCSV(selectedFile);
      if (res.success && res.data) {
        setStatusMsg({ type: 'success', text: res.message || 'Dataset uploaded successfully.' });
        await fetchDatasetsList();
        onDatasetLoaded(res.data);
      } else {
        setStatusMsg({ type: 'error', text: res.message || 'CSV upload failed.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.response?.data?.detail || err?.message || 'Error uploading CSV.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Record CRUD in Manager tab
  const handleAddSingleRecordToDataset = async () => {
    if (!selectedDatasetIdForManage) return;
    setIsSubmitting(true);
    setStatusMsg(null);
    try {
      await apiService.addDatasetRecord(selectedDatasetIdForManage, {
        date: newRecDate,
        bathing: newRecBathing,
        laundry: newRecLaundry,
        cleaning: newRecCleaning,
        cooking: newRecCooking,
        gardening: newRecGardening,
        drinking: newRecDrinking,
        toilet: newRecToilet,
        other: newRecOther
      });
      setStatusMsg({ type: 'success', text: 'New daily record appended to dataset.' });
      await fetchRecordsForDataset(selectedDatasetIdForManage);
      await fetchDatasetsList();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.response?.data?.detail || err?.message || 'Failed to add record.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveInlineEdit = async (recordId: string) => {
    if (!selectedDatasetIdForManage) return;
    try {
      await apiService.updateDatasetRecord(selectedDatasetIdForManage, recordId, editRowData);
      setEditingRecordId(null);
      setEditRowData({});
      await fetchRecordsForDataset(selectedDatasetIdForManage);
    } catch (err: any) {
      alert(err?.response?.data?.detail || err?.message || 'Failed to update record.');
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!selectedDatasetIdForManage) return;
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await apiService.deleteDatasetRecord(selectedDatasetIdForManage, recordId);
      await fetchRecordsForDataset(selectedDatasetIdForManage);
      await fetchDatasetsList();
    } catch (err: any) {
      alert(err?.response?.data?.detail || err?.message || 'Failed to delete record.');
    }
  };

  const handleDeleteDataset = async (datasetId: string) => {
    if (!confirm('Are you sure you want to delete this dataset entirely?')) return;
    try {
      await apiService.deleteDataset(datasetId);
      setStatusMsg({ type: 'success', text: 'Dataset deleted.' });
      const updatedList = await apiService.getDatasets();
      setDatasetsList(updatedList);
      if (updatedList.length > 0) {
        setSelectedDatasetIdForManage(updatedList[0].id);
        onDatasetLoaded(updatedList[0]);
      } else {
        setSelectedDatasetIdForManage(null);
        setManagedRecords([]);
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.response?.data?.detail || err?.message || 'Failed to delete dataset.' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-white bg-clip-text text-transparent">
          Data Management & Synthetic Generator Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          Generate custom synthetic sample datasets, input household water consumption records manually, or upload CSV files to analyze and forecast.
        </p>
      </div>

      {/* Global Status Banner */}
      {statusMsg && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between transition-all shadow-md ${
          statusMsg.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
            : 'bg-red-500/10 border border-red-500/30 text-red-300'
        }`}>
          <div className="flex items-center gap-2">
            {statusMsg.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
            <span className="font-medium">{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-center gap-2 p-1.5 bg-slate-900/80 rounded-2xl border border-cyan-500/20 max-w-2xl mx-auto">
        <button
          onClick={() => { setActiveSubTab('synthetic'); setStatusMsg(null); }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'synthetic'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Synthetic Data
        </button>

        <button
          onClick={() => { setActiveSubTab('manual'); setStatusMsg(null); }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'manual'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          Manual Entry
        </button>

        <button
          onClick={() => { setActiveSubTab('upload'); setStatusMsg(null); }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'upload'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          CSV Upload
        </button>

        <button
          onClick={() => { setActiveSubTab('manage'); setStatusMsg(null); fetchDatasetsList(); }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'manage'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          Inspect & Edit ({datasetsList.length})
        </button>
      </div>

      {/* SUB-TAB 1: SYNTHETIC DATA GENERATOR */}
      {activeSubTab === 'synthetic' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-cyan-400">
                <Sparkles className="w-4 h-4" />
                Custom Synthetic Data Generator
              </div>
              <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                Algorithmic Realistic Simulation
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Dataset Title</label>
                <input
                  type="text"
                  placeholder="e.g. Synthetic Household Log (60 Days)"
                  value={synthName}
                  onChange={(e) => setSynthName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Duration (Days: {synthDays})</label>
                <select
                  value={synthDays}
                  onChange={(e) => setSynthDays(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value={14}>14 Days (2 Weeks)</option>
                  <option value={30}>30 Days (1 Month)</option>
                  <option value={60}>60 Days (2 Months - Recommended)</option>
                  <option value={90}>90 Days (3 Months)</option>
                  <option value={180}>180 Days (Half Year)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Household Members ({synthMembers} persons)</label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={synthMembers}
                  onChange={(e) => setSynthMembers(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>1 Person</span>
                  <span>4 (Avg)</span>
                  <span>10 Persons</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Water Usage Profile</label>
                <select
                  value={synthProfile}
                  onChange={(e) => setSynthProfile(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="eco">Eco-Friendly Household (Low Consumption)</option>
                  <option value="standard">Standard Household (Typical Usage)</option>
                  <option value="high_usage">High Consumption Household</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Anomaly & Leak Frequency</label>
                <select
                  value={synthAnomaly}
                  onChange={(e) => setSynthAnomaly(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="low">Low Anomaly Rate (1 Leak Event)</option>
                  <option value="medium">Medium Anomaly Rate (3 Spike Events)</option>
                  <option value="high">High Anomaly Rate (6 Heavy Leak Spikes)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateSynthetic}
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Synthetic Records...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Custom Synthetic Dataset
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-4">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                1-Click Quick Sample Preset
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Instantly load our standard 60-day household sample dataset pre-configured with weekend gardening spikes and verified anomaly days for testing anomaly detection & ML models.
              </p>
              <button
                onClick={onLoadDemo}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Load Standard Sample Dataset
              </button>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-200">Synthetic Data Highlights</h4>
              <ul className="text-[11px] text-slate-400 space-y-1.5">
                <li className="flex items-center gap-1.5 text-cyan-400">
                  <Check className="w-3.5 h-3.5" /> Realistic activity breakdown (Bathing, Laundry, etc.)
                </li>
                <li className="flex items-center gap-1.5 text-cyan-400">
                  <Check className="w-3.5 h-3.5" /> Gaussian daily variations with weekend multipliers
                </li>
                <li className="flex items-center gap-1.5 text-cyan-400">
                  <Check className="w-3.5 h-3.5" /> Built-in anomaly benchmark tags
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: MANUAL DATASET BUILDER */}
      {activeSubTab === 'manual' && (
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 font-bold text-sm text-cyan-400">
                <Edit3 className="w-4 h-4" />
                Manual Dataset Builder & Daily Input Log
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Enter your household's actual daily water consumption values activity-by-activity to build a custom dataset.
              </p>
            </div>

            <div className="w-full sm:w-72">
              <input
                type="text"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="Dataset Name"
                className="w-full bg-slate-900 border border-cyan-500/40 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Table of Manual Rows */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-cyan-400">Bathing (L)</th>
                  <th className="py-2.5 px-3 text-blue-400">Laundry (L)</th>
                  <th className="py-2.5 px-3 text-sky-400">Cleaning (L)</th>
                  <th className="py-2.5 px-3 text-amber-400">Cooking (L)</th>
                  <th className="py-2.5 px-3 text-emerald-400">Gardening (L)</th>
                  <th className="py-2.5 px-3 text-teal-400">Drinking (L)</th>
                  <th className="py-2.5 px-3 text-indigo-400">Toilet (L)</th>
                  <th className="py-2.5 px-3 text-slate-400">Other (L)</th>
                  <th className="py-2.5 px-3 text-right text-slate-200 font-bold">Total (L)</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {manualRows.map((row, idx) => {
                  const rowTotal = (
                    (row.bathing || 0) + (row.laundry || 0) + (row.cleaning || 0) + 
                    (row.cooking || 0) + (row.gardening || 0) + (row.drinking || 0) + 
                    (row.toilet || 0) + (row.other || 0)
                  );
                  return (
                    <tr key={idx} className="hover:bg-slate-900/50">
                      <td className="p-2">
                        <input
                          type="date"
                          value={row.date}
                          onChange={(e) => handleUpdateManualRow(idx, 'date', e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
                        />
                      </td>
                      {(['bathing', 'laundry', 'cleaning', 'cooking', 'gardening', 'drinking', 'toilet', 'other'] as const).map((field) => (
                        <td key={field} className="p-2">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={row[field]}
                            onChange={(e) => handleUpdateManualRow(idx, field, e.target.value)}
                            className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 text-right focus:border-cyan-500"
                          />
                        </td>
                      ))}
                      <td className="p-2 text-right font-bold text-cyan-300">
                        {rowTotal.toFixed(1)} L
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleRemoveManualRow(idx)}
                          disabled={manualRows.length <= 1}
                          className="p-1 rounded text-red-400 hover:bg-red-500/10 disabled:opacity-30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleAddManualRow}
              className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              Add Next Daily Record
            </button>

            <button
              onClick={handleSaveManualDataset}
              disabled={isSubmitting}
              className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save & Activate Manual Dataset ({manualRows.length} Days)
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CSV UPLOAD */}
      {activeSubTab === 'upload' && (
        <div className="max-w-2xl mx-auto glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-cyan-400 border-b border-slate-800 pb-3">
            <Upload className="w-4 h-4" />
            Upload Custom CSV Dataset
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                if (e.dataTransfer.files[0].name.endsWith('.csv')) {
                  setSelectedFile(e.dataTransfer.files[0]);
                }
              }
            }}
            className="border-2 border-dashed border-cyan-500/30 hover:border-cyan-400 rounded-xl p-8 text-center space-y-3 cursor-pointer bg-slate-900/40 transition-all"
            onClick={() => document.getElementById('csv-file-input')?.click()}
          >
            <FileText className="w-10 h-10 text-cyan-400 mx-auto animate-pulse" />
            <div>
              <p className="text-xs font-semibold text-slate-200">
                {selectedFile ? selectedFile.name : 'Drag and drop your CSV file here, or click to browse'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Expected CSV headers: date, bathing_liters, laundry_liters, cleaning_liters, cooking_liters, gardening_liters, drinking_liters, toilet_liters, other_liters
              </p>
            </div>
            <input
              id="csv-file-input"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
              }}
            />
          </div>

          {selectedFile && (
            <button
              onClick={handleUploadCSVSubmit}
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Validating CSV & Ingesting Dataset...
                </>
              ) : (
                'Import & Activate CSV Dataset'
              )}
            </button>
          )}
        </div>
      )}

      {/* SUB-TAB 4: INSPECT & EDIT DATASET RECORDS */}
      {activeSubTab === 'manage' && (
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 font-bold text-sm text-cyan-400">
                <Database className="w-4 h-4" />
                Inspect & Edit Dataset Records
              </div>
              <p className="text-xs text-slate-400 mt-1">
                View, edit values inline, add new days, or delete records from any dataset.
              </p>
            </div>

            {/* Dataset Selector */}
            <div className="flex items-center gap-2">
              <select
                value={selectedDatasetIdForManage || ''}
                onChange={(e) => {
                  setSelectedDatasetIdForManage(e.target.value);
                  const ds = datasetsList.find(d => d.id === e.target.value);
                  if (ds) onDatasetLoaded(ds);
                }}
                className="bg-slate-900 border border-cyan-500/40 text-slate-200 text-xs rounded-xl px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {datasetsList.map((d) => (
                  <option key={d.id} value={d.id}>
                    [{d.source.toUpperCase()}] {d.name} ({d.row_count} rows)
                  </option>
                ))}
              </select>

              {selectedDatasetIdForManage && (
                <button
                  onClick={() => handleDeleteDataset(selectedDatasetIdForManage)}
                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs"
                  title="Delete entire dataset"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Append Single Record Form */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              Append Daily Record to Current Dataset
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-9 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400">Date</label>
                <input
                  type="date"
                  value={newRecDate}
                  onChange={(e) => setNewRecDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[11px] text-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] text-cyan-400">Bathing</label>
                <input
                  type="number"
                  value={newRecBathing}
                  onChange={(e) => setNewRecBathing(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[11px] text-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] text-blue-400">Laundry</label>
                <input
                  type="number"
                  value={newRecLaundry}
                  onChange={(e) => setNewRecLaundry(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[11px] text-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] text-sky-400">Cleaning</label>
                <input
                  type="number"
                  value={newRecCleaning}
                  onChange={(e) => setNewRecCleaning(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[11px] text-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] text-amber-400">Cooking</label>
                <input
                  type="number"
                  value={newRecCooking}
                  onChange={(e) => setNewRecCooking(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[11px] text-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] text-emerald-400">Gardening</label>
                <input
                  type="number"
                  value={newRecGardening}
                  onChange={(e) => setNewRecGardening(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[11px] text-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] text-teal-400">Drinking</label>
                <input
                  type="number"
                  value={newRecDrinking}
                  onChange={(e) => setNewRecDrinking(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[11px] text-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] text-indigo-400">Toilet</label>
                <input
                  type="number"
                  value={newRecToilet}
                  onChange={(e) => setNewRecToilet(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[11px] text-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400">Other</label>
                <input
                  type="number"
                  value={newRecOther}
                  onChange={(e) => setNewRecOther(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[11px] text-slate-200"
                />
              </div>
            </div>
            <button
              onClick={handleAddSingleRecordToDataset}
              disabled={isSubmitting}
              className="py-1.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow transition-all"
            >
              Add Record
            </button>
          </div>

          {/* Records Table */}
          {loadingRecords ? (
            <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              Loading dataset records...
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 max-h-96 custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-cyan-400">Bathing</th>
                    <th className="py-2.5 px-3 text-blue-400">Laundry</th>
                    <th className="py-2.5 px-3 text-sky-400">Cleaning</th>
                    <th className="py-2.5 px-3 text-amber-400">Cooking</th>
                    <th className="py-2.5 px-3 text-emerald-400">Gardening</th>
                    <th className="py-2.5 px-3 text-teal-400">Drinking</th>
                    <th className="py-2.5 px-3 text-indigo-400">Toilet</th>
                    <th className="py-2.5 px-3 text-slate-400">Other</th>
                    <th className="py-2.5 px-3 text-right text-slate-200 font-bold">Total</th>
                    <th className="py-2.5 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {managedRecords.map((r) => {
                    const isEditing = editingRecordId === r.id;
                    return (
                      <tr key={r.id} className="hover:bg-slate-900/50">
                        <td className="p-2">
                          {isEditing ? (
                            <input
                              type="date"
                              value={editRowData.date ?? r.date}
                              onChange={(e) => setEditRowData({ ...editRowData, date: e.target.value })}
                              className="bg-slate-900 border border-cyan-500 rounded px-1 py-0.5 text-xs text-slate-200"
                            />
                          ) : (
                            r.date
                          )}
                        </td>
                        {(['bathing', 'laundry', 'cleaning', 'cooking', 'gardening', 'drinking', 'toilet', 'other'] as const).map((col) => (
                          <td key={col} className="p-2">
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.1"
                                value={editRowData[col] ?? r[col]}
                                onChange={(e) => setEditRowData({ ...editRowData, [col]: parseFloat(e.target.value) || 0 })}
                                className="w-14 bg-slate-900 border border-cyan-500 rounded px-1 py-0.5 text-xs text-slate-200 text-right"
                              />
                            ) : (
                              r[col].toFixed(1)
                            )}
                          </td>
                        ))}
                        <td className="p-2 text-right font-bold text-cyan-300">
                          {r.total.toFixed(1)} L
                        </td>
                        <td className="p-2 text-center flex items-center justify-center gap-1">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveInlineEdit(r.id)}
                                className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                title="Save"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => { setEditingRecordId(null); setEditRowData({}); }}
                                className="p-1 rounded bg-slate-700 text-slate-300 hover:bg-slate-600"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => { setEditingRecordId(r.id); setEditRowData(r); }}
                                className="p-1 rounded text-cyan-400 hover:bg-cyan-500/10"
                                title="Edit record"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteRecord(r.id)}
                                className="p-1 rounded text-red-400 hover:bg-red-500/10"
                                title="Delete record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataUploadPage;

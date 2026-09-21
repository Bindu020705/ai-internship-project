import axios from 'axios';
import type {
  APIResponse,
  Dataset,
  ConsumptionRecord,
  AnalyticsResult,
  ForecastResult,
  RAGChunk,
  RecommendationItem,
  ActionPlanItem,
  ReportResponse,
  SyntheticDatasetOptions,
  ManualDatasetInput,
  ManualDatasetRecordInput
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  async getHealth() {
    const res = await client.get<APIResponse<any>>('/health');
    return res.data;
  },

  async getDatasets() {
    const res = await client.get<APIResponse<Dataset[]>>('/datasets');
    return res.data.data || [];
  },

  async getDatasetDetails(id: string) {
    const res = await client.get<APIResponse<{ dataset: Dataset; records: ConsumptionRecord[] }>>(`/datasets/${id}`);
    return res.data.data;
  },

  async loadDemoDataset() {
    const res = await client.post<APIResponse<Dataset>>('/datasets/demo');
    return res.data.data;
  },

  async createSyntheticDataset(options: SyntheticDatasetOptions) {
    const res = await client.post<APIResponse<Dataset>>('/datasets/synthetic', options);
    return res.data.data;
  },

  async createManualDataset(data: ManualDatasetInput) {
    const res = await client.post<APIResponse<Dataset>>('/datasets/manual', data);
    return res.data.data;
  },

  async addDatasetRecord(datasetId: string, record: ManualDatasetRecordInput) {
    const res = await client.post<APIResponse<ConsumptionRecord>>(`/datasets/${datasetId}/records`, record);
    return res.data.data;
  },

  async updateDatasetRecord(datasetId: string, recordId: string, record: Partial<ManualDatasetRecordInput>) {
    const res = await client.put<APIResponse<ConsumptionRecord>>(`/datasets/${datasetId}/records/${recordId}`, record);
    return res.data.data;
  },

  async deleteDatasetRecord(datasetId: string, recordId: string) {
    const res = await client.delete<APIResponse<any>>(`/datasets/${datasetId}/records/${recordId}`);
    return res.data;
  },

  async uploadCSV(file: File, name?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);
    const res = await client.post<APIResponse<Dataset>>('/datasets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async deleteDataset(id: string) {
    const res = await client.delete<APIResponse<any>>(`/datasets/${id}`);
    return res.data;
  },


  async getAnalytics(datasetId: string) {
    const res = await client.get<APIResponse<AnalyticsResult>>(`/analytics/${datasetId}`);
    return res.data.data;
  },

  async getForecast(datasetId: string) {
    const res = await client.get<APIResponse<ForecastResult>>(`/forecast/${datasetId}`);
    return res.data.data;
  },

  async searchKnowledge(query: string, topK: number = 4) {
    const res = await client.get<APIResponse<{ query: string; top_chunks: RAGChunk[] }>>('/rag/search', {
      params: { query, top_k: topK },
    });
    return res.data.data;
  },

  async getKnowledgeDocuments() {
    const res = await client.get<APIResponse<any[]>>('/rag/documents');
    return res.data.data || [];
  },

  async getAIInsights(datasetId: string) {
    const res = await client.post<APIResponse<any>>('/ai/insights', { dataset_id: datasetId });
    return res.data.data;
  },

  async chatWithAI(question: string, datasetId?: string, sessionId?: string) {
    const res = await client.post<APIResponse<{ session_id: string; answer: string; sources: RAGChunk[] }>>('/ai/chat', {
      question,
      dataset_id: datasetId,
      session_id: sessionId,
    });
    return res.data.data;
  },

  async getRecommendations(datasetId: string) {
    const res = await client.get<APIResponse<RecommendationItem[]>>(`/recommendations/${datasetId}`);
    return res.data.data || [];
  },

  async getActionPlan() {
    const res = await client.get<APIResponse<ActionPlanItem[]>>('/actions');
    return res.data.data || [];
  },

  async createActionItem(title: string, description: string, priority: string = 'Medium', difficulty: string = 'Easy') {
    const res = await client.post<APIResponse<ActionPlanItem>>('/actions', {
      title,
      description,
      priority,
      difficulty,
    });
    return res.data.data;
  },

  async updateActionItemStatus(id: string, status: 'Not Started' | 'In Progress' | 'Completed') {
    const res = await client.patch<APIResponse<ActionPlanItem>>(`/actions/${id}`, { status });
    return res.data.data;
  },

  async deleteActionItem(id: string) {
    const res = await client.delete<APIResponse<any>>(`/actions/${id}`);
    return res.data;
  },

  async getReport(datasetId: string) {
    const res = await client.get<APIResponse<ReportResponse>>(`/reports/${datasetId}`);
    return res.data.data;
  }
};

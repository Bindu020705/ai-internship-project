export interface Dataset {
  id: string;
  name: string;
  source: string;
  row_count: number;
  created_at: string;
}

export interface ConsumptionRecord {
  id: string;
  dataset_id: string;
  date: string;
  bathing: number;
  laundry: number;
  cleaning: number;
  cooking: number;
  gardening: number;
  drinking: number;
  toilet: number;
  other: number;
  total: number;
}

export interface SyntheticDatasetOptions {
  name?: string;
  num_days: number;
  household_members: number;
  anomaly_level: 'low' | 'medium' | 'high';
  profile: 'standard' | 'eco' | 'high_usage';
}

export interface ManualDatasetRecordInput {
  date: string;
  bathing: number;
  laundry: number;
  cleaning: number;
  cooking: number;
  gardening: number;
  drinking: number;
  toilet: number;
  other: number;
}

export interface ManualDatasetInput {
  name: string;
  records: ManualDatasetRecordInput[];
}

export interface ActivityContribution {
  activity: string;
  total_liters: number;
  average_liters: number;
  percentage: number;
}

export interface AnomalyItem {
  date: string;
  activity: string;
  observed_liters: number;
  expected_liters: number;
  z_score: number;
  severity: 'High' | 'Moderate';
  explanation: string;
}

export interface AnalyticsResult {
  dataset_id: string;
  total_consumption: number;
  mean_daily_consumption: number;
  median_daily_consumption: number;
  min_daily_consumption: number;
  max_daily_consumption: number;
  std_dev_consumption: number;
  highest_consuming_activity: string;
  lowest_consuming_activity: string;
  sustainability_index: number;
  sustainability_index_label: string;
  activity_breakdown: ActivityContribution[];
  anomalies: AnomalyItem[];
  daily_trend: Array<{ date: string; total: number; [key: string]: any }>;
  weekly_trend: Array<{ week: string; average_total: number }>;
  monthly_trend: Array<{ month: string; average_total: number }>;
}

export interface ForecastItem {
  day: number;
  date: string;
  predicted_liters: number;
}

export interface ForecastResult {
  dataset_id: string;
  has_enough_data: boolean;
  disclaimer: string;
  predictions: ForecastItem[];
  confidence: string;
}

export interface RAGChunk {
  id: string;
  title: string;
  source: string;
  topic: string;
  section?: string;
  url?: string;
  content: string;
  similarity_score: number;
}

export interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  difficulty: 'Easy' | 'Moderate' | 'Advanced';
  reason: string;
  status: 'Suggested' | 'Added' | 'Completed';
}

export interface ActionPlanItem {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  difficulty: 'Easy' | 'Moderate' | 'Advanced';
  status: 'Not Started' | 'In Progress' | 'Completed';
  created_at: string;
  completed_at?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: RAGChunk[];
  created_at: string;
}

export interface ReportResponse {
  dataset_info: Dataset;
  analytics: AnalyticsResult;
  forecast?: ForecastResult;
  recommendations: RecommendationItem[];
  actions: ActionPlanItem[];
  generated_at: string;
}

export interface APIResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

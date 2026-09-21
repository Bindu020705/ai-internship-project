from pydantic import BaseModel, Field
from typing import List, Optional, Generic, TypeVar, Dict, Any
from datetime import datetime

T = TypeVar('T')

class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    message: Optional[str] = "Operation completed successfully"
    data: Optional[T] = None
    error: Optional[Dict[str, Any]] = None

class ConsumptionRecordBase(BaseModel):
    date: str
    bathing: float = Field(default=0.0, ge=0.0)
    laundry: float = Field(default=0.0, ge=0.0)
    cleaning: float = Field(default=0.0, ge=0.0)
    cooking: float = Field(default=0.0, ge=0.0)
    gardening: float = Field(default=0.0, ge=0.0)
    drinking: float = Field(default=0.0, ge=0.0)
    toilet: float = Field(default=0.0, ge=0.0)
    other: float = Field(default=0.0, ge=0.0)

class ConsumptionRecordResponse(ConsumptionRecordBase):
    id: str
    dataset_id: str
    total: float

    class Config:
        from_attributes = True

class SyntheticDatasetCreate(BaseModel):
    name: Optional[str] = None
    num_days: int = Field(default=60, ge=7, le=365)
    household_members: int = Field(default=4, ge=1, le=15)
    anomaly_level: str = Field(default="medium") # low, medium, high
    profile: str = Field(default="standard") # standard, eco, high_usage

class ManualDatasetCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    records: List[ConsumptionRecordBase]

class RecordCreate(ConsumptionRecordBase):
    pass

class RecordUpdate(BaseModel):
    date: Optional[str] = None
    bathing: Optional[float] = Field(default=None, ge=0.0)
    laundry: Optional[float] = Field(default=None, ge=0.0)
    cleaning: Optional[float] = Field(default=None, ge=0.0)
    cooking: Optional[float] = Field(default=None, ge=0.0)
    gardening: Optional[float] = Field(default=None, ge=0.0)
    drinking: Optional[float] = Field(default=None, ge=0.0)
    toilet: Optional[float] = Field(default=None, ge=0.0)
    other: Optional[float] = Field(default=None, ge=0.0)


class DatasetResponse(BaseModel):
    id: str
    name: str
    source: str
    row_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class ActivityContribution(BaseModel):
    activity: str
    total_liters: float
    average_liters: float
    percentage: float

class AnomalyItem(BaseModel):
    date: str
    activity: str
    observed_liters: float
    expected_liters: float
    z_score: float
    severity: str # High, Moderate
    explanation: str

class AnalyticsResult(BaseModel):
    dataset_id: str
    total_consumption: float
    mean_daily_consumption: float
    median_daily_consumption: float
    min_daily_consumption: float
    max_daily_consumption: float
    std_dev_consumption: float
    highest_consuming_activity: str
    lowest_consuming_activity: str
    sustainability_index: float
    sustainability_index_label: str = "Personal Water Sustainability Index (App-Defined Indicator)"
    activity_breakdown: List[ActivityContribution]
    anomalies: List[AnomalyItem]
    daily_trend: List[Dict[str, Any]]
    weekly_trend: List[Dict[str, Any]]
    monthly_trend: List[Dict[str, Any]]

class ForecastItem(BaseModel):
    day: int
    date: str
    predicted_liters: float

class ForecastResult(BaseModel):
    dataset_id: str
    has_enough_data: bool
    disclaimer: str = "Model estimate based on historical daily consumption patterns."
    predictions: List[ForecastItem]
    confidence: str # Baseline Linear Regression / Random Forest

class RAGChunk(BaseModel):
    id: str
    title: str
    source: str
    topic: str
    section: Optional[str] = None
    url: Optional[str] = None
    content: str
    similarity_score: float

class RAGSearchResult(BaseModel):
    query: str
    top_chunks: List[RAGChunk]

class RecommendationItem(BaseModel):
    id: str
    title: str
    description: str
    priority: str # High, Medium, Low
    difficulty: str # Easy, Moderate, Advanced
    reason: str
    status: str = "Suggested"

class ActionItemSchema(BaseModel):
    id: str
    title: str
    description: str
    priority: str
    difficulty: str
    status: str # Not Started, In Progress, Completed
    created_at: datetime
    completed_at: Optional[datetime] = None

class ActionItemCreate(BaseModel):
    title: str
    description: str
    priority: str = "Medium"
    difficulty: str = "Easy"

class ActionItemUpdate(BaseModel):
    status: Optional[str] = None

class ChatMessageSchema(BaseModel):
    id: str
    role: str
    content: str
    sources: Optional[List[RAGChunk]] = None
    created_at: datetime

class ChatRequest(BaseModel):
    dataset_id: Optional[str] = None
    session_id: Optional[str] = None
    question: str

class ChatResponse(BaseModel):
    session_id: str
    answer: str
    structured_insights: Optional[Dict[str, Any]] = None
    sources: List[RAGChunk]
    groundedness_notice: str = "Response generated using recorded usage, calculated statistics, and retrieved knowledge."

class ReportResponse(BaseModel):
    dataset_info: DatasetResponse
    analytics: AnalyticsResult
    forecast: Optional[ForecastResult] = None
    recommendations: List[RecommendationItem]
    actions: List[ActionItemSchema]
    generated_at: datetime

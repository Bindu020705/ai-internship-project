# API Documentation — Water Sustainability Assistant

## Base URL
`http://localhost:8000/api`

## Standard Envelope
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

## Endpoints Summary

### 1. Health
- `GET /health` — Check system operational status.

### 2. Datasets
- `GET /datasets` — List all stored datasets.
- `POST /datasets/upload` — Upload CSV dataset (`multipart/form-data`).
- `POST /datasets/demo` — Load synthetic 60-day demo dataset.
- `GET /datasets/{id}` — Retrieve dataset metadata and daily records.
- `DELETE /datasets/{id}` — Delete dataset.

### 3. Analytics
- `GET /analytics/{dataset_id}` — Calculate statistics, activity breakdown, trends, Z-score/IQR anomalies, and Personal Water Sustainability Index.

### 4. Forecasting
- `GET /forecast/{dataset_id}` — Generate 7-day linear/cyclical ML regression forecast with "Model Estimate" disclaimer.

### 5. RAG Knowledge
- `GET /rag/search?query=...` — Perform semantic vector search across knowledge base.
- `GET /rag/documents` — List indexed knowledge documents.

### 6. AI Services
- `POST /ai/insights` — Generate structured JSON AI analysis using Granite + RAG context.
- `POST /ai/chat` — Conversational AI endpoint with dataset context awareness and source citations.

### 7. Recommendations
- `GET /recommendations/{dataset_id}` — Generate personalized recommendations using Rule + AI hybrid engine.

### 8. Action Plan
- `GET /actions` — List action items.
- `POST /actions` — Create action item.
- `PATCH /actions/{id}` — Update action status (`Not Started`, `In Progress`, `Completed`).
- `DELETE /actions/{id}` — Delete action item.

### 9. Reports
- `GET /reports/{dataset_id}` — Generate full printable summary report payload.

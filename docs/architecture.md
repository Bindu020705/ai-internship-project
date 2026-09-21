# Application Architecture — AI-Powered Water Sustainability Assistant

## System Architecture Diagram

```
+-------------------------------------------------------------------------+
|                            REACT FRONTEND                               |
| (Vite + TypeScript + Tailwind CSS + Lucide Icons + Recharts)            |
+-------------------------------------------------------------------------+
                                    |
                                    v  REST APIs (HTTP / JSON)
+-------------------------------------------------------------------------+
|                            FASTAPI BACKEND                              |
|                           (Python 3.13)                                 |
+-------------------------------------------------------------------------+
    |                      |                     |                   |
    v                      v                     v                   v
+------------------+ +-----------------+ +---------------+ +---------------+
|   DATA SCIENCE   | |   RAG KNOWLEDGE | |  IBM GRANITE  | |  SQL DATABASE |
|      ENGINE      | |     PIPELINE    | | AI SERVICE    | | (SQLite /     |
| (Pandas / NumPy /| | (TF-IDF / Vector| | (Watsonx API  | |  PostgreSQL)  |
|  Scikit-Learn)   | |  Store Index)   | |  Abstraction) | |               |
+------------------+ +-----------------+ +---------------+ +---------------+
```

## Module Architecture

1. **Frontend Layer (`/frontend`)**:
   - `LandingPage`: Explains platform, SDG 6 alignment, Data -> Insights -> Action pipeline.
   - `DashboardPage`: Overview cards (Total, Daily Avg, Top Activity, Weekly Trend, Personal Water Sustainability Index), Recharts daily & activity donut graphs, anomaly notices.
   - `DataUploadPage`: Drag & drop CSV validation, error handling table, 1-click synthetic demo dataset.
   - `AnalyticsPage`: Statistical summary, Z-score/IQR anomaly breakdown, 7-day ML forecasting.
   - `AIChatPage`: Conversational assistant with context toggle & RAG source citations.
   - `RecommendationsPage`: Personal sustainability recommendations feed with priority/difficulty filters.
   - `ActionPlanPage`: Interactive action plan tracker (Not Started, In Progress, Completed).
   - `KnowledgePage`: Semantic search & document library browser.
   - `ReportsPage`: Printable summary report generator.

2. **Data Science Engine (`/backend/app/services/analytics`)**:
   - `validator.py`: Validates CSV schema, headers, negative values, and date parsing.
   - `calculator.py`: Computes basic statistics, daily/weekly/monthly trends, activity distribution percentages.
   - `anomaly.py`: Dual Z-Score & IQR anomaly detection with nuanced diagnostic notices.
   - `sustainability_index.py`: Calculates application-defined Personal Water Sustainability Index (0-100).

3. **RAG Knowledge Pipeline (`/backend/app/services/rag`)**:
   - `ingestor.py`: Document ingestion, text cleaning, recursive chunking with metadata.
   - `vector_store.py`: Vector Store manager with cosine similarity semantic retrieval.
   - `retriever.py`: Context string formatting with source citations.

4. **IBM Granite Service (`/backend/app/services/llm`)**:
   - `base.py`: Provider abstraction interface (`LLMProvider`).
   - `granite.py`: `IBMGraniteProvider` Watsonx REST API integration.
   - `mock_granite.py`: `LocalFallbackGraniteProvider` for offline execution without API keys.
   - `prompts.py`: Modular prompt engineering templates.

5. **Database Models (`/backend/app/models`)**:
   - `Dataset`, `ConsumptionRecord`, `Analysis`, `Recommendation`, `ActionPlanItem`, `ChatSession`, `ChatMessage`, `KnowledgeDocument`.

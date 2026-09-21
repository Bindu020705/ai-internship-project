# AI-Powered Water Sustainability Assistant (SDG 6)

[![UN SDG 6](https://img.shields.io/badge/UN_SDG_6-Clean_Water_%26_Sanitation-00A8E8?style=for-the-badge)](https://sdgs.un.org/goals/goal6)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react)](https://react.dev/)
[![IBM Granite](https://img.shields.io/badge/IBM_Granite-052F5F?style=for-the-badge&logo=ibm)](https://www.ibm.com/granite)

The **AI-Powered Water Sustainability Assistant** is a production-quality decision-support platform designed to transform raw household water consumption measurements into actionable sustainability insights, anomaly alerts, 7-day ML forecasts, and personalized conservation plans aligned with **UN SDG 6 (Clean Water and Sanitation)**.

---

## Key Features

- 📊 **Dynamic Data Science Engine**: Calculates exact daily, weekly, and monthly statistics, per-activity consumption percentages (bathing, laundry, gardening, cleaning, cooking, drinking, toilet, other), and standard deviations.
- ⚠️ **Statistical Anomaly Detection**: Uses Z-score & IQR outlier algorithms to flag unusual consumption spikes with nuanced, non-diagnostic messaging (*"Possible causes include increased activity, outdoor usage, or a leak. Consider checking the source."*).
- 🔮 **7-Day ML Forecasting**: Scikit-Learn linear & weekly cyclical regression model to predict future daily consumption (clearly labeled as **Model estimate**).
- 📚 **RAG Knowledge Retrieval**: Ingests authoritative water efficiency documents with cosine similarity semantic retrieval and source attribution.
- 🤖 **IBM Granite AI Integration**: Abstracted LLM service (`LLMProvider` -> `IBMGraniteProvider`) with structured JSON parsing, correction prompt retries, and an intelligent offline fallback provider (`LocalFallbackGraniteProvider`).
- 🏆 **Personal Water Sustainability Index**: 0-100 score evaluating per-capita baseline adherence, activity distribution balance, and usage consistency (explicitly labeled as an application-defined indicator).
- 📱 **Premium Environmental UI**: React 19 + Vite + TypeScript + Tailwind CSS + Recharts + Framer Motion glassmorphism interface.
- 📋 **My Action Plan Tracker**: Interactive habit tracker allowing users to add recommendations and toggle statuses (`Not Started`, `In Progress`, `Completed`).
- 📄 **Printable Summary Reports**: One-click summary report preview with PDF print formatting.

---

## High-Level Architecture

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

---

## Technology Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Recharts, Lucide Icons, Framer Motion.
- **Backend**: FastAPI, Python 3.13, Pydantic v2, SQLAlchemy, Uvicorn.
- **Data Science**: Pandas, NumPy, Scikit-Learn.
- **RAG & Vector DB**: Custom TF-IDF / Cosine Similarity Vector Store, Recursive Character Ingestor.
- **LLM**: IBM Granite (`ibm/granite-3-8b-instruct`) with Watsonx API abstraction + intelligent offline synthesis fallback.
- **Database**: SQLite (local development default) / PostgreSQL compatible.

---

## Installation & Running Locally

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### 1. Clone & Set Up Environment Variables
```bash
git clone https://github.com/user/ai-water-sustainability-assistant.git
cd "AI Sustainable Project"

cp .env.example .env
```

### 2. Run Backend (FastAPI)
```bash
# In project root directory:
$env:PYTHONPATH="backend"  # PowerShell
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Backend API will be live at `http://localhost:8000` (API Docs at `http://localhost:8000/docs`).

### 3. Run Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend will be live at `http://localhost:5173`.

---

## IBM Granite Configuration & Fallback Mode

To connect to a live IBM Granite deployment on IBM Watsonx:
1. Open `.env`.
2. Configure:
   ```env
   IBM_GRANITE_API_KEY=your_watsonx_api_key
   IBM_GRANITE_ENDPOINT=https://us-south.ml.cloud.ibm.com/ml/v1/deployments/granite-3-8b-instruct/text/generation
   IBM_GRANITE_MODEL=ibm/granite-3-8b-instruct
   ```

> **Note**: If `IBM_GRANITE_API_KEY` is empty, the application automatically uses `LocalFallbackGraniteProvider` which synthesizes grounded insights directly from analytics & RAG context. The application remains 100% operational out-of-the-box!

---

## Running Automated Tests

Run the full pytest suite for data validation, analytics math, anomaly detection, forecasting, RAG, and LLM prompt logic:

```bash
$env:PYTHONPATH="backend"
python -m pytest tests/
```

Result: `8 passed in 2.28s`

---

## SDG 6 Alignment

The application contributes to **UN SDG 6 — Clean Water and Sanitation** through:
- **Target 6.1**: Household awareness of consumption patterns.
- **Target 6.4**: Substantially increasing water-use efficiency by targeting the highest-consuming categories.
- **Target 6.b**: Empowering individual and community-driven water stewardship through tracked action planning.

---

## License

MIT License.

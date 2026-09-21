# RAG Knowledge Pipeline Documentation

## Overview
Retrieval-Augmented Generation (RAG) ensures that AI recommendations and conversational answers are grounded in verified, authoritative water conservation guidance.

## Document Ingestion & Chunking Strategy
- **Directory**: `data/knowledge/*.md`
- **Topics Covered**:
  1. `household_water_efficiency.md` — Daily per capita benchmarks and UN SDG 6 targets.
  2. `bathing_and_sanitation.md` — Low-flow shower aerators (6-8 LPM), dual-flush cisterns.
  3. `laundry_and_cleaning.md` — Front-load HE washing machine full-load efficiency.
  4. `gardening_and_outdoor.md` — Drip irrigation, xeriscaping, mulch moisture retention.
  5. `leak_detection_and_maintenance.md` — Toilet tank dye test, overnight meter checks.
  6. `sdg6_clean_water_framework.md` — UN SDG 6 Targets 6.1, 6.4, 6.b.

- **Chunk Metadata Schema**:
```json
{
  "id": "uuid",
  "title": "Document Title",
  "source": "filename.md",
  "topic": "Topic Category",
  "section": "Section Header",
  "url": "knowledge/filename.md",
  "content": "Text chunk..."
}
```

## Retrieval Flow
1. Query processing & tokenization.
2. Vector Store similarity search against knowledge corpus.
3. Top-K chunk selection (default K=4).
4. Prompt context assembly with source attribution (`SOURCE [1]...`).
5. IBM Granite response generation with citation metadata attached.

import pytest
import asyncio
import pandas as pd
from app.services.rag.retriever import retrieve_knowledge_context
from app.services.llm.prompts import build_analysis_prompt
from app.services.llm.mock_granite import LocalFallbackGraniteProvider
from app.services.analytics.validator import validate_and_clean_csv

def test_rag_retrieval():
    context_str, chunks = retrieve_knowledge_context("efficient bathing shower", top_k=2)
    assert len(chunks) > 0
    assert "SOURCE" in context_str
    assert "shower" in context_str.lower() or "bathing" in context_str.lower()

def test_csv_validation_valid():
    csv_content = b"""date,bathing_liters,laundry_liters,cleaning_liters,cooking_liters,gardening_liters,drinking_liters,toilet_liters,other_liters
2026-01-01,100,50,20,10,30,5,40,10
2026-01-02,120,60,25,15,35,5,45,10
"""
    is_valid, df, errors = validate_and_clean_csv(csv_content)
    assert is_valid is True
    assert len(df) == 2
    assert "total" in df.columns

def test_csv_validation_missing_cols():
    csv_content = b"""date,bathing_liters,laundry_liters
2026-01-01,100,50
"""
    is_valid, df, errors = validate_and_clean_csv(csv_content)
    assert is_valid is False
    assert any("Missing required columns" in err for err in errors)

def test_fallback_granite_provider():
    async def run_test():
        provider = LocalFallbackGraniteProvider()
        prompt = "Highest consuming activity: Gardening\nAverage daily consumption: 450.0\nPlease output JSON."
        res = await provider.generate(prompt)
        assert "Gardening" in res
        assert "summary" in res

    asyncio.run(run_test())

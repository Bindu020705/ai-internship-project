import json
import logging
from typing import Dict, Any, Optional
from app.services.llm.base import LLMProvider
from app.services.llm.granite import IBMGraniteProvider
from app.services.llm.mock_granite import LocalFallbackGraniteProvider
from app.core.config import settings

logger = logging.getLogger(__name__)

def get_llm_provider() -> LLMProvider:
    """
    Returns IBMGraniteProvider if API key exists, otherwise gracefully uses LocalFallbackGraniteProvider.
    """
    if settings.IBM_GRANITE_API_KEY:
        try:
            return IBMGraniteProvider()
        except Exception as e:
            logger.warning(f"Failed to initialize IBMGraniteProvider: {e}. Using fallback provider.")
            return LocalFallbackGraniteProvider()
    return LocalFallbackGraniteProvider()

async def generate_structured_llm_response(prompt: str, system_prompt: Optional[str] = None) -> Dict[str, Any]:
    provider = get_llm_provider()
    
    try:
        raw_output = await provider.generate(prompt, system_prompt)
    except Exception as e:
        logger.error(f"LLM Provider execution error: {e}. Falling back to LocalFallbackGraniteProvider.")
        fallback = LocalFallbackGraniteProvider()
        raw_output = await fallback.generate(prompt, system_prompt)

    # Attempt to parse JSON from output
    try:
        # Strip potential markdown code fences ```json ... ```
        clean_str = raw_output.strip()
        if clean_str.startswith("```"):
            clean_str = clean_str.split("\n", 1)[1]
            if clean_str.endswith("```"):
                clean_str = clean_str.rsplit("```", 1)[0]
            clean_str = clean_str.replace("json", "", 1).strip()
            
        data = json.loads(clean_str)
        return data
    except Exception as parse_err:
        logger.warning(f"Failed to parse LLM response as JSON: {parse_err}. Returning formatted text structure.")
        return {
            "summary": raw_output[:300] if raw_output else "Analysis complete.",
            "key_observations": ["Data analysis completed.", "Refer to dashboard trends for activity metrics."],
            "priority_areas": [],
            "recommendations": [
                {
                    "title": "General Household Conservation",
                    "description": raw_output if raw_output else "Follow standard water efficiency guidelines.",
                    "reason": "Generated from data analysis and retrieved knowledge.",
                    "difficulty": "Easy"
                }
            ],
            "immediate_actions": ["Check fixtures for drips.", "Monitor daily usage trends."],
            "limitations": ["Structured formatting fallback applied."]
        }

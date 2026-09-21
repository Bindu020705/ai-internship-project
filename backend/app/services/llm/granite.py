import httpx
from typing import Optional
from app.services.llm.base import LLMProvider
from app.core.config import settings

class IBMGraniteProvider(LLMProvider):
    def __init__(self, api_key: str = None, endpoint: str = None, model: str = None):
        self.api_key = api_key or settings.IBM_GRANITE_API_KEY
        self.endpoint = endpoint or settings.IBM_GRANITE_ENDPOINT
        self.model = model or settings.IBM_GRANITE_MODEL

    async def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        if not self.api_key:
            raise ValueError("IBM Granite API key is not configured.")

        full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        payload = {
            "model_id": self.model,
            "input": full_prompt,
            "parameters": {
                "decoding_method": "greedy",
                "max_new_tokens": 1024,
                "min_new_tokens": 1,
                "repetition_penalty": 1.05
            }
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(self.endpoint, headers=headers, json=payload)
            if response.status_code != 200:
                raise RuntimeError(f"IBM Granite API returned status {response.status_code}: {response.text}")
            
            data = response.json()
            # Extract generated text from Watsonx response schema
            if "results" in data and len(data["results"]) > 0:
                return data["results"][0].get("generated_text", "")
            elif "generated_text" in data:
                return data["generated_text"]
            else:
                return str(data)

from typing import Dict, Any, List, Optional

SYSTEM_PROMPT = """You are an AI-powered water sustainability decision-support assistant aligned with UN Sustainable Development Goal 6 (Clean Water and Sanitation).

Your task is to analyze user-provided water consumption statistics, retrieved knowledge documents, and user questions to generate grounded, practical, and personalized sustainability recommendations.

CRITICAL RULES:
1. Use the supplied calculated statistics as the source of truth for the user's recorded consumption.
2. Do not invent measurements or fake user habits.
3. Do not invent scientific facts or exaggerated numbers.
4. Clearly distinguish:
   - Measured data (e.g., "Your recorded average daily consumption is 436 L")
   - Calculated statistics (e.g., "Gardening represents 21.4% of your recorded usage")
   - Retrieved knowledge (e.g., "Retrieved guidance recommends installing aerators")
   - Model interpretation (e.g., "Based on your usage pattern, outdoor irrigation is a priority area")
5. Do not diagnose leaks or plumbing infrastructure problems from consumption data alone. Frame spikes as unusual patterns to inspect.
6. Provide concise, practical, realistic actions.
7. Return clean JSON when requested.
"""

def build_analysis_prompt(
    analytics_data: Dict[str, Any],
    forecast_data: Optional[Dict[str, Any]] = None,
    rag_context: str = "",
    question: Optional[str] = None
) -> str:
    total = analytics_data.get("total_consumption", 0.0)
    daily_avg = analytics_data.get("mean_daily_consumption", 0.0)
    highest_act = analytics_data.get("highest_consuming_activity", "N/A")
    
    breakdown_strs = []
    for item in analytics_data.get("activity_breakdown", []):
        breakdown_strs.append(f"  - {item['activity']}: {item['percentage']}% ({item['total_liters']} L total, {item['average_liters']} L/day avg)")
    breakdown_formatted = "\n".join(breakdown_strs)

    anomaly_strs = []
    for anomaly in analytics_data.get("anomalies", []):
        anomaly_strs.append(f"  - {anomaly['date']} ({anomaly['activity']}): Observed {anomaly['observed_liters']} L (Z-score: {anomaly['z_score']}). {anomaly['explanation']}")
    anomalies_formatted = "\n".join(anomaly_strs) if anomaly_strs else "  None detected."

    forecast_str = "No forecast generated."
    if forecast_data and forecast_data.get("has_enough_data"):
        preds = forecast_data.get("predictions", [])
        preds_summary = ", ".join([f"{p['date']}: {p['predicted_liters']} L" for p in preds[:4]])
        forecast_str = f"Model Estimate (7-day ahead): {preds_summary}..."

    user_q = question or "What are my key water conservation priorities and personalized actions?"

    prompt = f"""USER DATA SUMMARY:
Total Recorded Consumption: {total} Liters
Average Daily Consumption: {daily_avg} Liters/day
Highest Consuming Activity: {highest_act}

ACTIVITY DISTRIBUTION:
{breakdown_formatted}

FLAGGED UNUSUAL USAGE PATTERNS (ANOMALIES):
{anomalies_formatted}

CONSUMPTION FORECAST:
{forecast_str}

RETRIEVED CONSERVATION KNOWLEDGE:
{rag_context}

USER QUESTION:
{user_q}

Respond in structured JSON format with the following keys:
{{
  "summary": "Brief overall summary",
  "key_observations": ["Observed fact 1", "Observed fact 2"],
  "priority_areas": [{{"activity": "Name", "reason": "Reason", "action": "Suggested action"}}],
  "recommendations": [
    {{
      "title": "Title",
      "description": "Description",
      "reason": "Why relevant",
      "difficulty": "Easy/Moderate/Advanced"
    }}
  ],
  "immediate_actions": ["Action 1", "Action 2"],
  "limitations": ["Limitation 1"]
}}
"""
    return prompt

import pandas as pd
import numpy as np
from typing import List, Dict, Any

ACTIVITY_LABEL_MAP = {
    "bathing_liters": "Bathing",
    "laundry_liters": "Laundry",
    "cleaning_liters": "Cleaning",
    "cooking_liters": "Cooking",
    "gardening_liters": "Gardening",
    "drinking_liters": "Drinking",
    "toilet_liters": "Toilet",
    "other_liters": "Other",
    "total": "Total Daily Consumption"
}

def detect_anomalies(df: pd.DataFrame, z_threshold: float = 2.0) -> List[Dict[str, Any]]:
    anomalies = []
    if df.empty or len(df) < 5:
        return anomalies

    # Check total daily consumption anomalies using Z-score and IQR
    mean_total = df['total'].mean()
    std_total = df['total'].std()

    q1 = df['total'].quantile(0.25)
    q3 = df['total'].quantile(0.75)
    iqr = q3 - q1
    iqr_upper = q3 + (1.8 * iqr)

    for _, row in df.iterrows():
        val = float(row['total'])
        date_str = str(row['date'])

        z_score = (val - mean_total) / std_total if std_total > 0 else 0.0

        if z_score >= z_threshold or val > iqr_upper:
            # Identify which specific activity contributed most to this spike
            max_act_col = "total"
            max_act_val = 0.0
            for col in ["bathing_liters", "laundry_liters", "gardening_liters", "cleaning_liters", "toilet_liters"]:
                if col in row and float(row[col]) > max_act_val:
                    max_act_val = float(row[col])
                    max_act_col = col

            act_label = ACTIVITY_LABEL_MAP.get(max_act_col, "Daily Consumption")
            severity = "High" if z_score >= 2.5 else "Moderate"

            explanation = (
                f"Consumption on {date_str} ({val:.1f} L) was significantly higher than your recent daily average ({mean_total:.1f} L). "
                f"Spike primarily observed in {act_label}. This pattern may indicate unusual usage. "
                f"Possible causes include increased activity, outdoor usage, or a leak. Consider checking the source."
            )

            anomalies.append({
                "date": date_str,
                "activity": act_label,
                "observed_liters": round(val, 1),
                "expected_liters": round(mean_total, 1),
                "z_score": round(float(z_score), 2),
                "severity": severity,
                "explanation": explanation
            })

    # Sort anomalies by z_score descending
    anomalies.sort(key=lambda x: x["z_score"], reverse=True)
    return anomalies

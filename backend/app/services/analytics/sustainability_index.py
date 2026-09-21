import pandas as pd
from typing import Tuple

def calculate_sustainability_index(df: pd.DataFrame) -> Tuple[float, str]:
    """
    Calculates the 'Personal Water Sustainability Index' (0-100).
    Explicitly labeled as an application-defined indicator based on observed consumption behavior
    rather than an official environmental standard.
    """
    if df.empty:
        return 75.0, "Personal Water Sustainability Index (App-Defined Indicator)"

    mean_daily = float(df['total'].mean())
    std_daily = float(df['total'].std()) if len(df) > 1 else 0.0

    # Component 1: Volume Score (Max 40 points)
    # Target baseline ~ 400 L/day for a 3-4 person household
    if mean_daily <= 350:
        vol_score = 40.0
    elif mean_daily >= 800:
        vol_score = 10.0
    else:
        vol_score = 40.0 - ((mean_daily - 350) / 450) * 30.0

    # Component 2: Distribution Efficiency Score (Max 30 points)
    # Penalty if single activity (e.g. gardening or bathing) dominates > 40%
    dist_score = 30.0
    total_sum = df['total'].sum()
    if total_sum > 0:
        for col in ["gardening_liters", "bathing_liters", "laundry_liters"]:
            if col in df.columns:
                pct = (df[col].sum() / total_sum) * 100.0
                if pct > 35.0:
                    dist_score -= (pct - 35.0) * 0.5

    dist_score = max(5.0, dist_score)

    # Component 3: Consistency Score (Max 30 points)
    # Penalty for extreme fluctuations (CV = std/mean)
    cv = (std_daily / mean_daily) if mean_daily > 0 else 0.0
    if cv <= 0.15:
        consistency_score = 30.0
    elif cv >= 0.5:
        consistency_score = 10.0
    else:
        consistency_score = 30.0 - ((cv - 0.15) / 0.35) * 20.0

    final_score = round(max(10.0, min(100.0, vol_score + dist_score + consistency_score)), 1)
    label = "Personal Water Sustainability Index (App-Defined Indicator)"

    return final_score, label

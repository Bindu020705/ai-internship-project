import pandas as pd
import numpy as np
from typing import Dict, Any, List

ACTIVITY_COLS = [
    ("bathing_liters", "Bathing"),
    ("laundry_liters", "Laundry"),
    ("cleaning_liters", "Cleaning"),
    ("cooking_liters", "Cooking"),
    ("gardening_liters", "Gardening"),
    ("drinking_liters", "Drinking"),
    ("toilet_liters", "Toilet"),
    ("other_liters", "Other")
]

def calculate_analytics(df: pd.DataFrame) -> Dict[str, Any]:
    if df.empty:
        return {}

    # Total consumption
    total_liters = float(df['total'].sum())
    daily_mean = float(df['total'].mean())
    daily_median = float(df['total'].median())
    daily_min = float(df['total'].min())
    daily_max = float(df['total'].max())
    daily_std = float(df['total'].std()) if len(df) > 1 else 0.0

    # Activity distribution
    activity_contributions: List[Dict[str, Any]] = []
    highest_act = ("None", 0.0)
    lowest_act = ("None", float('inf'))

    for col_name, label in ACTIVITY_COLS:
        if col_name in df.columns:
            act_total = float(df[col_name].sum())
            act_avg = float(df[col_name].mean())
            pct = (act_total / total_liters * 100.0) if total_liters > 0 else 0.0
            
            activity_contributions.append({
                "activity": label,
                "total_liters": round(act_total, 1),
                "average_liters": round(act_avg, 1),
                "percentage": round(pct, 1)
            })

            if act_total > highest_act[1]:
                highest_act = (label, act_total)
            if act_total < lowest_act[1]:
                lowest_act = (label, act_total)

    # Sort activity contributions descending by percentage
    activity_contributions.sort(key=lambda x: x["percentage"], reverse=True)

    # Daily trend data
    daily_trend = []
    for _, row in df.iterrows():
        item = {"date": str(row['date']), "total": round(float(row['total']), 1)}
        for col_name, label in ACTIVITY_COLS:
            if col_name in row:
                item[label.lower()] = round(float(row[col_name]), 1)
        daily_trend.append(item)

    # Weekly trend data
    df_temp = df.copy()
    df_temp['date_dt'] = pd.to_datetime(df_temp['date'])
    df_temp['week'] = df_temp['date_dt'].dt.to_period('W').dt.start_time.dt.strftime('%Y-%m-%d')
    weekly_df = df_temp.groupby('week')['total'].mean().reset_index()
    weekly_trend = [{"week": str(row['week']), "average_total": round(float(row['total']), 1)} for _, row in weekly_df.iterrows()]

    # Monthly trend data
    df_temp['month'] = df_temp['date_dt'].dt.to_period('M').dt.start_time.dt.strftime('%Y-%m')
    monthly_df = df_temp.groupby('month')['total'].mean().reset_index()
    monthly_trend = [{"month": str(row['month']), "average_total": round(float(row['total']), 1)} for _, row in monthly_df.iterrows()]

    return {
        "total_consumption": round(total_liters, 1),
        "mean_daily_consumption": round(daily_mean, 1),
        "median_daily_consumption": round(daily_median, 1),
        "min_daily_consumption": round(daily_min, 1),
        "max_daily_consumption": round(daily_max, 1),
        "std_dev_consumption": round(daily_std, 1),
        "highest_consuming_activity": highest_act[0],
        "lowest_consuming_activity": lowest_act[0] if lowest_act[0] != "None" else "Cooking",
        "activity_breakdown": activity_contributions,
        "daily_trend": daily_trend,
        "weekly_trend": weekly_trend,
        "monthly_trend": monthly_trend
    }

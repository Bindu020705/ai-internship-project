import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any, List
from sklearn.linear_model import LinearRegression

def generate_forecast(df: pd.DataFrame, forecast_days: int = 7) -> Dict[str, Any]:
    """
    Generates a 7-day time series forecast using historical daily consumption.
    All outputs are explicitly labeled as 'Model estimate'.
    """
    if df.empty or len(df) < 7:
        return {
            "has_enough_data": False,
            "disclaimer": "More historical data (minimum 7 days) is required to generate a reliable forecast.",
            "predictions": [],
            "confidence": "Insufficient Data"
        }

    df_clean = df.copy()
    df_clean['date_dt'] = pd.to_datetime(df_clean['date'])
    df_clean = df_clean.sort_values(by='date_dt').reset_index(drop=True)

    # Feature engineering: Time index (0, 1, 2...), day of week
    df_clean['time_idx'] = np.arange(len(df_clean))
    df_clean['day_of_week'] = df_clean['date_dt'].dt.dayofweek

    X = df_clean[['time_idx', 'day_of_week']]
    y = df_clean['total']

    model = LinearRegression()
    model.fit(X, y)

    last_date = df_clean['date_dt'].iloc[-1]
    last_idx = df_clean['time_idx'].iloc[-1]

    predictions: List[Dict[str, Any]] = []

    for i in range(1, forecast_days + 1):
        future_date = last_date + timedelta(days=i)
        future_idx = last_idx + i
        future_dow = future_date.dayofweek

        pred_val = model.predict([[future_idx, future_dow]])[0]
        # Ensure non-negative realistic prediction
        pred_val = max(50.0, round(float(pred_val), 1))

        predictions.append({
            "day": i,
            "date": future_date.strftime("%Y-%m-%d"),
            "predicted_liters": pred_val
        })

    return {
        "has_enough_data": True,
        "disclaimer": "Model estimate based on historical trend and day-of-week regression. Not a guaranteed value.",
        "predictions": predictions,
        "confidence": "Linear Trend & Weekly Cyclical Regression"
    }

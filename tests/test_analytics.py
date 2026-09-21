import pytest
import pandas as pd
from app.services.analytics.calculator import calculate_analytics
from app.services.analytics.validator import validate_and_clean_csv
from app.services.analytics.anomaly import detect_anomalies
from app.services.analytics.sustainability_index import calculate_sustainability_index
from app.services.forecasting.predictor import generate_forecast

def test_calculator_basic():
    data = [
        {"date": "2026-01-01", "bathing_liters": 100, "laundry_liters": 50, "cleaning_liters": 20, "cooking_liters": 10, "gardening_liters": 30, "drinking_liters": 5, "toilet_liters": 40, "other_liters": 10, "total": 265},
        {"date": "2026-01-02", "bathing_liters": 120, "laundry_liters": 60, "cleaning_liters": 25, "cooking_liters": 15, "gardening_liters": 35, "drinking_liters": 5, "toilet_liters": 45, "other_liters": 10, "total": 315}
    ]
    df = pd.DataFrame(data)
    res = calculate_analytics(df)

    assert res["total_consumption"] == 580.0
    assert res["mean_daily_consumption"] == 290.0
    assert res["highest_consuming_activity"] == "Bathing"
    assert len(res["activity_breakdown"]) == 8

def test_anomaly_detection():
    data = []
    # 10 normal days ~ 200L
    for i in range(1, 11):
        data.append({"date": f"2026-01-{i:02d}", "bathing_liters": 100, "laundry_liters": 50, "cleaning_liters": 20, "cooking_liters": 10, "gardening_liters": 20, "drinking_liters": 5, "toilet_liters": 30, "other_liters": 5, "total": 240.0})
    # 1 anomaly day ~ 900L
    data.append({"date": "2026-01-11", "bathing_liters": 100, "laundry_liters": 50, "cleaning_liters": 20, "cooking_liters": 10, "gardening_liters": 650, "drinking_liters": 5, "toilet_liters": 30, "other_liters": 5, "total": 870.0})

    df = pd.DataFrame(data)
    anomalies = detect_anomalies(df)
    assert len(anomalies) >= 1
    assert anomalies[0]["date"] == "2026-01-11"
    assert "Gardening" in anomalies[0]["activity"]

def test_sustainability_index():
    data = [{"date": "2026-01-01", "total": 300, "gardening_liters": 30, "bathing_liters": 100, "laundry_liters": 50}]
    df = pd.DataFrame(data)
    score, label = calculate_sustainability_index(df)
    assert 0.0 <= score <= 100.0
    assert "App-Defined Indicator" in label

def test_forecasting_insufficient_data():
    df = pd.DataFrame([{"date": "2026-01-01", "total": 200}])
    fc = generate_forecast(df)
    assert fc["has_enough_data"] is False

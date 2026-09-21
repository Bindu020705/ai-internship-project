"""
Script to generate realistic synthetic household water consumption dataset.
Includes daily records over 60 days with typical activity breakdowns, weekend gardening spikes,
and 2-3 flagged anomaly days for testing anomaly detection algorithms.
"""

import os
import csv
import random
from datetime import datetime, timedelta

def generate_synthetic_records(num_days=60, household_members=4, anomaly_level="medium", profile="standard"):
    """
    Generates synthetic daily household water consumption records with customizable parameters.
    Returns a list of dicts.
    """
    start_date = datetime.now() - timedelta(days=num_days)
    records = []
    
    # Scale multiplier based on household members (baseline assumes 4 members)
    member_scale = max(0.5, household_members / 4.0)
    
    # Scale multiplier based on consumption profile
    profile_scales = {
        "eco": 0.7,
        "standard": 1.0,
        "high_usage": 1.45
    }
    prof_scale = profile_scales.get(profile.lower(), 1.0)
    
    base_activity_means = {
        "bathing_liters": 140.0 * member_scale * prof_scale,
        "laundry_liters": 85.0 * member_scale * prof_scale,
        "cleaning_liters": 45.0 * member_scale * prof_scale,
        "cooking_liters": 30.0 * member_scale * prof_scale,
        "gardening_liters": 70.0 * prof_scale,
        "drinking_liters": 15.0 * member_scale * prof_scale,
        "toilet_liters": 95.0 * member_scale * prof_scale,
        "other_liters": 25.0 * member_scale * prof_scale
    }
    
    # Determine anomaly days
    anomaly_counts = {"low": 1, "medium": 3, "high": 6}
    n_anomalies = anomaly_counts.get(anomaly_level.lower(), 3)
    
    # Pick fixed or random anomaly indices spread across days
    step = max(1, num_days // (n_anomalies + 1))
    anomaly_days = {}
    activities = ["gardening_liters", "bathing_liters", "laundry_liters", "cleaning_liters", "toilet_liters"]
    for idx in range(1, n_anomalies + 1):
        day_idx = min(num_days - 1, idx * step)
        anomaly_days[day_idx] = activities[idx % len(activities)]
        
    for i in range(num_days):
        current_date = start_date + timedelta(days=i)
        date_str = current_date.strftime("%Y-%m-%d")
        is_weekend = current_date.weekday() >= 5
        
        row = {"date": date_str}
        
        for activity, mean in base_activity_means.items():
            std_dev = mean * 0.15
            val = random.gauss(mean, std_dev)
            
            if is_weekend and activity in ["laundry_liters", "gardening_liters"]:
                val *= 1.4
                
            if i in anomaly_days and anomaly_days[i] == activity:
                val *= 3.2
                
            row[activity] = round(max(5.0, val), 1)
            
        records.append(row)
        
    return records

def generate_water_consumption_data(num_days=60, output_path="data/demo/sample_water_consumption.csv"):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    records = generate_synthetic_records(num_days=num_days)
    
    fieldnames = [
        "date", "bathing_liters", "laundry_liters", "cleaning_liters",
        "cooking_liters", "gardening_liters", "drinking_liters",
        "toilet_liters", "other_liters"
    ]
    
    with open(output_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)
        
    print(f"Successfully generated {num_days} days of synthetic water consumption data at '{output_path}'.")

if __name__ == "__main__":
    generate_water_consumption_data()


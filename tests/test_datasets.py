import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_load_demo_dataset():
    response = client.post("/api/datasets/demo")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["source"] == "demo"
    assert data["data"]["row_count"] == 60

def test_create_synthetic_dataset():
    payload = {
        "name": "Test Synthetic Dataset",
        "num_days": 30,
        "household_members": 3,
        "anomaly_level": "high",
        "profile": "eco"
    }
    response = client.post("/api/datasets/synthetic", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["name"] == "Test Synthetic Dataset"
    assert data["data"]["source"] == "synthetic"
    assert data["data"]["row_count"] == 30

def test_create_manual_dataset_and_record_ops():
    # 1. Create Manual Dataset
    manual_payload = {
        "name": "My Custom Manual Dataset",
        "records": [
            {
                "date": "2026-09-01",
                "bathing": 100.0,
                "laundry": 50.0,
                "cleaning": 30.0,
                "cooking": 20.0,
                "gardening": 40.0,
                "drinking": 10.0,
                "toilet": 80.0,
                "other": 15.0
            },
            {
                "date": "2026-09-02",
                "bathing": 110.0,
                "laundry": 55.0,
                "cleaning": 35.0,
                "cooking": 25.0,
                "gardening": 45.0,
                "drinking": 12.0,
                "toilet": 85.0,
                "other": 18.0
            }
        ]
    }
    res = client.post("/api/datasets/manual", json=manual_payload)
    assert res.status_code == 200
    dataset = res.json()["data"]
    dataset_id = dataset["id"]
    assert dataset["source"] == "manual"
    assert dataset["row_count"] == 2

    # 2. Get Details
    res_details = client.get(f"/api/datasets/{dataset_id}")
    assert res_details.status_code == 200
    details = res_details.json()["data"]
    records = details["records"]
    assert len(records) == 2
    first_rec_id = records[0]["id"]
    assert records[0]["total"] == 345.0 # 100+50+30+20+40+10+80+15

    # 3. Add Record to Dataset
    add_payload = {
        "date": "2026-09-03",
        "bathing": 90.0,
        "laundry": 40.0,
        "cleaning": 20.0,
        "cooking": 15.0,
        "gardening": 30.0,
        "drinking": 10.0,
        "toilet": 70.0,
        "other": 10.0
    }
    res_add = client.post(f"/api/datasets/{dataset_id}/records", json=add_payload)
    assert res_add.status_code == 200
    added_rec = res_add.json()["data"]
    assert added_rec["total"] == 285.0

    # 4. Update Record
    update_payload = {
        "bathing": 150.0
    }
    res_upd = client.put(f"/api/datasets/{dataset_id}/records/{first_rec_id}", json=update_payload)
    assert res_upd.status_code == 200
    updated_rec = res_upd.json()["data"]
    assert updated_rec["bathing"] == 150.0
    assert updated_rec["total"] == 395.0

    # 5. Calculate Analytics on Manual Dataset
    res_analytics = client.get(f"/api/analytics/{dataset_id}")
    assert res_analytics.status_code == 200
    an_data = res_analytics.json()["data"]
    assert an_data["dataset_id"] == dataset_id
    assert an_data["total_consumption"] > 0

    # 6. Delete Record
    res_del_rec = client.delete(f"/api/datasets/{dataset_id}/records/{first_rec_id}")
    assert res_del_rec.status_code == 200

    # 7. Delete Dataset
    res_del = client.delete(f"/api/datasets/{dataset_id}")
    assert res_del.status_code == 200

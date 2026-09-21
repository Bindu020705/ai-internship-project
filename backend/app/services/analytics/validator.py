import io
import pandas as pd
from typing import Tuple, List, Dict, Any

REQUIRED_COLUMNS = [
    "date",
    "bathing_liters",
    "laundry_liters",
    "cleaning_liters",
    "cooking_liters",
    "gardening_liters",
    "drinking_liters",
    "toilet_liters",
    "other_liters"
]

def validate_and_clean_csv(file_content: bytes) -> Tuple[bool, pd.DataFrame, List[str]]:
    errors = []
    try:
        df = pd.read_csv(io.BytesIO(file_content))
    except Exception as e:
        return False, pd.DataFrame(), [f"Failed to parse CSV file: {str(e)}"]

    # Normalize column names (lowercase, strip whitespace)
    df.columns = [c.strip().lower() for c in df.columns]

    # Check required columns
    missing_cols = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing_cols:
        return False, pd.DataFrame(), [f"Missing required columns: {', '.join(missing_cols)}"]

    # Check for empty dataframe
    if df.empty:
        return False, pd.DataFrame(), ["Uploaded dataset is empty."]

    # Validate date column
    try:
        df['date'] = pd.to_datetime(df['date']).dt.strftime('%Y-%m-%d')
    except Exception:
        errors.append("Invalid date format in 'date' column. Expected YYYY-MM-DD or standard date format.")

    # Check numeric columns
    numeric_cols = [c for c in REQUIRED_COLUMNS if c != "date"]
    for col in numeric_cols:
        # Convert to float, replacing invalid entries with NaN
        df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Check negative values
        negatives = df[df[col] < 0]
        if not negatives.empty:
            errors.append(f"Column '{col}' contains negative values on {len(negatives)} rows. Replaced with 0.")
            df[col] = df[col].apply(lambda x: max(0.0, x) if pd.notnull(x) else 0.0)
            
        # Fill missing values with 0 or column mean
        df[col] = df[col].fillna(0.0)

    # Calculate total per row
    df['total'] = df[numeric_cols].sum(axis=1)

    # Sort by date
    df = df.sort_values(by='date').drop_duplicates(subset=['date'], keep='last')

    is_valid = len(errors) == 0 or df.shape[0] > 0
    return is_valid, df, errors

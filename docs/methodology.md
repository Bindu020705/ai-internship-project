# Analytics & Data Science Methodology

## 1. Statistical Analytics
- **Descriptive Statistics**: Calculates mean, median, min, max, standard deviation, daily, weekly, and monthly averages from recorded daily activity logs.
- **Activity Ratios**: Calculates exact percentage contribution for Bathing, Laundry, Cleaning, Cooking, Gardening, Drinking, Toilet, and Other.

## 2. Anomaly Detection Algorithm
- **Z-Score Calculation**: \( Z = \frac{X - \mu}{\sigma} \)
- **IQR Rule**: \( \text{Upper Bound} = Q_3 + 1.8 \times \text{IQR} \)
- **Flagging Rule**: Anomaly flagged if \( Z \ge 2.0 \) or \( X > \text{Upper Bound} \).
- **Nuanced Messaging**: Flagged spikes state: *"This pattern may indicate unusual usage. Possible causes include increased activity, outdoor usage, or a leak. Consider checking the source."* (Avoiding unsupported leak diagnostic claims).

## 3. Time Series Forecasting
- **Linear & Cyclical Regression**: Models overall consumption trend + day-of-week cyclicality.
- **Data Requirement**: Minimum 7 days of historical records required.
- **Disclaimer**: All outputs explicitly tagged as **Model estimate**.

## 4. Personal Water Sustainability Index
- **Range**: 0 - 100.
- **Label**: Explicitly tagged as **Personal Water Sustainability Index (App-Defined Indicator)**.
- **Components**:
  1. Volume Score (40%): Evaluates per capita consumption against 350-400 L/day household target.
  2. Activity Balance (30%): Penalizes heavy single-activity domination (>35%).
  3. Consistency Score (30%): Rewards low coefficient of variation (\( CV = \sigma / \mu \)).

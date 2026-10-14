import pandas as pd
import numpy as np
import json
import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")

REQUIRED_COLUMNS = [
    "Age", "Monthly_Income", "Credit_Score", "Employment_Years",
    "Loan_Amount", "Loan_Tenure_Months", "Existing_Loans",
    "Existing_EMI", "Monthly_Expenses", "Previous_Defaults", "Loan_Approved"
]

FEATURE_COLUMNS = [
    "Age", "Monthly_Income", "Credit_Score", "Employment_Years",
    "Loan_Amount", "Loan_Tenure_Months", "Existing_Loans",
    "Existing_EMI", "Monthly_Expenses", "Previous_Defaults"
]

TARGET_COLUMN = "Loan_Approved"


def load_dataset(filepath=None):
    if filepath is None:
        filepath = os.path.join(DATA_DIR, "loan_dataset.csv")

    if not os.path.exists(filepath):
        return None, {"error": f"Dataset file not found: {os.path.basename(filepath)}"}

    try:
        df = pd.read_csv(filepath)
    except Exception as e:
        return None, {"error": f"Failed to read CSV: {str(e)}"}

    return df, None


def validate_dataset(df):
    report = {
        "total_rows": len(df),
        "total_columns": len(df.columns),
        "columns_found": list(df.columns),
        "missing_columns": [],
        "extra_columns": [],
        "missing_values": {},
        "duplicate_rows": 0,
        "data_types": {},
        "class_distribution": {},
        "valid": True,
        "errors": [],
        "warnings": []
    }

    missing_cols = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    extra_cols = [c for c in df.columns if c not in REQUIRED_COLUMNS]
    report["missing_columns"] = missing_cols
    report["extra_columns"] = extra_cols

    if missing_cols:
        report["valid"] = False
        report["errors"].append(f"Missing required columns: {missing_cols}")
        return report

    for col in REQUIRED_COLUMNS:
        missing_count = int(df[col].isnull().sum())
        if missing_count > 0:
            report["missing_values"][col] = missing_count

    report["duplicate_rows"] = int(df.duplicated().sum())

    for col in REQUIRED_COLUMNS:
        report["data_types"][col] = str(df[col].dtype)

    if TARGET_COLUMN in df.columns:
        class_dist = df[TARGET_COLUMN].value_counts().to_dict()
        report["class_distribution"] = {str(k): int(v) for k, v in class_dist.items()}

        unique_vals = df[TARGET_COLUMN].unique()
        if not set(unique_vals).issubset({0, 1}):
            report["valid"] = False
            report["errors"].append(f"Target column has unexpected values: {unique_vals.tolist()}")

    if len(df) < 10:
        report["valid"] = False
        report["errors"].append("Dataset has fewer than 10 rows, insufficient for training")

    for col in FEATURE_COLUMNS:
        if col in df.columns:
            non_numeric = pd.to_numeric(df[col], errors="coerce").isnull().sum() - df[col].isnull().sum()
            if non_numeric > 0:
                report["warnings"].append(f"Column '{col}' has {non_numeric} non-numeric values")

    if report["duplicate_rows"] > 0:
        report["warnings"].append(f"Dataset contains {report['duplicate_rows']} duplicate rows")

    if report["missing_values"]:
        report["warnings"].append(f"Missing values found in: {list(report['missing_values'].keys())}")

    return report


def preprocess_features(df):
    df_clean = df.copy()

    for col in FEATURE_COLUMNS:
        df_clean[col] = pd.to_numeric(df_clean[col], errors="coerce")

    df_clean[TARGET_COLUMN] = pd.to_numeric(df_clean[TARGET_COLUMN], errors="coerce")

    initial_rows = len(df_clean)
    df_clean = df_clean.dropna(subset=[TARGET_COLUMN])
    dropped_target = initial_rows - len(df_clean)

    for col in FEATURE_COLUMNS:
        if df_clean[col].isnull().any():
            median_val = df_clean[col].median()
            df_clean[col] = df_clean[col].fillna(median_val)

    df_clean = df_clean[FEATURE_COLUMNS + [TARGET_COLUMN]]
    df_clean[TARGET_COLUMN] = df_clean[TARGET_COLUMN].astype(int)

    return df_clean, {"rows_after_cleaning": len(df_clean), "rows_dropped_missing_target": dropped_target}


def run_preparation(filepath=None):
    os.makedirs(REPORTS_DIR, exist_ok=True)

    df, error = load_dataset(filepath)
    if error:
        report = {"valid": False, "errors": [error["error"]]}
        with open(os.path.join(REPORTS_DIR, "dataset_validation.json"), "w") as f:
            json.dump(report, f, indent=2)
        return None, report

    validation_report = validate_dataset(df)

    with open(os.path.join(REPORTS_DIR, "dataset_validation.json"), "w") as f:
        json.dump(validation_report, f, indent=2)

    if not validation_report["valid"]:
        return None, validation_report

    df_clean, clean_info = preprocess_features(df)
    validation_report.update(clean_info)

    with open(os.path.join(REPORTS_DIR, "dataset_validation.json"), "w") as f:
        json.dump(validation_report, f, indent=2)

    return df_clean, validation_report


if __name__ == "__main__":
    filepath = sys.argv[1] if len(sys.argv) > 1 else None
    df_clean, report = run_preparation(filepath)

    if df_clean is not None:
        print(f"Dataset prepared successfully: {len(df_clean)} rows")
        print(f"Class distribution: {report.get('class_distribution', {})}")
    else:
        print(f"Dataset preparation failed: {report.get('errors', [])}")
        sys.exit(1)

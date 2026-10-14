import os
import sys
import json
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, roc_auc_score, classification_report
)
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

from prepare_data import run_preparation, FEATURE_COLUMNS, TARGET_COLUMN

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")

RANDOM_SEED = 42


def evaluate_model(filepath=None):
    os.makedirs(REPORTS_DIR, exist_ok=True)

    model_path = os.path.join(MODEL_DIR, "decision_tree_model.joblib")
    scaler_path = os.path.join(MODEL_DIR, "scaler.joblib")

    if not os.path.exists(model_path) or not os.path.exists(scaler_path):
        print("Error: Trained model not found. Run train_model.py first.")
        return False

    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)

    df_clean, validation_report = run_preparation(filepath)
    if df_clean is None:
        print("Error: Dataset preparation failed")
        return False

    X = df_clean[FEATURE_COLUMNS].values
    y = df_clean[TARGET_COLUMN].values

    from sklearn.model_selection import train_test_split
    _, X_test, _, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_SEED, stratify=y
    )

    X_test_scaled = scaler.transform(X_test)
    y_pred = model.predict(X_test_scaled)
    y_pred_proba = model.predict_proba(X_test_scaled)

    conf_mat = confusion_matrix(y_test, y_pred)
    fig, ax = plt.subplots(figsize=(8, 6))
    sns.heatmap(
        conf_mat, annot=True, fmt="d", cmap="Blues",
        xticklabels=["Rejected (0)", "Approved (1)"],
        yticklabels=["Rejected (0)", "Approved (1)"],
        ax=ax
    )
    ax.set_xlabel("Predicted")
    ax.set_ylabel("Actual")
    ax.set_title("Confusion Matrix — Decision Tree Model")
    plt.tight_layout()
    plt.savefig(os.path.join(REPORTS_DIR, "confusion_matrix.png"), dpi=150)
    plt.close()

    feature_importances = model.feature_importances_
    sorted_idx = np.argsort(feature_importances)

    fig, ax = plt.subplots(figsize=(10, 6))
    colors = plt.cm.RdYlGn(feature_importances[sorted_idx] / max(feature_importances[sorted_idx]))
    ax.barh(
        [FEATURE_COLUMNS[i] for i in sorted_idx],
        feature_importances[sorted_idx],
        color=colors
    )
    ax.set_xlabel("Feature Importance")
    ax.set_title("Feature Importance — Decision Tree Model")
    plt.tight_layout()
    plt.savefig(os.path.join(REPORTS_DIR, "feature_importance.png"), dpi=150)
    plt.close()

    class_dist = pd.Series(y).value_counts().sort_index()
    fig, ax = plt.subplots(figsize=(6, 4))
    bars = ax.bar(
        ["Rejected (0)", "Approved (1)"],
        class_dist.values,
        color=["#ef4444", "#10b981"]
    )
    for bar, val in zip(bars, class_dist.values):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 5,
                str(val), ha="center", va="bottom", fontweight="bold")
    ax.set_ylabel("Count")
    ax.set_title("Dataset Class Distribution")
    plt.tight_layout()
    plt.savefig(os.path.join(REPORTS_DIR, "class_distribution.png"), dpi=150)
    plt.close()

    print("Evaluation plots generated successfully!")
    print(f"  - confusion_matrix.png")
    print(f"  - feature_importance.png")
    print(f"  - class_distribution.png")

    return True


if __name__ == "__main__":
    filepath = sys.argv[1] if len(sys.argv) > 1 else None
    success = evaluate_model(filepath)
    if not success:
        sys.exit(1)

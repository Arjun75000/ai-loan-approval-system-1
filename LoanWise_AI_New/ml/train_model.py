import os
import sys
import json
import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.dummy import DummyClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, roc_auc_score, classification_report
)
import joblib
from datetime import datetime

from prepare_data import run_preparation, FEATURE_COLUMNS, TARGET_COLUMN

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")

RANDOM_SEED = 42


def train_model(filepath=None):
    os.makedirs(MODEL_DIR, exist_ok=True)
    os.makedirs(REPORTS_DIR, exist_ok=True)

    df_clean, validation_report = run_preparation(filepath)

    if df_clean is None:
        print("Cannot train: dataset preparation failed")
        print(json.dumps(validation_report, indent=2))
        return False

    X = df_clean[FEATURE_COLUMNS].values
    y = df_clean[TARGET_COLUMN].values

    class_counts = np.bincount(y.astype(int))
    min_class_count = min(class_counts)

    if min_class_count < 5:
        print(f"Warning: Smallest class has only {min_class_count} samples")

    test_size = 0.2
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=RANDOM_SEED, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    param_grid = {
        "max_depth": [3, 5, 7, 10, 15, None],
        "min_samples_split": [2, 5, 10, 20],
        "min_samples_leaf": [1, 2, 5, 10],
        "criterion": ["gini", "entropy"],
        "class_weight": [None, "balanced"]
    }

    n_cv_folds = min(5, min_class_count)
    if n_cv_folds < 2:
        n_cv_folds = 2

    cv_strategy = StratifiedKFold(n_splits=n_cv_folds, shuffle=True, random_state=RANDOM_SEED)

    grid_search = GridSearchCV(
        DecisionTreeClassifier(random_state=RANDOM_SEED),
        param_grid,
        cv=cv_strategy,
        scoring="f1",
        n_jobs=-1,
        refit=True
    )

    grid_search.fit(X_train_scaled, y_train)

    best_model = grid_search.best_estimator_
    best_params = grid_search.best_params_

    y_pred = best_model.predict(X_test_scaled)
    y_pred_proba = best_model.predict_proba(X_test_scaled)

    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    conf_matrix = confusion_matrix(y_test, y_pred).tolist()

    try:
        roc_auc = roc_auc_score(y_test, y_pred_proba[:, 1])
    except (ValueError, IndexError):
        roc_auc = None

    cv_scores = cross_val_score(
        best_model, X_train_scaled, y_train,
        cv=cv_strategy, scoring="f1"
    )

    dummy_clf = DummyClassifier(strategy="most_frequent", random_state=RANDOM_SEED)
    dummy_clf.fit(X_train_scaled, y_train)
    dummy_pred = dummy_clf.predict(X_test_scaled)
    baseline_accuracy = accuracy_score(y_test, dummy_pred)
    baseline_f1 = f1_score(y_test, dummy_pred, zero_division=0)

    feature_importances = best_model.feature_importances_.tolist()
    feature_importance_dict = {
        col: round(imp, 6) for col, imp in zip(FEATURE_COLUMNS, feature_importances)
    }
    sorted_features = sorted(feature_importance_dict.items(), key=lambda x: x[1], reverse=True)

    joblib.dump(best_model, os.path.join(MODEL_DIR, "decision_tree_model.joblib"))
    joblib.dump(scaler, os.path.join(MODEL_DIR, "scaler.joblib"))

    training_timestamp = datetime.now().isoformat()

    metrics_report = {
        "model_type": "DecisionTreeClassifier",
        "training_timestamp": training_timestamp,
        "random_seed": RANDOM_SEED,
        "dataset_size": len(df_clean),
        "train_size": len(X_train),
        "test_size": len(X_test),
        "class_distribution": {
            "total": {str(k): int(v) for k, v in zip(*np.unique(y, return_counts=True))},
            "train": {str(k): int(v) for k, v in zip(*np.unique(y_train, return_counts=True))},
            "test": {str(k): int(v) for k, v in zip(*np.unique(y_test, return_counts=True))}
        },
        "best_parameters": {k: str(v) if v is not None else "None" for k, v in best_params.items()},
        "test_metrics": {
            "accuracy": round(accuracy, 4),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(roc_auc, 4) if roc_auc is not None else None,
            "confusion_matrix": conf_matrix
        },
        "cross_validation": {
            "n_folds": n_cv_folds,
            "mean_f1": round(float(cv_scores.mean()), 4),
            "std_f1": round(float(cv_scores.std()), 4),
            "fold_scores": [round(float(s), 4) for s in cv_scores]
        },
        "baseline_comparison": {
            "baseline_strategy": "most_frequent",
            "baseline_accuracy": round(baseline_accuracy, 4),
            "baseline_f1": round(baseline_f1, 4),
            "model_accuracy": round(accuracy, 4),
            "model_f1": round(f1, 4),
            "improvement_accuracy": round(accuracy - baseline_accuracy, 4),
            "improvement_f1": round(f1 - baseline_f1, 4)
        },
        "model_version": "1.0.0",
        "notes": "Decision Tree trained with GridSearchCV hyperparameter tuning. Predictions are estimates for educational purposes only."
    }

    with open(os.path.join(REPORTS_DIR, "metrics.json"), "w") as f:
        json.dump(metrics_report, f, indent=2)

    feature_report = {
        "feature_importances": feature_importance_dict,
        "sorted_features": [{"feature": f, "importance": i} for f, i in sorted_features],
        "training_timestamp": training_timestamp,
        "note": "Feature importance shows how much each feature contributed to the model's decisions. Higher importance does not prove causation."
    }

    with open(os.path.join(REPORTS_DIR, "feature_importance.json"), "w") as f:
        json.dump(feature_report, f, indent=2)

    class_report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)

    evaluation_report = {
        "summary": {
            "model_type": "DecisionTreeClassifier",
            "training_timestamp": training_timestamp,
            "dataset_rows": len(df_clean),
            "model_version": "1.0.0"
        },
        "metrics": metrics_report["test_metrics"],
        "cross_validation": metrics_report["cross_validation"],
        "baseline_comparison": metrics_report["baseline_comparison"],
        "classification_report": {
            k: v for k, v in class_report.items()
            if k not in ["accuracy"]
        },
        "feature_importance": feature_report["sorted_features"],
        "class_distribution": metrics_report["class_distribution"],
        "parameters": metrics_report["best_parameters"],
        "limitations": [
            "This model is trained on a limited dataset and may not generalize to real-world scenarios.",
            "Predictions are estimates and should not be treated as actual bank decisions.",
            "Feature importance indicates correlation in this dataset, not real-world causation.",
            "The model's probability estimates may not be well-calibrated for small or imbalanced datasets."
        ]
    }

    with open(os.path.join(REPORTS_DIR, "evaluation_report.json"), "w") as f:
        json.dump(evaluation_report, f, indent=2)

    model_status = {
        "trained": True,
        "model_path": "model/decision_tree_model.joblib",
        "scaler_path": "model/scaler.joblib",
        "training_timestamp": training_timestamp,
        "model_version": "1.0.0",
        "feature_columns": FEATURE_COLUMNS,
        "target_column": TARGET_COLUMN
    }

    with open(os.path.join(MODEL_DIR, "model_status.json"), "w") as f:
        json.dump(model_status, f, indent=2)

    print(f"Model trained successfully!")
    print(f"Test Accuracy: {accuracy:.4f}")
    print(f"Test F1-Score: {f1:.4f}")
    print(f"ROC-AUC: {roc_auc:.4f}" if roc_auc else "ROC-AUC: N/A")
    print(f"Baseline Accuracy: {baseline_accuracy:.4f}")
    print(f"Best Parameters: {best_params}")
    print(f"Cross-validation F1: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

    return True


if __name__ == "__main__":
    filepath = sys.argv[1] if len(sys.argv) > 1 else None
    success = train_model(filepath)
    if not success:
        sys.exit(1)

"""
Model training pipeline using Hugging Face datasets and scikit-learn.
Supports rule-based weak labeling and optional push to Hugging Face Hub.
"""
from pathlib import Path
from typing import Any

MODELS_DIR = Path(__file__).parent.parent / "models"
TABULAR_MODEL_PATH = MODELS_DIR / "fraud_classifier.joblib"


def train_model(
    data: dict[str, Any],
    rule_based_labels: bool = True,
    push_to_hub: bool = False,
    hf_repo_id: str | None = None,
) -> dict[str, Any]:
    """
    Train a fraud classification model on the provided data.
    Uses Hugging Face datasets for data handling and scikit-learn for the classifier.
    """
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import classification_report, roc_auc_score
    import joblib
    import numpy as np

    from .feature_engineering import (
        build_training_dataset,
        feature_dict_to_vector,
        FEATURE_COLS,
    )

    samples, labels = build_training_dataset(
        data.get("vendors", []),
        data.get("invoices", []),
        data.get("payments", []),
        data.get("glEntries", []),
        rule_based_labels=rule_based_labels,
    )

    if len(samples) < 10:
        return {
            "success": False,
            "error": "Insufficient data. Need at least 10 records to train.",
            "records_used": len(samples),
        }

    X = np.array([feature_dict_to_vector(s) for s in samples])
    y = np.array(labels)

    # Ensure we have both classes
    if len(set(y)) < 2:
        return {
            "success": False,
            "error": "Need both fraudulent and legitimate examples. Add more diverse data.",
            "records_used": len(samples),
        }

    stratify = y if len(set(y)) >= 2 else None
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=stratify
    )

    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        class_weight="balanced",
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1] if model.classes_[1] == 1 else model.predict_proba(X_test)[:, 0]
    report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)
    try:
        auc = float(roc_auc_score(y_test, y_proba))
    except Exception:
        auc = 0.5

    # Save model
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, TABULAR_MODEL_PATH)

    result: dict[str, Any] = {
        "success": True,
        "records_used": len(samples),
        "train_size": len(X_train),
        "test_size": len(X_test),
        "accuracy": float(report.get("accuracy", 0)),
        "auc_roc": auc,
        "model_path": str(TABULAR_MODEL_PATH),
        "feature_importance": dict(zip(FEATURE_COLS, [float(x) for x in model.feature_importances_])),
    }

    # Optional: push to Hugging Face Hub
    if push_to_hub and hf_repo_id:
        try:
            from huggingface_hub import HfApi, create_repo
            api = HfApi()
            create_repo(hf_repo_id, exist_ok=True, repo_type="model")
            api.upload_file(
                path_in_repo="fraud_classifier.joblib",
                path_or_fileobj=str(TABULAR_MODEL_PATH),
                repo_id=hf_repo_id,
                repo_type="model",
            )
            result["hf_repo"] = hf_repo_id
        except Exception as e:
            result["hf_push_error"] = str(e)

    return result


def create_hf_dataset(data: dict[str, Any], rule_based_labels: bool = True):
    """
    Create a Hugging Face Dataset from processed data for training or sharing.
    """
    from datasets import Dataset  # type: ignore
    from .feature_engineering import build_training_dataset, feature_dict_to_vector, FEATURE_COLS

    samples, labels = build_training_dataset(
        data.get("vendors", []),
        data.get("invoices", []),
        data.get("payments", []),
        data.get("glEntries", []),
        rule_based_labels=rule_based_labels,
    )

    if not samples:
        raise ValueError("No data to create dataset")

    # Convert to HF Dataset format
    features = {col: [s[col] for s in samples] for col in FEATURE_COLS}
    features["label"] = labels
    return Dataset.from_dict(features)

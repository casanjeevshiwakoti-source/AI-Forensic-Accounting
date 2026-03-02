"""
AI inference for fraud risk scoring using Hugging Face Transformers (zero-shot)
and optional trained tabular model.
"""
import os
from pathlib import Path
from typing import Any

MODELS_DIR = Path(__file__).parent.parent / "models"
TABULAR_MODEL_PATH = MODELS_DIR / "fraud_classifier.joblib"


def _get_tabular_model():
    """Load trained scikit-learn model if available."""
    try:
        import joblib
        if TABULAR_MODEL_PATH.exists():
            return joblib.load(TABULAR_MODEL_PATH)
    except Exception:
        pass
    return None


def _get_zero_shot_pipeline():
    """Lazy-load Hugging Face zero-shot classification pipeline."""
    import os
    try:
        from transformers import pipeline
        # Use smaller model by default for CPU; set HF_ZERO_SHOT_MODEL for custom
        model = os.getenv("HF_ZERO_SHOT_MODEL", "typeform/distilbert-base-uncased-mnli")
        return pipeline(
            "zero-shot-classification",
            model=model,
            device=-1,  # CPU; use 0 for GPU if available
        )
    except Exception as e:
        raise RuntimeError(f"Failed to load Hugging Face zero-shot model: {e}") from e


def predict_with_tabular(features: list[dict], feature_cols: list[str] | None = None) -> list[float]:
    """
    Predict fraud probability using trained tabular model.
    Returns list of probabilities (0–1) for each sample.
    """
    import numpy as np
    if feature_cols is None:
        feature_cols = FEATURE_COLS
    model = _get_tabular_model()
    if model is None:
        return [0.5] * len(features)  # No model: neutral score

    try:
        X = np.array([feature_dict_to_vector(f) for f in features])
        probs = model.predict_proba(X)
        # Return probability of positive class (fraud)
        if probs.shape[1] == 2:
            return probs[:, 1].tolist()
        return probs[:, 0].tolist()
    except Exception:
        return [0.5] * len(features)


def predict_with_zero_shot(texts: list[str], labels: list[str] | None = None) -> list[float]:
    """
    Predict fraud probability using Hugging Face zero-shot classification.
    Returns list of probabilities for the 'suspicious' label.
    """
    if labels is None:
        labels = ["suspicious", "legitimate"]

    pipe = _get_zero_shot_pipeline()

    results = []
    # Process in batches to avoid memory issues
    batch_size = 8
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        try:
            out = pipe(batch, labels, multi_label=False)
            for item in out:
                scores = dict(zip(item["labels"], item["scores"]))
                results.append(scores.get("suspicious", 0.5))
        except Exception:
            results.extend([0.5] * len(batch))

    return results


def score_records(
    data: dict[str, Any],
    use_zero_shot: bool = False,
    use_tabular: bool = True,
) -> dict[str, list[float]]:
    """
    Score all records (invoices, payments, gl) with AI risk scores.
    Returns dict with keys like 'invoices', 'payments', 'glEntries' mapping to list of scores.
    """
    from .feature_engineering import (
        invoice_to_features,
        payment_to_features,
        gl_to_features,
        transaction_to_text,
        FEATURE_COLS,
        feature_dict_to_vector,
    )

    vendor_lookup = {str(v.get("vendor_id", v.get("vendor_Id", ""))): v for v in data.get("vendors", [])}
    result: dict[str, list[float]] = {}

    # Tabular model scores
    if use_tabular:
        for key, records, featurizer in [
            ("invoices", data.get("invoices", []), lambda r: invoice_to_features(r, vendor_lookup)),
            ("payments", data.get("payments", []), lambda r: payment_to_features(r, vendor_lookup)),
            ("glEntries", data.get("glEntries", []), lambda r: gl_to_features(r)),
        ]:
            if records:
                feats = [featurizer(r) for r in records]
                for f in feats:
                    for c in FEATURE_COLS:
                        if c not in f:
                            f[c] = 0.0
                result[key] = predict_with_tabular(feats)

    # Zero-shot (text-based) - optional, for descriptions
    if use_zero_shot:
        try:
            for key, records, rec_type in [
                ("invoices", data.get("invoices", []), "invoice"),
                ("payments", data.get("payments", []), "payment"),
                ("glEntries", data.get("glEntries", []), "gl"),
            ]:
                if records:
                    texts = [transaction_to_text(r, rec_type, vendor_lookup) for r in records]
                    zs_scores = predict_with_zero_shot(texts)
                    if key in result:
                        # Blend tabular and zero-shot (50/50)
                        result[key] = [
                            (a + b) / 2 for a, b in zip(result[key], zs_scores)
                        ]
                    else:
                        result[key] = zs_scores
        except Exception:
            pass  # Fallback to tabular only

    return result

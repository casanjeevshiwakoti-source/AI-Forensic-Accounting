"""
Feature engineering for forensic accounting fraud detection.
Converts raw CSV data into feature vectors for ML models.
"""
from typing import Any
import numpy as np


def _parse_num(val: Any) -> float:
    if val is None or val == "":
        return 0.0
    try:
        return float(val)
    except (ValueError, TypeError):
        return 0.0


def _parse_date(val: Any) -> str:
    if not val:
        return ""
    return str(val)


def invoice_to_features(inv: dict, vendor_lookup: dict[str, dict]) -> dict[str, float]:
    """Extract numeric and categorical features from an invoice record."""
    amount = _parse_num(inv.get("amount"))
    vendor_id = str(inv.get("vendor_id", inv.get("vendor_Id", "")))
    vendor = vendor_lookup.get(vendor_id, {})
    created_by = str(inv.get("created_by_user_id", inv.get("createdBy", "")))
    approved_by = str(inv.get("approved_by_user_id", inv.get("approvedBy", "")))

    # Threshold evasion flags
    in_5k = 1.0 if 4900 <= amount < 5000 else 0.0
    in_10k = 1.0 if 9800 <= amount < 10000 else 0.0
    in_25k = 1.0 if 24800 <= amount < 25000 else 0.0
    threshold_evasion = max(in_5k, in_10k, in_25k)

    # Self-approval
    self_approval = 1.0 if (created_by and approved_by and created_by == approved_by) else 0.0

    # Round dollar
    round_dollar = 1.0 if (amount >= 1000 and amount % 1000 == 0) else 0.0

    # Vendor risk
    vendor_risk = 1.0 if vendor.get("risk_flag_internal") == "Y" else 0.0

    # Amount normalized (log scale for large range)
    amount_log = np.log1p(amount) if amount > 0 else 0.0

    return {
        "amount": amount,
        "amount_log": amount_log,
        "threshold_evasion": threshold_evasion,
        "self_approval": self_approval,
        "round_dollar": round_dollar,
        "vendor_risk": vendor_risk,
        "weekend_payment": 0.0,
        "off_hours_entry": 0.0,
    }


def payment_to_features(p: dict, vendor_lookup: dict[str, dict]) -> dict[str, float]:
    """Extract features from a payment record."""
    amount = _parse_num(p.get("amount"))
    vendor_id = str(p.get("vendor_id", p.get("vendor_Id", "")))
    vendor = vendor_lookup.get(vendor_id, {})
    date_str = _parse_date(p.get("payment_date"))

    weekend = 0.0
    if date_str:
        try:
            from datetime import datetime
            dt = datetime.fromisoformat(date_str.replace("Z", "+00:00")) if "T" in date_str else datetime.strptime(date_str[:10], "%Y-%m-%d")
            weekend = 1.0 if dt.weekday() >= 5 else 0.0  # Sat=5, Sun=6
        except (ValueError, TypeError):
            pass

    vendor_risk = 1.0 if vendor.get("risk_flag_internal") == "Y" else 0.0
    amount_log = np.log1p(amount) if amount > 0 else 0.0

    return {
        "amount": amount,
        "amount_log": amount_log,
        "threshold_evasion": 0.0,
        "self_approval": 0.0,
        "round_dollar": 0.0,
        "vendor_risk": vendor_risk,
        "weekend_payment": weekend,
        "off_hours_entry": 0.0,
    }


def gl_to_features(gl: dict) -> dict[str, float]:
    """Extract features from a GL entry."""
    debit = _parse_num(gl.get("debit_amount"))
    credit = _parse_num(gl.get("credit_amount"))
    amount = debit or credit
    date_str = _parse_date(gl.get("posting_date"))

    off_hours = 0.0
    if date_str:
        try:
            from datetime import datetime
            dt = datetime.fromisoformat(date_str.replace("Z", "+00:00")) if "T" in date_str else datetime.strptime(date_str[:10], "%Y-%m-%d")
            hour = dt.hour if hasattr(dt, "hour") else 12
            off_hours = 1.0 if (hour < 6 or hour > 22) else 0.0
        except (ValueError, TypeError):
            pass

    amount_log = np.log1p(amount) if amount > 0 else 0.0

    return {
        "amount": amount,
        "amount_log": amount_log,
        "threshold_evasion": 0.0,
        "self_approval": 0.0,
        "round_dollar": 0.0,
        "vendor_risk": 0.0,
        "weekend_payment": 0.0,
        "off_hours_entry": off_hours,
    }


def transaction_to_text(record: dict, record_type: str, vendor_lookup: dict) -> str:
    """
    Convert a transaction to natural language for Hugging Face zero-shot or text models.
    """
    if record_type == "invoice":
        amount = _parse_num(record.get("amount"))
        vendor_id = str(record.get("vendor_id", record.get("vendor_Id", "")))
        vendor = vendor_lookup.get(vendor_id, {})
        vname = vendor.get("vendor_name", vendor_id)
        created = str(record.get("created_by_user_id", ""))
        approved = str(record.get("approved_by_user_id", ""))
        desc = str(record.get("description", ""))
        same_user = "same user" if (created and approved and created == approved) else "different users"
        return (
            f"Invoice of ${amount:,.2f} from vendor {vname}, "
            f"created by {created} and approved by {approved} ({same_user}). "
            f"Description: {desc or 'N/A'}"
        )
    if record_type == "payment":
        amount = _parse_num(record.get("amount"))
        date_str = _parse_date(record.get("payment_date"))
        method = str(record.get("payment_method", "Unknown"))
        return f"Payment of ${amount:,.2f} on {date_str} via {method}"
    if record_type == "gl":
        amount = _parse_num(record.get("debit_amount")) or _parse_num(record.get("credit_amount"))
        date_str = _parse_date(record.get("posting_date"))
        user = str(record.get("created_by_user_id", "Unknown"))
        return f"GL journal entry of ${amount:,.2f} posted on {date_str} by {user}"
    return str(record)


# Unified feature columns for tabular model (all record types)
FEATURE_COLS = [
    "amount_log",
    "threshold_evasion",
    "self_approval",
    "round_dollar",
    "vendor_risk",
    "weekend_payment",
    "off_hours_entry",
]


def feature_dict_to_vector(feats: dict) -> list[float]:
    """Convert feature dict to ordered vector for model input."""
    return [float(feats.get(c, 0)) for c in FEATURE_COLS]


def build_training_dataset(
    vendors: list[dict],
    invoices: list[dict],
    payments: list[dict],
    gl_entries: list[dict],
    rule_based_labels: bool = True,
) -> tuple[list[dict], list[int]]:
    """
    Build a dataset for training. If rule_based_labels=True, uses rule-based flags as weak labels.
    Returns (list of feature dicts, list of labels 0/1).
    """
    vendor_lookup = {str(v.get("vendor_id", v.get("vendor_Id", ""))): v for v in vendors}

    samples = []
    labels = []

    for inv in invoices:
        feats = invoice_to_features(inv, vendor_lookup)
        for c in FEATURE_COLS:
            if c not in feats:
                feats[c] = 0.0
        if rule_based_labels:
            # Weak label: suspicious if any red flag
            label = 1 if (
                feats["threshold_evasion"] or feats["self_approval"] or
                (feats["round_dollar"] and feats["vendor_risk"])
            ) else 0
        else:
            label = int(inv.get("label", inv.get("is_fraud", 0)))
        samples.append(feats)
        labels.append(label)

    for p in payments:
        feats = payment_to_features(p, vendor_lookup)
        for c in FEATURE_COLS:
            if c not in feats:
                feats[c] = 0.0
        if rule_based_labels:
            label = 1 if (feats["weekend_payment"] or feats["vendor_risk"]) else 0
        else:
            label = int(p.get("label", p.get("is_fraud", 0)))
        samples.append(feats)
        labels.append(label)

    for gl in gl_entries:
        feats = gl_to_features(gl)
        for c in FEATURE_COLS:
            if c not in feats:
                feats[c] = 0.0
        if rule_based_labels:
            label = 1 if feats["off_hours_entry"] else 0
        else:
            label = int(gl.get("label", gl.get("is_fraud", 0)))
        samples.append(feats)
        labels.append(label)

    return samples, labels

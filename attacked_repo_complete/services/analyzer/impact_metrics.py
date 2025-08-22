import re
from .utils import norm01, to_0_5

RISK_PHRASES = [r"\bunder investigation\b", r"\bno comment\b", r"\bclassified\b"]

def detect_media_risks(text: str):
    t = text.lower()
    tags = []
    for pat in RISK_PHRASES:
        if re.search(pat, t): tags.append("media_sensitive")
    if re.search(r"\bquote\b", t): tags.append("risky_quote")
    return list(set(tags))

def score_impact(text: str, content: dict, delivery: dict) -> dict:
    trust = to_0_5(0.5*content["clarity"] / 5.0 + 0.5*delivery["tone"] / 5.0)
    media = to_0_5(1.0 - 0.5*len(detect_media_risks(text)))
    next_steps = 1.0 if re.search(r"\b(we will|by \w+day|on \d{4}-\d{2}-\d{2}|tomorrow|next week)\b", text, re.I) else 0.0
    future = to_0_5(0.6*next_steps + 0.4*(1 - (1 if "tbd" in text.lower() else 0)))
    return {"trust_proj": round(trust, 2), "media_sensitivity": round(media, 2), "future_proof": round(future, 2)}

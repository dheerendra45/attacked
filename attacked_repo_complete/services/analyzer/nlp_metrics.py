import re, statistics
from .utils import BUZZWORDS, HEDGES, WEASEL, RISKY_QUOTES, norm01, to_0_5, syllables

SENT_SPLIT = re.compile(r"(?<=[.!?]) +")
WORD_RE = re.compile(r"\b[\w'-]+\b")

def jargon_ratio(words: list[str]) -> float:
    total = len(words) or 1
    buzz = sum(1 for w in words if w.lower() in BUZZWORDS)
    return buzz / total

def fkgl(text: str) -> float:
    # Flesch-Kincaid Grade (approx)
    sents = [s for s in SENT_SPLIT.split(text) if s.strip()]
    words = WORD_RE.findall(text)
    syls = sum(syllables(w) for w in words) or 1
    L = (len(words) / max(1, len(sents)))
    S = (syls / max(1, len(words)))
    # scale to 0..1 by clipping reasonable grades 5..16
    grade = 0.39*L + 11.8*S - 15.59
    return norm01(16 - max(5.0, min(16.0, grade)), 0, 11)

def hedge_ratio(words: list[str]) -> float:
    total = len(words) or 1
    hed = sum(1 for w in words if w.lower() in HEDGES)
    return hed / total

def detect_risks(text: str) -> list[str]:
    tags = []
    t = text.lower()
    if any(p in t for p in ("blame vendor","vendor fault","third party")):
        tags.append("vendor_blame")
    if any(w in t for w in ("weasel words","sort of","kind of")):
        tags.append("weasel_words")
    if any(q in t for q in (q for q in RISKY_QUOTES)):
        tags.append("risky_quote")
    return list(set(tags))

def score_content(text: str) -> dict:
    words = WORD_RE.findall(text)
    jr = jargon_ratio(words)
    hr = hedge_ratio(words)
    # Clarity: inverse of hedging + readability
    clarity = to_0_5(0.7*(1-hr) + 0.3*fkgl(text))
    # Transparency: fewer weasel terms + presence of acknowledgments
    ack = 1.0 if re.search(r"\b(i|we) (take|accept) (full )?responsibility\b", text, re.I) else 0.0
    weasel = 1.0 if any(w in text.lower() for w in WEASEL) else 0.0
    transparency = to_0_5(0.7*(1-weasel) + 0.3*ack)
    # Consistency: penalize contradictions (naive negation flip detection within slice)
    contradictions = len(re.findall(r"\b(is|are|will) not\b", text, re.I))
    consistency = to_0_5(1.0 - norm01(contradictions, 0, 3))
    # Accountability: reward responsibility statements, penalize vendor-blame
    blame_vendor = 1 if re.search(r"vendor|third[- ]party", text, re.I) else 0
    accountability = to_0_5(0.6*ack + 0.4*(1 - blame_vendor))
    return {
        "clarity": round(clarity, 2),
        "transparency": round(transparency, 2),
        "consistency": round(consistency, 2),
        "accountability": round(accountability, 2),
        "jargon_ratio": round(jr, 3),
    }

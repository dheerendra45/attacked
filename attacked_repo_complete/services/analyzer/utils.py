import random, numpy as np

BUZZWORDS = {
    "synergy","leverage","paradigm","ecosystem","best-in-class","stakeholder",
    "world-class","cutting-edge","vision","strategic","innovative","robust",
}
HEDGES = {"maybe","perhaps","we believe","we think","likely","possibly","appears","suggests"}
WEASEL = {"some","many","various","a number of","sort of","kind of","sophisticated attack"}
RISKY_QUOTES = {"no comment","under investigation","classified","we can’t disclose"}

_DEF_MIN=0.0; _DEF_MAX=5.0

def set_all_seeds(seed: int = 42):
    random.seed(seed); np.random.seed(seed)

def norm01(x, lo, hi):
    if hi == lo: return 0.0
    return max(0.0, min(1.0, (x - lo) / (hi - lo)))

def to_0_5(x):
    return float(max(_DEF_MIN, min(_DEF_MAX, 5.0 * x)))

def syllables(word: str) -> int:
    vowels = "aeiouy"; w=word.lower().strip()
    if not w: return 0
    count = 0; prev=False
    for ch in w:
        isv = ch in vowels
        if isv and not prev: count += 1
        prev = isv
    if w.endswith('e') and count>1: count -= 1
    return max(1, count)

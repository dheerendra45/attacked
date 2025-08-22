from services.analyzer.nlp_metrics import jargon_ratio

def test_jargon_ratio_basic():
    words = "We leverage our strategic synergy".split()
    r = jargon_ratio(words)
    assert 0 < r <= 1

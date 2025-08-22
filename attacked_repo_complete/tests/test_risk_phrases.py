from services.analyzer.impact_metrics import detect_media_risks

def test_detect_media_risks():
    t = "This is under investigation and no comment at this time."
    tags = detect_media_risks(t)
    assert "media_sensitive" in tags

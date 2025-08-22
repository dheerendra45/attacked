import numpy as np

CONTENT_W=0.4; DELIVERY_W=0.3; IMPACT_W=0.3

def _layer_avg(results, layer):
    vals = []
    for r in results:
        m = r["metrics"][layer]
        # average sub-metrics
        sub = [v for k,v in m.items() if isinstance(v,(int,float))]
        vals.append(float(np.mean(sub)))
    return float(np.mean(vals)) if vals else 0.0, float(np.std(vals)) if vals else 0.0

def aggregate_briefing(results, slice_len_s: int):
    # Compute layer averages
    content_avg, content_std = _layer_avg(results, "content")
    delivery_avg, delivery_std = _layer_avg(results, "delivery")
    impact_avg, impact_std = _layer_avg(results, "impact")
    composite = CONTENT_W*content_avg + DELIVERY_W*delivery_avg + IMPACT_W*impact_avg

    # Duration & highlights
    duration_s = results[-1]["t_end"] if results else 0
    # naive top-3 risky windows by count of risk tags
    ranked = sorted(results, key=lambda r: len(r["risk_tags"]), reverse=True)[:3]
    highlights = [{
        "t_start": r["t_start"], "t_end": r["t_end"],
        "risk_tags": r["risk_tags"],
        "note": ", ".join(r["risk_tags"]) or ""
    } for r in ranked]

    return {
        "duration_s": duration_s,
        "scores": {
            "content": round(content_avg,2),
            "delivery": round(delivery_avg,2),
            "impact": round(impact_avg,2),
            "composite": round(composite,2),
        },
        "highlights": highlights,
        "volatility": {
            "content": round(content_std,2),
            "delivery": round(delivery_std,2),
            "impact": round(impact_std,2),
        },
    }

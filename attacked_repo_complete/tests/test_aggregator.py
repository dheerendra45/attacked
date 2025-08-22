from services.analyzer.aggregation import aggregate_briefing

def test_aggregate_shape():
    sample = [{
        "t_start":0,"t_end":45,
        "metrics":{
            "content":{"clarity":3,"transparency":3,"consistency":3,"accountability":3},
            "delivery":{"tone":3,"nonverbal":3,"language_precision":3},
            "impact":{"trust_proj":3,"media_sensitivity":3,"future_proof":3}
        },
        "risk_tags":[],
    }]
    out = aggregate_briefing(sample, 45)
    assert set(out["scores"]).issuperset({"content","delivery","impact","composite"})

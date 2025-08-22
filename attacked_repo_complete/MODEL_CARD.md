# Model Card — Briefing Failure Index (BFI) Pipeline

## Overview
This pipeline scores leadership briefings along three weighted layers: **Content (40%)**, **Delivery (30%)**, and **Impact (30%)**. Scores are computed on 30–60s slices and aggregated.

## Intended Use & Users
- Internal evaluation of briefing quality and risk patterns
- Research & experimentation on briefing analytics
- **Not** for medical, legal, or employment decisions

## Data & Components
- ASR: Vosk (offline small EN model) by default
- Audio features: librosa/pyworld
- Visual proxy: OpenCV motion/face-optional (MediaPipe/OpenFace pluggable)
- NLP: lexicons + simple rules; optional NLI placeholder

## Ethical Considerations
- **Bias**: language/regional accents can reduce ASR accuracy → metrics drift
- **Context**: sarcasm/irony/humor often mis-scored by simple heuristics
- **Nonverbal**: camera angle/lighting affects visual cues; default vision is conservative

## Safety & Privacy
- Retention configurable (default 14 days). Media purge option.
- Redacts tokens and sensitive URLs in logs.
- Do **not** deploy for surveillance or classification of protected classes.

## Limitations
- Heuristic-first metrics → approximate; treat as directional signals
- Offline prosody & nonverbal cues are simplified; expect noise

## Calibration & Determinism
- All random components seeded (`SEED=42`) with fixed feature scaling
- Golden outputs included for a sample clip; CI can compare deltas

## Evaluation
- Regression tests verify metric functions & aggregation stability
- Acceptance scenarios covered in README

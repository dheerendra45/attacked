import numpy as np, librosa
from .utils import norm01, to_0_5
import cv2, os

def _energy_rate(y, sr):
    rms = librosa.feature.rms(y=y).mean()
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    return rms, tempo

def score_delivery(wav_path: str, transcript: str) -> dict:
    y, sr = librosa.load(wav_path, sr=16000)
    rms, tempo = _energy_rate(y, sr)
    # Words/sec as speaking rate proxy
    wps = (len(transcript.split()) / max(1e-9, (len(y)/sr)))
    # Tone index: combine energy + speaking rate within reasonable bands
    tone = to_0_5(0.5*norm01(rms, 0.005, 0.05) + 0.5*norm01(wps, 1.5, 4.0))
    # Language precision: penalize very high/low variance in sentence length
    sents = [s.strip() for s in transcript.replace('?', '.').split('.') if s.strip()]
    lens = [len(s.split()) for s in sents] or [len(transcript.split())]
    var = np.var(lens)
    lang_prec = to_0_5(1.0 - norm01(var, 0, 50))
    return {"tone": round(tone, 2), "nonverbal": 2.5, "language_precision": round(lang_prec, 2)}

def estimate_nonverbal(video_path: str) -> dict:
    # Minimal placeholder using motion magnitude as stability proxy
    if not os.path.exists(video_path):
        return {"motion": 0.0}
    cap = cv2.VideoCapture(video_path)
    ret, prev = cap.read()
    if not ret:
        return {"motion": 0.0}
    prev = cv2.cvtColor(prev, cv2.COLOR_BGR2GRAY)
    motion = []
    while True:
        ret, frame = cap.read()
        if not ret: break
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        diff = cv2.absdiff(gray, prev)
        motion.append(float(diff.mean()))
        prev = gray
    cap.release()
    m = np.mean(motion) if motion else 0.0
    return {"motion": round(float(m), 4)}

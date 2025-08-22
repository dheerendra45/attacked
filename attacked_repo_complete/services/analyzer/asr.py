from vosk import Model, KaldiRecognizer
import json, wave, os

_model = None

def _load_model():
    global _model
    if _model is None:
        model_path = os.environ.get("VOSK_MODEL_PATH", "/app/sample_data/models/vosk")
        if not os.path.isdir(model_path):
            raise RuntimeError("Vosk model not found. Run scripts/download_models.sh or set VOSK_MODEL_PATH.")
        _model = Model(model_path)
    return _model

def transcribe(wav_path: str):
    model = _load_model()
    wf = wave.open(wav_path, "rb")
    rec = KaldiRecognizer(model, wf.getframerate())
    rec.SetWords(True)
    text_words = []
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            res = json.loads(rec.Result())
            text_words.extend(res.get("result", []))
    final = json.loads(rec.FinalResult())
    text_words.extend(final.get("result", []))
    transcript = " ".join([w.get("word","") for w in text_words])
    return transcript.strip(), text_words

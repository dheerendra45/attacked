# Vendor Plugins

Optional integrations. Enable by setting keys in `.env` and toggles in `configs/default.yml`.

## Hume AI (Prosody)
- Set `HUME_API_KEY="..."` and `USE_VENDOR_PROSODY=true`
- The worker will call Hume for prosody scores; mapping → Delivery.tone via linear scaling

## Deepgram or AssemblyAI (ASR)
- Set `DEEPGRAM_API_KEY` or `ASSEMBLYAI_API_KEY` and `USE_VENDOR_ASR=true`
- The ASR module will prefer vendor API, else fall back to Vosk

## MediaPipe/OpenFace (Nonverbal)
- Install the library in the image or mount it; set `USE_VISION_AU=true`
- The delivery module will compute AU/gaze features; else returns a conservative index

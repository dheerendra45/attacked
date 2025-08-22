import os, subprocess, math
from typing import List, Dict

SLICE_LEN_DEFAULT=45

def ff(cmd: list[str]):
    subprocess.run(cmd, check=True)

def slice_video(video_path: str, slice_len: int = SLICE_LEN_DEFAULT) -> List[Dict]:
    # Probe duration
    probe = subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=noprint_wrappers=1:nokey=1", video_path], capture_output=True, text=True, check=True)
    duration = float(probe.stdout.strip())
    out = []
    t=0.0; i=0
    while t < duration:
        end = min(duration, t + slice_len)
        tmp_vid = f"/tmp/attacked/sl_{i:02d}.mp4"
        ff(["ffmpeg","-y","-ss", str(t), "-to", str(end), "-i", video_path, "-c","copy", tmp_vid])
        out.append({"idx": i, "t_start": int(t), "t_end": int(end), "video_path": tmp_vid})
        i+=1; t=end
    return out

def prepare_slice(slice_obj: Dict):
    vid = slice_obj["video_path"]
    base = os.path.splitext(os.path.basename(vid))[0]
    wav = f"/tmp/attacked/{base}.wav"
    ff(["ffmpeg","-y","-i", vid, "-ac", "1", "-ar", "16000", wav])
    # Thumbnails (first frame)
    thumb = f"/tmp/attacked/{base}_000.jpg"
    ff(["ffmpeg","-y","-i", vid, "-frames:v","1", thumb])
    return wav, [thumb]

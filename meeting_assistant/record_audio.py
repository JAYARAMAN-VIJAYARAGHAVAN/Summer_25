import subprocess
import os

def record_audio(filename="meeting_audio.wav", duration_sec=300):
    save_path = "/Users/vijay/Documents/Summer_25/meeting_assistant/audio"
    os.makedirs(save_path, exist_ok=True)

    full_path = os.path.join(save_path, filename)

    subprocess.run([
        "ffmpeg",
        "-f", "avfoundation",
        "-i", ":1",  # BlackHole 2ch index
        "-t", str(duration_sec),
        "-ac", "1",
        "-ar", "16000",
        full_path
    ])

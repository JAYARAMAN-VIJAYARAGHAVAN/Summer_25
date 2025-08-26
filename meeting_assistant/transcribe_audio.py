import subprocess
import os
import threading

def convert_to_wav(audio_path):
    if audio_path.lower().endswith('.mp4'):
        wav_dir = os.path.dirname(audio_path)
        wav_name = os.path.splitext(os.path.basename(audio_path))[0] + '.wav'
        wav_path = os.path.join(wav_dir, wav_name)
        cmd = [
            'ffmpeg', '-y',
            '-i', audio_path,
            '-ar', '16000',
            '-ac', '1',
            wav_path
        ]
        print(f"Converting {audio_path} to {wav_path} ...")
        subprocess.run(cmd, check=True)
        return wav_path
    return audio_path

def transcribe_with_whisper_cpp(audio_path, output_path):
    executable = "whisper-cpp"
    model_file = "ggml-base.en.bin"
    audio_path = convert_to_wav(audio_path)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    cmd = [
        executable,
        "-m", model_file,
        "-f", audio_path,
        "-otxt",
        "-of", output_path
    ]
    print(f"Transcribing {audio_path} ...")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        print(f"Transcript saved to: {output_path}")
    else:
        print("Error during transcription:", result.stderr)

def run_parallel_transcriptions(jobs):
    threads = []
    for audio_path, output_path in jobs:
        t = threading.Thread(target=transcribe_with_whisper_cpp, args=(audio_path, output_path))
        t.start()
        threads.append(t)
    for t in threads:
        t.join()

if __name__ == "__main__":
    # Example usage: transcribe two files in parallel using small.en model
    jobs = [
        ("audio/1hr.mp4", "transcripts/1hr_multicpp_base.txt"),
        ("audio/60min.mp4", "transcripts/60min_multicpp_basetxt"),
        ("audio/1hr_V2.mp4", "transcripts/1hr_V2_multicpp_base.txt"),
        ("audio/1hr_V3.mp4", "transcripts/1hr_V3_multicpp_base.txt"),
        ("audio/1hr_V4.mp4", "transcripts/1hr_V4_multicpp_base.txt")
    ]
    run_parallel_transcriptions(jobs)

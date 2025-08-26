import subprocess
import os

def convert_to_wav(audio_path):
    """
    Converts an MP4 file to 16kHz mono WAV if needed.
    Returns the path to the WAV file (original if already WAV).
    """
    if audio_path.lower().endswith('.mp4'):
        wav_dir = os.path.dirname(audio_path)
        wav_name = os.path.splitext(os.path.basename(audio_path))[0] + '.wav'
        wav_path = os.path.join(wav_dir, wav_name)
        cmd = [
            'ffmpeg', '-y',  # Overwrite if exists
            '-i', audio_path,
            '-ar', '16000',  # 16kHz sample rate
            '-ac', '1',      # Mono channel
            wav_path
        ]
        print(f"Converting {audio_path} to {wav_path} ...")
        subprocess.run(cmd, check=True)
        return wav_path
    return audio_path

def transcribe_with_whisper_cpp(audio_path, output_path):
    """
    Runs whisper-cpp on the given audio file and saves the transcript.
    """
    executable = "whisper-cpp"  # Homebrew-installed binary is in PATH
    model_file = "ggml-base.en.bin"  # Ensure this file is in the project root
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

if __name__ == "__main__":
    audio_file = "audio/1hr.mp4"  # Place your audio file in meeting_assistant/audio/
    transcript_file = "transcripts/1hr_base_v2.txt"  # Output will go in meeting_assistant/transcripts/
    transcribe_with_whisper_cpp(audio_file, transcript_file)
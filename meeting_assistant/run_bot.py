import threading
import asyncio
from record_audio import record_audio
from join_meeting_bot import join_jitsi

print("📞 Joining meeting and recording...")

t1 = threading.Thread(target=record_audio)
t2 = threading.Thread(target=lambda: asyncio.run(join_jitsi()))

t1.start()
t2.start()

t1.join()
t2.join()

print("✅ Done. Check 'meeting_audio.wav' file.")

import asyncio
from pyppeteer import launch

MEETING_NAME = input("Enter the Jitsi Room Name (e.g., testroom): ")
JITSI_URL = f"https://your-vm-domain.com/{MEETING_NAME}#config.prejoinPageEnabled=false"

async def join_jitsi():
    browser = await launch(headless=False, args=['--use-fake-ui-for-media-stream'])
    page = await browser.newPage()
    await page.goto(JITSI_URL)
    await asyncio.sleep(3)
    await page.evaluate("""() => {
        const input = document.querySelector('input[name="displayName"]');
        if (input) input.value = 'MeetingBot';
        const btn = document.querySelector('button[type="submit"]');
        if (btn) btn.click();
    }""")
    print("✅ Joined meeting.")
    await asyncio.sleep(300)  # Stay for 5 min

asyncio.get_event_loop().run_until_complete(join_jitsi())

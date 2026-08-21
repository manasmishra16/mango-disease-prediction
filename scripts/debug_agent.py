import os
from pathlib import Path
from dotenv import load_dotenv

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=True)

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.agent import mango_agent

print("Checking mango_agent directly:")
res = mango_agent.chat("What is the capital of France?", topic="all")
print("Response Source:", res.get("source"))
print("Model Used:", res.get("modelUsed"))
print("Response text length:", len(res.get("response", "")))
print("Response preview:", res.get("response", "")[:100])

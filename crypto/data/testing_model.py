#!/usr/bin/env python3
"""
Compare **three** checkpoints on the same prompt:
  • V6  — direction‑only fine‑tune (flan‑t5)
  • V7  — direction **+ % change** fine‑tune
  • BASE — original *google/flan‑t5‑base*

For each model the script prints:
  • Generated output
  • Input/output token counts, compression ratio, inference time
  • A tiny weight fingerprint (sum/mean/std) so you can verify the
    fine‑tunes actually diverge from the base.

Adjust the paths below if your folder structure differs.
"""

from pathlib import Path
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch, os, time, sys

# ─── utility helpers ───────────────────────────────────────

def list_files(folder: Path):
    print(f"Contents of {folder}:")
    for root, _, files in os.walk(folder):
        level = root.replace(str(folder), '').count(os.sep)
        indent = ' ' * 4 * level
        print(f"{indent}{os.path.basename(root)}/")
        subindent = ' ' * 4 * (level + 1)
        for f in files:
            print(f"{subindent}{f}")


def weight_stats(model):
    weights = torch.cat([p.detach().flatten() for p in model.parameters()])
    return {
        'sum':  float(weights.sum()),
        'mean': float(weights.mean()),
        'std':  float(weights.std()),
    }


def load_and_generate(model_id, prompt, *, local=True, max_new_tokens=4):
    """Return dict with generation + stats for `model_id`.
    `model_id` can be a HF hub id or a local path.
    If `local` is False, we allow remote download (needed for base model)."""
    try:
        tok = AutoTokenizer.from_pretrained(model_id, local_files_only=local)
        mdl = AutoModelForSeq2SeqLM.from_pretrained(model_id, local_files_only=local)

        t0 = time.time()
        enc = tok(prompt, return_tensors="pt", truncation=True, max_length=512)
        with torch.no_grad():
            out = mdl.generate(**enc, max_new_tokens=max_new_tokens)
        t1 = time.time()

        decoded = tok.decode(out[0], skip_special_tokens=True)
        ilen, olen = len(tok.tokenize(prompt)), len(tok.tokenize(decoded))

        return {
            'summary': decoded,
            'input_len': ilen,
            'output_len': olen,
            'compression_ratio': olen / ilen if ilen else 0.0,
            'inference_time': t1 - t0,
            'model': mdl,
        }
    except Exception as e:
        print(f"⚠️  Error loading/generating with {model_id}: {e}")
        if local:
            list_files(Path(model_id))
        sys.exit(1)

# ─── paths / IDs ───────────────────────────────────────────
V6_PATH   = Path("/Users/vijay/Documents/Summer_25/Crypto/data/flan_t5_finetuned_crypto_model_predictive_v6/final_modelV6").absolute()
V7_PATH   = Path("/Users/vijay/Documents/Summer_25/Crypto/data/flan_t5_finetuned_crypto_model_predictive_v7/final_model_pct").absolute()
BASE_ID   = "google/flan-t5-base"  # HF hub id

TEST_PROMPT = (
    "Closing Price: 30245.50. 7-Day SMA: 29800.75. RSI_14: 58.20. "
    "Volume Δ%: 12.30. Rolling Std 7: 2650.12. Daily Δ%: 3.50%. "
    "VIX Close: 14.22. DXY Close: 104.32. NDX Close: 15620.5. "
    "News sentiment: +0.41. Headlines: Bitcoin price surged significantly after new regulations…"
)

# ─── run generation for each model ─────────────────────────
print("\n=== V6 ===")
res_v6 = load_and_generate(V6_PATH, TEST_PROMPT, local=True)
print(res_v6['summary'])

print("\n=== V7 ===")
res_v7 = load_and_generate(V7_PATH, TEST_PROMPT, local=True)
print(res_v7['summary'])

print("\n=== BASE ===")
res_base = load_and_generate(BASE_ID, TEST_PROMPT, local=False)
print(res_base['summary'])

# ─── token & speed stats ──────────────────────────────────
print("\n=== Summary Statistics ===")
for lbl, r in (("BASE", res_base), ("V6", res_v6), ("V7", res_v7)):
    print(f"{lbl}: input={r['input_len']} tok, output={r['output_len']} tok, "
          f"ratio={r['compression_ratio']:.3f}, time={r['inference_time']:.3f}s")

# ─── weight fingerprints ──────────────────────────────────
print("\n=== Model Weight Fingerprints ===")
base_stats = weight_stats(res_base['model'])
v6_stats   = weight_stats(res_v6['model'])
v7_stats   = weight_stats(res_v7['model'])

print("BASE:", base_stats)
print("V6 :", v6_stats)
print("V7 :", v7_stats)

if base_stats != v6_stats:
    print("✅ V6 differs from base as expected.")
else:
    print("⚠️  V6 weights identical to base!")

if base_stats != v7_stats:
    print("✅ V7 differs from base as expected.")
else:
    print("⚠️  V7 weights identical to base!")

if v6_stats != v7_stats:
    print("✅ V6 and V7 differ from each other (good).")
else:
    print("⚠️  V6 and V7 weights identical — investigate training.")

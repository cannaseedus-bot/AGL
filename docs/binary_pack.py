import json
import numpy as np
from pathlib import Path

# ---- CONFIG ----
VOCAB_SIZE = 65536          # uint16
DTYPE = np.uint16
ATOM_SIZE = 256             # tokens per atom
OUT_FILE = "matrix_atoms.bin"


# ---- PLACEHOLDERS (plug your real ones in) ----
def load_and_clean(path: Path) -> str:
    text = path.read_text(encoding="utf-8", errors="ignore")

    if path.suffix == ".json":
        try:
            obj = json.loads(text)
            text = json.dumps(obj, separators=(",", ":"))
        except json.JSONDecodeError:
            pass

    # minimal HTML stripping (replace later if needed)
    text = text.replace("<", " ").replace(">", " ")
    return text


def pi_tokenize(text: str):
    # TEMP: replace with π tokenizer / symbol mapper
    return [ord(c) % VOCAB_SIZE for c in text]


# ---- PACKER ----
def pack_directory(input_dir: str, out_file: str):
    tokens = []

    for path in Path(input_dir).rglob("*"):
        if path.suffix.lower() in (".txt", ".md", ".html", ".json"):
            text = load_and_clean(path)
            tokens.extend(pi_tokenize(text))

    # Pad to atom boundary
    pad = (-len(tokens)) % ATOM_SIZE
    if pad:
        tokens.extend([0] * pad)

    arr = np.array(tokens, dtype=DTYPE)
    arr.tofile(out_file)

    print(f"[OK] Packed {len(arr)} tokens")
    print(f"[OK] Atoms: {len(arr) // ATOM_SIZE}")
    print(f"[OK] Output: {out_file}")


if __name__ == "__main__":
    pack_directory("datasets", OUT_FILE)

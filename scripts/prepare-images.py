"""One-time: move originals to assets/originals/ (git-ignored backup) and write web-sized copies
(max 2560px long edge) to src/assets/photos/<category>/. Updates `file` paths in assets/images.json.
Safe to re-run: skips files already processed."""
import json, shutil, sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC, ORIG, OUT = ROOT / "assets/images", ROOT / "assets/originals", ROOT / "src/assets/photos"
MAX = 2560
manifest_path = ROOT / "assets/images.json"
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

done = 0
for entry in manifest:
    rel = Path(entry["file"])                      # assets/images/<cat>/<name> or already src/assets/photos/...
    if rel.parts[:3] == ("src", "assets", "photos"):
        continue
    sub = Path(*rel.parts[2:])                      # <cat>/<name> (or logo.png)
    src, orig, out = SRC / sub, ORIG / sub, OUT / sub
    if not orig.exists():
        orig.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(src), str(orig))
    out.parent.mkdir(parents=True, exist_ok=True)
    im = Image.open(orig)
    im.thumbnail((MAX, MAX), Image.LANCZOS)
    if out.suffix.lower() in (".jpg", ".jpeg"):
        im.convert("RGB").save(out, quality=85, optimize=True, progressive=True)
    else:
        im.save(out, optimize=True)
    entry["file"] = out.relative_to(ROOT).as_posix()
    done += 1

manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
# remove now-empty source folders
for d in sorted(SRC.glob("**/*"), reverse=True):
    if d.is_dir() and not any(d.iterdir()):
        d.rmdir()
print(f"processed {done}")

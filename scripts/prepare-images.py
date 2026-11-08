"""One-time: move originals to assets/originals/ (git-ignored backup) and write web-sized copies
(max 2560px long edge) to src/assets/photos/<category>/. Updates `file` paths in assets/images.json.
Safe to re-run: skips files already processed. `--fix-rotation` re-renders copies whose originals
have an EXIF rotation."""
import json, shutil, sys
from pathlib import Path
from PIL import Image, ImageOps

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
    im = ImageOps.exif_transpose(Image.open(orig))  # camera photos carry their rotation in EXIF
    im.thumbnail((MAX, MAX), Image.LANCZOS)
    if out.suffix.lower() in (".jpg", ".jpeg"):
        im.convert("RGB").save(out, quality=85, optimize=True, progressive=True)
    else:
        im.save(out, optimize=True)
    entry["file"] = out.relative_to(ROOT).as_posix()
    done += 1

if "--fix-rotation" in sys.argv:
    for orig in ORIG.rglob("*"):
        if not orig.is_file(): continue
        try: im = Image.open(orig)
        except Exception: continue
        if im.getexif().get(0x0112, 1) in (1, None): continue
        out = OUT / orig.relative_to(ORIG)
        if not out.exists(): continue
        im = ImageOps.exif_transpose(im); im.thumbnail((MAX, MAX), Image.LANCZOS)
        if out.suffix.lower() in (".jpg", ".jpeg"): im.convert("RGB").save(out, quality=85, optimize=True, progressive=True)
        else: im.save(out, optimize=True)
        print("rotated", out.relative_to(ROOT)); done += 1

manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
# remove now-empty source folders
for d in sorted(SRC.glob("**/*"), reverse=True):
    if d.is_dir() and not any(d.iterdir()):
        d.rmdir()
print(f"processed {done}")

"""Fill empty `project` fields in assets/images.json from filename rules, mark exact duplicate files
(same image on several old pages) as use:"skip", and add missing entries to src/data/projects.json.
Never overwrites a value that is already set. Safe to re-run."""
import hashlib, json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "assets/images.json"
DETAILS = ROOT / "src/data/projects.json"
PROJECT_PAGES = ["towers", "commercial", "offices", "villas", "synagogues", "urban-renewal"]

# (substring in original filename, project name, category, urbanRenewal, city)
RULES = [
    ("lagoon", "לגונה", "commercial", False, "נתניה"),
    ("marina-408", "מרינה 408", "commercial", False, None),
    ("טיטניום בוטיק", "טיטניום בוטיק", "offices", False, None),
    ("פריים סנטר", "פריים סנטר פתח תקווה", "offices", False, "פתח תקווה"),
    ("הרצל 17", "הרצל 17", "offices", False, None),
    ("עיר ימים", "בית כנסת עיר ימים", "synagogues", False, "נתניה"),
    ("בית כנסת נתניה", "בית כנסת נתניה", "synagogues", False, "נתניה"),
    ("גד מכנס", "גד מכנס", "towers", True, None),
    ("הרי גרינטל", "הרי גרינטל 4", "towers", False, None),
    ("segal", "וילת סגל", "villas", False, None),
    ("נט 600", "נט 600", "villas", False, None),
    ("מנשרוב", "וילת מנשרוב", "villas", False, None),
    ("פרוייקט יהלום", "פרויקט יהלום", "commercial", False, None),
    ("מלון", "מלון", "commercial", False, None),
    ("שד ירושלים", "שדרות ירושלים", "towers", True, None),
    ("סמילנסקי", "סמילנסקי – בן יהודה", "towers", True, None),
    ("osishiskin", "אוסישקין", "towers", True, "נתניה"),
    ("dankner", "דנקנר 9", "towers", True, None),
]
# urban-renewal page images had no filenames in the first scrape; names recovered from the page's alt text
URBAN_NAMES = {
    "a163c876": "גד מכנס 5.jpg", "cdceca8e": "שד ירושלים_edited_edited.jpg", "4e419b15": "פפפפפפפפפפפפפפפפפפפפפפ.png",
    "cb58e9f8": "סמילנסקי בן יהודה.jpg", "82755830": "osishiskin.png", "349c6696": "dankner 9.jpg", "c28169a7": "map_edited.png",
}

manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
details = json.loads(DETAILS.read_text(encoding="utf-8")) if DETAILS.exists() else {}

for e in manifest:
    short = e["wix_id"][7:15]
    if short in URBAN_NAMES and e["original_name"].startswith("19b9e7_"):
        e["original_name"] = URBAN_NAMES[short]
    if e["category"] == "urban-renewal" and e["original_name"].startswith("map") and not e["use"]:
        e["use"] = "skip"

# exact duplicates: keep the first by page order, skip the rest
order = {c: i for i, c in enumerate(PROJECT_PAGES)}
seen = {}
for e in sorted((e for e in manifest if e["category"] in order), key=lambda e: order[e["category"]]):
    h = hashlib.sha1((ROOT / e["file"]).read_bytes()).hexdigest()
    if h in seen and not e["use"]:
        e["use"] = "skip"
    seen.setdefault(h, e["file"])

assigned = Counter()
for e in manifest:
    if e["category"] not in order or e["project"] or e["use"] == "skip":
        continue
    name = e["original_name"].lower()
    for key, project, cat, ur, city in RULES:
        if key.lower() in name:
            e["project"] = project
            d = details.setdefault(project, {})
            d.setdefault("category", cat)
            if ur: d.setdefault("urbanRenewal", True)
            if city: d.setdefault("city", city)
            break
    if e["project"]:
        assigned[e["project"]] += 1

MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
DETAILS.parent.mkdir(parents=True, exist_ok=True)
DETAILS.write_text(json.dumps(details, ensure_ascii=False, indent=2), encoding="utf-8")
for p, n in assigned.most_common():
    print(f"{n:3}  {p}")
left = sum(1 for e in manifest if e["category"] in order and not e["project"] and e["use"] != "skip")
skipped = sum(1 for e in manifest if e["use"] == "skip")
print(f"unassigned (go to category placeholder): {left}; skipped duplicates/maps: {skipped}")

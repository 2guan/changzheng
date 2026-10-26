"""Rebuild local web fonts: python -m pip install 'fonttools[woff]' first."""

from pathlib import Path

from fontTools.ttLib import TTFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "assets" / "fonts"
OUTPUT.mkdir(parents=True, exist_ok=True)

for source_name, web_name in (
    ("lxgw-zhenkai.ttf", "lxgw-zhenkai.woff2"),
    ("nanxi-ink-song.ttf", "nanxi-ink-song.woff2"),
):
    source = ROOT / "fonts" / "source" / source_name
    destination = OUTPUT / web_name
    with TTFont(source, recalcTimestamp=False) as font:
        font.flavor = "woff2"
        font.save(destination)
    print(f"{web_name}: {destination.stat().st_size:,} bytes")

"""Extract raster photos embedded in the local student Figma SVG exports."""

from __future__ import annotations

import base64
import io
import re
import sys
from pathlib import Path

from PIL import Image

SELECTED = {"layer-00007", "layer-00137", "layer-00155", "layer-00172", "layer-00195", "layer-00214", "layer-00231", "layer-00248", "layer-00265"}


def main(export_root: Path, output_root: Path) -> None:
    output_root.mkdir(parents=True, exist_ok=True)
    images = []
    for folder in export_root.glob("05-Menu--Etudiant"):
        for svg in (folder / "assets").glob("*.svg"):
            if svg.stem not in SELECTED:
                continue
            source = svg.read_text(encoding="utf-8")
            for index, match in enumerate(re.finditer(r"data:image/(png|jpeg|webp);base64,([^\"']+)", source)):
                data = base64.b64decode(match.group(2))
                image = Image.open(io.BytesIO(data))
                if svg.stem == "layer-00007" and index == 0 and match.group(1) == "png":
                    (output_root.parent / "splash-logo.png").write_bytes(data)
                if image.width < 120 or image.height < 90:
                    continue
                name = f"{folder.name.split('--')[0]}-{svg.stem}-{index}.jpg"
                path = output_root / name
                image.convert("RGB").save(path, quality=84, optimize=True)
                images.append((name, image.size))
    for name, size in images:
        print(name, f"{size[0]}x{size[1]}")


if __name__ == "__main__":
    main(Path(sys.argv[1]), Path(sys.argv[2]))

"""Extract raster photos embedded in the local student Figma SVG exports."""

from __future__ import annotations

import base64
import io
import re
import sys
from pathlib import Path

from PIL import Image

SELECTED = {"layer-00007", "layer-00137", "layer-00155", "layer-00172", "layer-00195", "layer-00214", "layer-00231", "layer-00248", "layer-00265"}
PUBLIC_MENU_LAYERS = (75, 101, 129, 157, 176, 202, 228, 253, 279)


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


def extract_ecosystem_menu(frontend_public: Path, output_root: Path) -> None:
    """Keep mobile menu photos aligned with the local public/admin exports."""
    output_root.mkdir(parents=True, exist_ok=True)
    public_assets = frontend_public / "figma-public" / "19-Menu--Public" / "assets"
    for layer in PUBLIC_MENU_LAYERS:
        source = (public_assets / f"layer-{layer:05d}.svg").read_text(encoding="utf-8")
        photos = []
        for match in re.finditer(r"data:image/(png|jpeg|webp);base64,([^\"']+)", source):
            photo = Image.open(io.BytesIO(base64.b64decode(match.group(2))))
            if photo.width >= 120 and photo.height >= 90:
                photos.append(photo)
        if not photos:
            raise ValueError(f"No menu photo in public layer {layer}")
        photo = max(photos, key=lambda item: item.width * item.height)
        photo.convert("RGB").save(output_root / f"public-menu-{layer:05d}.jpg", quality=84, optimize=True)

    for index in range(8):
        source = frontend_public / "assets" / "figma" / f"menu-photo{index}.png"
        Image.open(source).convert("RGB").save(
            output_root / f"admin-menu-{index}.jpg", quality=84, optimize=True
        )


if __name__ == "__main__":
    if sys.argv[1] == "ecosystem-menu":
        extract_ecosystem_menu(Path(sys.argv[2]), Path(sys.argv[3]))
    else:
        main(Path(sys.argv[1]), Path(sys.argv[2]))

#!/usr/bin/env python3
"""Generate lightweight, local studio HDR environments for AUTO3D.

The application deliberately ships its own Radiance (.hdr) equirectangular
environments so that the experience remains fully offline and licence-clean.
The files are intentionally small (1024 x 512) and are used for reflections
only; the visible backdrop is rendered by the Three.js scene.

Usage: python3 scripts/generate_hdri.py
"""

from pathlib import Path

import numpy as np

WIDTH = 1024
HEIGHT = 512
OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "environments"


def smoothstep(edge0, edge1, x):
    t = np.clip((x - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def longitude_mask(lon, start, end, soft):
    """Soft box in longitude, with wrap-around support."""
    if start < end:
        d = np.minimum(np.abs(lon - (start + end) / 2), 2 * np.pi - np.abs(lon - (start + end) / 2))
        half = (end - start) / 2
    else:
        start2 = start - 2 * np.pi
        d = np.minimum(np.abs(lon - (start + end) / 2), 2 * np.pi - np.abs(lon - (start + end) / 2))
        half = (end + 2 * np.pi - start) / 2
    return 1.0 - smoothstep(half - soft, half + soft, d)


def softbox(lon, lat, lon_start, lon_end, lat_start, lat_end, soft_lon=0.12, soft_lat=0.08):
    lmask = longitude_mask(lon, lon_start, lon_end, soft_lon)
    lmask = lmask * lmask
    lat_arr = np.asarray(lat)
    vmask = smoothstep(lat_start - soft_lat, lat_start + soft_lat, lat_arr) * (
        1.0 - smoothstep(lat_end - soft_lat, lat_end + soft_lat, lat_arr)
    )
    return lmask * vmask


def base_environment(kind):
    lon = np.linspace(-np.pi, np.pi, WIDTH, dtype=np.float32)
    lat = np.linspace(-np.pi / 2, np.pi / 2, HEIGHT, dtype=np.float32)
    LON, LAT = np.meshgrid(lon, lat)

    up = (LAT + np.pi / 2) / np.pi  # 0 floor -> 1 ceiling
    if kind == "warm":
        base = np.stack(
            [
                0.013 + 0.010 * up,
                0.010 + 0.007 * up,
                0.008 + 0.005 * up,
            ],
            axis=-1,
        ).astype(np.float32)
        ceiling_glow = np.array([0.20, 0.12, 0.065], dtype=np.float32)
        floor_haze = np.array([0.02, 0.012, 0.008], dtype=np.float32)
    elif kind == "night":
        base = np.stack(
            [
                0.0025 + 0.003 * up,
                0.0040 + 0.006 * up,
                0.0085 + 0.016 * up,
            ],
            axis=-1,
        ).astype(np.float32)
        ceiling_glow = np.array([0.028, 0.048, 0.095], dtype=np.float32)
        floor_haze = np.array([0.004, 0.007, 0.014], dtype=np.float32)
    else:  # graphite studio
        base = np.stack(
            [
                0.010 + 0.014 * up,
                0.011 + 0.015 * up,
                0.013 + 0.017 * up,
            ],
            axis=-1,
        ).astype(np.float32)
        ceiling_glow = np.array([0.085, 0.095, 0.110], dtype=np.float32)
        floor_haze = np.array([0.012, 0.013, 0.015], dtype=np.float32)

    # Broad luminous gradient near the top and a subtle floor bounce.
    base += (ceiling_glow[None, None, :] * smoothstep(0.52, 1.0, up)[..., None]) ** 1.0
    base += floor_haze[None, None, :] * (1.0 - smoothstep(0.0, 0.22, up))[..., None]

    return LON, LAT, base


def add_panel(img, mask, colour, intensity, gaussian=0.0):
    if gaussian > 0:
        # A light, separable convolution to soften the edges further.
        k = max(1, int(gaussian * 3))
        x = np.arange(-k, k + 1)
        kernel = np.exp(-(x**2) / (2 * gaussian**2))
        kernel /= kernel.sum()
        for _ in range(2):
            mask = np.apply_along_axis(lambda a: np.convolve(a, kernel, mode="same"), 1, mask)
            mask = np.apply_along_axis(lambda a: np.convolve(a, kernel, mode="same"), 0, mask)
    img += mask[..., None] * (np.array(colour, dtype=np.float32) * intensity)[None, None, :]


def make_studio_graphite():
    LON, LAT, img = base_environment("graphite")
    # Hero overhead softbox, split into two long strips for sculpted paint highlights.
    add_panel(img, softbox(LON, LAT, -0.95, 0.95, 1.05, 1.36, 0.16, 0.10), (1.0, 0.98, 0.95), 7.5, 4)
    # Tall side strips produce the long, elegant reflections along the body.
    add_panel(img, softbox(LON, LAT, 1.30, 1.63, -0.12, 0.68, 0.055, 0.06), (0.82, 0.90, 1.0), 3.8, 3)
    add_panel(img, softbox(LON, LAT, -1.63, -1.30, -0.12, 0.68, 0.055, 0.06), (1.0, 0.92, 0.85), 2.9, 3)
    # Low front fill and a cool rear rim.
    add_panel(img, softbox(LON, LAT, 2.55, 3.75, -0.10, 0.45, 0.12, 0.09), (0.52, 0.62, 0.78), 0.75, 5)
    add_panel(img, softbox(LON, LAT, -0.34, 0.34, 0.02, 0.28, 0.08, 0.06), (0.60, 0.72, 0.90), 1.55, 4)
    # Narrow horizon strip adds a crisp line on the doors and wings.
    add_panel(img, softbox(LON, LAT, -np.pi, np.pi, -0.012, 0.026, 0.2, 0.012), (0.35, 0.40, 0.48), 0.42)
    return img


def make_studio_warm():
    LON, LAT, img = base_environment("warm")
    add_panel(img, softbox(LON, LAT, -1.05, 1.05, 1.02, 1.35, 0.17, 0.10), (1.0, 0.86, 0.68), 6.0, 4)
    add_panel(img, softbox(LON, LAT, 1.22, 1.58, -0.05, 0.62, 0.06, 0.06), (1.0, 0.68, 0.38), 2.7, 3)
    add_panel(img, softbox(LON, LAT, -1.58, -1.22, -0.05, 0.62, 0.06, 0.06), (0.65, 0.78, 1.0), 1.9, 3)
    add_panel(img, softbox(LON, LAT, 2.45, 3.85, 0.00, 0.42, 0.12, 0.08), (1.0, 0.55, 0.28), 0.6, 5)
    add_panel(img, softbox(LON, LAT, -0.3, 0.3, 0.04, 0.24, 0.08, 0.06), (1.0, 0.55, 0.22), 1.25, 4)
    add_panel(img, softbox(LON, LAT, -np.pi, np.pi, -0.012, 0.026, 0.2, 0.012), (0.62, 0.42, 0.28), 0.36)
    return img


def make_night_track():
    LON, LAT, img = base_environment("night")
    add_panel(img, softbox(LON, LAT, -0.7, 0.7, 1.12, 1.42, 0.15, 0.09), (0.48, 0.64, 1.0), 3.8, 5)
    add_panel(img, softbox(LON, LAT, 1.18, 1.55, -0.2, 0.55, 0.06, 0.07), (0.25, 0.48, 1.0), 2.4, 4)
    add_panel(img, softbox(LON, LAT, -1.55, -1.18, -0.2, 0.55, 0.06, 0.07), (0.32, 0.55, 1.0), 2.0, 4)
    # Red and white track-side practicals.
    for lon_center in (-2.4, -1.35, -0.3, 0.75, 1.8, 2.85):
        add_panel(
            img,
            softbox(LON, LAT, lon_center - 0.05, lon_center + 0.05, -0.015, 0.10, 0.04, 0.04),
            (1.0, 0.12, 0.06) if int((lon_center + 2.4) * 10) % 2 else (0.75, 0.83, 1.0),
            1.8,
            2,
        )
    add_panel(img, softbox(LON, LAT, -np.pi, np.pi, -0.008, 0.018, 0.2, 0.008), (0.2, 0.32, 0.7), 0.3)
    return img


def to_rgbe(rgb):
    rgb = np.maximum(np.asarray(rgb, dtype=np.float32), 0.0)
    max_c = rgb.max(axis=-1)
    _, exponent = np.frexp(np.where(max_c > 1e-32, max_c, 1.0))
    exp_stored = np.where(max_c > 1e-32, exponent + 128, 0).astype(np.int32)
    scale = np.where(max_c > 1e-32, np.exp2(8.0 - exponent), 0.0).astype(np.float32)
    out = np.zeros((*max_c.shape, 4), dtype=np.uint8)
    out[..., 0] = np.clip(rgb[..., 0] * scale, 0, 255).astype(np.uint8)
    out[..., 1] = np.clip(rgb[..., 1] * scale, 0, 255).astype(np.uint8)
    out[..., 2] = np.clip(rgb[..., 2] * scale, 0, 255).astype(np.uint8)
    out[..., 3] = exp_stored.astype(np.uint8)
    return out


def rle_channel(data):
    out = bytearray()
    i = 0
    n = len(data)
    while i < n:
        # Run of four or more identical bytes is worth encoding.
        run = 1
        while i + run < n and data[i + run] == data[i] and run < 127:
            run += 1
        if run >= 4:
            out.extend((128 + run, int(data[i])))
            i += run
            continue
        # Collect a literal packet, stopping before a worthwhile run.
        literal = bytearray()
        while i < n and len(literal) < 128:
            upcoming = 1
            while i + upcoming < n and data[i + upcoming] == data[i] and upcoming < 4:
                upcoming += 1
            if upcoming >= 4:
                break
            literal.append(int(data[i]))
            i += 1
        out.append(len(literal))
        out.extend(literal)
    return out


def write_hdr(path, rgb):
    rgbe = to_rgbe(rgb)
    h, w, _ = rgbe.shape
    with open(path, "wb") as f:
        f.write(b"#?RADIANCE\n")
        f.write(b"FORMAT=32-bit_rle_rgbe\n\n")
        f.write(f"-Y {h} +X {w}\n".encode("ascii"))
        for y in range(h):
            f.write(bytes((2, 2, (w >> 8) & 0xFF, w & 0xFF)))
            for c in range(4):
                f.write(rle_channel(rgbe[y, :, c]))
    return path


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    environments = {
        "studio-graphite.hdr": make_studio_graphite(),
        "studio-warm.hdr": make_studio_warm(),
        "night-track.hdr": make_night_track(),
    }
    for name, rgb in environments.items():
        path = OUT_DIR / name
        write_hdr(path, rgb)
        print(f"wrote {path} ({path.stat().st_size / 1024:.0f} KiB)")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Remove the fixed yellow lower-third captions from a video.

The source used by the DOG ARMY intro has Portuguese captions baked into the
pixels. This script detects only the bright yellow caption glyphs in the lower
half, expands the mask over their dark outline, and inpaints those small areas.
Audio is copied from the source by ffmpeg after the processed frames are piped
back to an H.264/AAC MP4.
"""

from __future__ import annotations

import argparse
import math
import subprocess
from pathlib import Path

import cv2
import numpy as np


def clean_frame(frame: np.ndarray) -> np.ndarray:
    height, width = frame.shape[:2]
    top = int(height * 0.48)
    roi = frame[top:height, 0:width]
    hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)

    # Subtitle fill is a saturated lemon yellow. DOG orange sits below this hue
    # range, so the mascot and the page's orange visual identity stay intact.
    mask = cv2.inRange(
        hsv,
        np.array((20, 120, 135), dtype=np.uint8),
        np.array((42, 255, 255), dtype=np.uint8),
    )
    mask = cv2.morphologyEx(
        mask, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_RECT, (5, 3))
    )
    # Cover the black stroke and antialiasing around each detected glyph.
    mask = cv2.dilate(
        mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 7)), iterations=2
    )

    if cv2.countNonZero(mask) < 20:
        return frame

    points = cv2.findNonZero(mask)
    if points is None:
        return frame
    x, y, w, h = cv2.boundingRect(points)
    pad = 10
    x0, y0 = max(0, x - pad), max(0, y - pad)
    x1, y1 = min(width, x + w + pad), min(roi.shape[0], y + h + pad)

    result = frame.copy()
    patch = roi[y0:y1, x0:x1]
    patch_mask = mask[y0:y1, x0:x1]
    result[top + y0 : top + y1, x0:x1] = cv2.inpaint(
        patch, patch_mask, 5, cv2.INPAINT_TELEA
    )
    return result


def preview(source: Path, output: Path, columns: int = 4, rows: int = 3) -> None:
    cap = cv2.VideoCapture(str(source))
    if not cap.isOpened():
        raise SystemExit(f"Could not open {source}")
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    samples = []
    for frame_index in np.linspace(0, max(total - 1, 0), columns * rows, dtype=int):
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(frame_index))
        ok, frame = cap.read()
        if not ok:
            continue
        cleaned = clean_frame(frame)
        samples.append(cv2.resize(cleaned, (320, 180), interpolation=cv2.INTER_AREA))
    cap.release()
    if not samples:
        raise SystemExit("No preview frames decoded")

    canvas = np.zeros((rows * 180, columns * 320, 3), dtype=np.uint8)
    for index, sample in enumerate(samples):
        y = (index // columns) * 180
        x = (index % columns) * 320
        canvas[y : y + 180, x : x + 320] = sample
    if not cv2.imwrite(str(output), canvas):
        raise SystemExit(f"Could not write {output}")


def render(source: Path, output: Path, ffmpeg: str) -> None:
    if source.resolve() == output.resolve():
        raise SystemExit("Input and output must be different files")

    cap = cv2.VideoCapture(str(source))
    if not cap.isOpened():
        raise SystemExit(f"Could not open {source}")
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = float(cap.get(cv2.CAP_PROP_FPS)) or 30.0
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    command = [
        ffmpeg,
        "-y",
        "-loglevel",
        "warning",
        "-f",
        "rawvideo",
        "-pix_fmt",
        "bgr24",
        "-s",
        f"{width}x{height}",
        "-r",
        f"{fps:.6f}",
        "-i",
        "pipe:0",
        "-i",
        str(source),
        "-map",
        "0:v:0",
        "-map",
        "1:a:0?",
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "24",
        "-maxrate",
        "1400k",
        "-bufsize",
        "2800k",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-movflags",
        "+faststart",
        "-shortest",
        str(output),
    ]
    process = subprocess.Popen(command, stdin=subprocess.PIPE)
    assert process.stdin is not None

    index = 0
    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            process.stdin.write(clean_frame(frame).tobytes())
            index += 1
            if index % 600 == 0:
                percent = math.floor((index / max(total, 1)) * 100)
                print(f"Processed {index}/{total} frames ({percent}%)", flush=True)
    finally:
        cap.release()
        process.stdin.close()

    status = process.wait()
    if status != 0:
        raise SystemExit(status)
    print(f"Wrote {output}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--preview", action="store_true")
    parser.add_argument("--ffmpeg", default="ffmpeg")
    args = parser.parse_args()

    args.output.parent.mkdir(parents=True, exist_ok=True)
    if args.preview:
        preview(args.source, args.output)
    else:
        render(args.source, args.output, args.ffmpeg)


if __name__ == "__main__":
    main()

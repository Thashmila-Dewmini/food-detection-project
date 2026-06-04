# backend/src/data/validate_dataset.py
from pathlib import Path
import cv2

DATASET_PATH = "data/raw/sri-lankan-food-dataset"

splits = ["train", "valid", "test"]

for split in splits:

    image_dir = Path(DATASET_PATH) / split / "images"
    label_dir = Path(DATASET_PATH) / split / "labels"

    images = list(image_dir.glob("*"))

    print(f"\nChecking {split} set...")
    print(f"Total images: {len(images)}")

    for img_path in images:

        label_path = label_dir / f"{img_path.stem}.txt"

        # Missing labels
        if not label_path.exists():
            print(f"[Missing Label] {img_path.name}")
            continue

        # Corrupted image
        img = cv2.imread(str(img_path))

        if img is None:
            print(f"[Corrupted Image] {img_path.name}")
            continue

        # Empty label file
        if label_path.stat().st_size == 0:
            print(f"[Empty Label] {label_path.name}")
            continue

        # Validate YOLO annotation format
        with open(label_path, "r") as f:

            lines = f.readlines()

            for line_num, line in enumerate(lines):

                parts = line.strip().split()

                if len(parts) != 5:
                    print(f"[Invalid Format] {label_path.name} line {line_num + 1}")
                    continue

                class_id, x, y, w, h = map(float, parts)

                if not (0 <= x <= 1 and
                        0 <= y <= 1 and
                        0 <= w <= 1 and
                        0 <= h <= 1):

                    print(f"[Invalid BBox] {label_path.name} line {line_num + 1}")

print("\nDataset validation complete.")
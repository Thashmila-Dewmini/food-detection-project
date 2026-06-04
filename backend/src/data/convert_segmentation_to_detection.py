# backend/src/data/convert_segmentation_to_detection.py
from pathlib import Path

DATASET_PATH = "data/raw/sri-lankan-food-dataset"

splits = ["train", "valid", "test"]

for split in splits:

    label_dir = Path(DATASET_PATH) / split / "labels"

    label_files = list(label_dir.glob("*.txt"))

    print(f"\nProcessing {split} labels...")

    for label_file in label_files:

        new_lines = []

        with open(label_file, "r") as f:
            lines = f.readlines()

        for line in lines:

            values = line.strip().split()

            # Need at least class + 2 points
            if len(values) < 7:
                continue

            class_id = values[0]

            coords = list(map(float, values[1:]))

            x_coords = coords[0::2]
            y_coords = coords[1::2]

            x_min = min(x_coords)
            x_max = max(x_coords)

            y_min = min(y_coords)
            y_max = max(y_coords)

            x_center = (x_min + x_max) / 2
            y_center = (y_min + y_max) / 2

            width = x_max - x_min
            height = y_max - y_min

            new_line = f"{class_id} {x_center} {y_center} {width} {height}\n"

            new_lines.append(new_line)

        with open(label_file, "w") as f:
            f.writelines(new_lines)

print("\nConversion completed.")
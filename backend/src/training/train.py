# backend/src/training/train.py
from ultralytics import YOLO

def main():

    model = YOLO("yolov8n.pt")

    model.train(
        data="data/raw/sri-lankan-food-dataset/data.yaml",
        epochs=100,
        imgsz=640,
        batch=16,
        device=0,
        workers=4,
        patience=20,
        cache=True,
        project="outputs",
        name="food_detection_v1"
    )

if __name__ == "__main__":
    main()

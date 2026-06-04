# backend/src/inference/predict.py
from ultralytics import YOLO

model = YOLO("runs/detect/outputs/food_detection_v1-3/weights/best.pt")

results = model.predict(
    source="data/raw/sri-lankan-food-dataset/test/images",
    save=True,
    conf=0.25,
)

print("Prediction completed")
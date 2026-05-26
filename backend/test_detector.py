from src.inference.detector import FoodDetector

detector = FoodDetector(
    "runs/detect/outputs/food_detection_v1-3/weights/best.pt"
)


results = detector.detect(
    "data/raw/sri-lankan-food-dataset/test/images/test1.jpeg"
)

print(results)

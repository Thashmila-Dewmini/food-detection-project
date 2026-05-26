from ultralytics import YOLO
import numpy as np
from PIL import Image
import cv2

model = YOLO('runs/detect/outputs/food_detection_v1-3/weights/best.pt')
img_path = 'data/raw/sri-lankan-food-dataset/test/images/test1.jpeg'

# Method 3: PIL -> RGB -> BGR (the fix)
img = Image.open(img_path).convert('RGB')
rgb_array = np.array(img)
bgr_array = cv2.cvtColor(rgb_array, cv2.COLOR_RGB2BGR)
r3 = model(bgr_array, conf=0.01, iou=0.7, verbose=False)
print('BGR fix method detections:', len(r3[0].boxes))
for b in r3[0].boxes:
    print(f'  {model.names[int(b.cls[0])]} {float(b.conf[0]):.3f}')
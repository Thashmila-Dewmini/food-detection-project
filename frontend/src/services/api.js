// frontend/src/services/api.js
import { API_ENDPOINTS } from "../constants/config";


// Analyze a food image
// Sends image as multipart/form-data to the YOLO pipeline
export const analyzeFood = async (imageUri) => {
  const formData = new FormData();

  formData.append("image", {
    uri: imageUri,
    type: "image/jpeg",
    name: imageUri.split("/").pop(),
  });

  const response = await fetch(API_ENDPOINTS.analyze, {
    method: "POST",
    headers: { "Content-Type": "multipart/form-data" },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  return response.json();
};


// Submit user feedback for model improvement
// Sends original predictions alongside user corrections
export const submitFeedback = async (
  imageId, 
  originalItems, 
  correctedItems 
) => {
  const response = await fetch(API_ENDPOINTS.feedback, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image_id:                imageId,
      original_detected_items: originalItems,
      corrected_items:         correctedItems,
    }),
  });

  if (!response.ok) {
    throw new Error(`Feedback API error: ${response.status}`);
  }

  return response.json();
};


// Recalculate nutrition after user edits portion sizes
// Accepts updated item weights and returns new totals
export const recalculateNutrition = async (items) => {
  const response = await fetch(API_ENDPOINTS.recalculate, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ items }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => null);
    throw new Error(
      `Recalculate API error: ${response.status}` +
      (errorText ? ` — ${errorText}` : ""),
    );
  }

  return response.json();
};
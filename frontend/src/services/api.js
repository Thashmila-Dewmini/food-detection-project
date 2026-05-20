import { API_ENDPOINTS } from "../constants/config";

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
  if (!response.ok) throw new Error(`Server error: ${response.status}`);
  return response.json();
};

export const submitFeedback = async (imageId, originalItems, correctedItems ) => {
  const response = await fetch(API_ENDPOINTS.feedback, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image_id: imageId,
      original_detected_items: originalItems,
      corrected_items: correctedItems,
    }),
  });
  return response.json();
};

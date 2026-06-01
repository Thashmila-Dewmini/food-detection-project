// frontend/src/storage/mealStorage.js
import AsyncStorage from "@react-native-async-storage/async-storage";


// Storage key for persisted meal history
const MEALS_KEY = 'nutrisight_meals';

// Retrieve all saved meals from local storage
// Returns an empty array if no meals exist or on failure
export const getMeals = async () => {
    try {
        const data = await AsyncStorage.getItem(MEALS_KEY);
        return data ? JSON.parse(data): [];
    } catch (e) {
        console.error("getMeals error:", e);
        return [];
    }
};


// Save a new meal to local storage
// Prepends to existing list; returns the saved meal or null
export const saveMeal = async (mealData) => {
    try {
        const existing = await getMeals();

        const newMeal = { 
            id: Date.now().toString(), 
            date: new Date().toISOString(), 
            ...mealData
        };

        await AsyncStorage.setItem(
            MEALS_KEY, 
            JSON.stringify([newMeal, ...existing])
        );

        return newMeal;
        
    } catch (e) {
        console.error('saveMeal error', e);
        return null;
    }
};



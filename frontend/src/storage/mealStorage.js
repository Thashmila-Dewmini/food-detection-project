import AsyncStorage from "@react-native-async-storage/async-storage";

const MEALS_KEY = 'nutrisight_meals';

export const saveMeal = async (mealData) => {
    try {
        const existing = await getMeals();
        const newMeal = { id: Date.now().toString(), date: new Date().toISOString(), ...mealData};
        await AsyncStorage.setItem(MEALS_KEY, JSON.stringify([newMeal, ...existing]));
        return newMeal;
    } catch (e) {
        console.error('saveMeal error', e);
        return null;
    }
};

export const getMeals = async () => {
    try {
        const data = await AsyncStorage.getItem(MEALS_KEY);
        return data ? JSON.parse(data): [];
    } catch (e) {
        return [];
    }
};

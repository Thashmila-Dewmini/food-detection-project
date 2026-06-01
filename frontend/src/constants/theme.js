// frontend/src/constants/theme.js

// App-wide color palette
// All UI components should reference these tokens
// instead of hardcoding color values directly.
export const COLORS = {
  // Brand
    primary: '#025e05',        
    primaryLight: '#E8F5E9', 
    
    // Backgrounds & surfaces
    background: '#f5f5f5',     
    card: '#ffffff',     
    
    // Typography
    textDark: '#1a1a1a',       
    textMedium: '#555555',     
    textLight: '#999999',  
    
    // UI elements
    border: '#e0e0e0',         
    error: '#d32f2f',    
    
    // Calorie impact indicators
    calorieLow: '#4CAF50',
    calorieMedium: '#FF9800',
    calorieHigh: '#F44336',

    // Warning states
    warningBg: '#FFF3E0',
    warningText: '#E65100',
}

// Font size scale
// Use these named sizes instead of raw numbers in styles.
export const FONTS = {
  regular: 16,
  small: 13,
  medium: 18,
  large: 24,
  xlarge: 30,
};
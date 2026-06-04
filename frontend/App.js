// frontend/App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./src/screens/HomeScreen";
import ImageSourceScreen from "./src/screens/ImageSourceScreen";
import ImagePreviewScreean from "./src/screens/ImagePreviewScreen";
import LoadingScreen from "./src/screens/LoadingScreen";
import ResultsScreen from "./src/screens/ResultsScreen";
import EditResultsScreen from "./src/screens/EditResultsScreen";
import HistoryScreen     from './src/screens/HistoryScreen';
import MealDetailScreen  from './src/screens/MealDetailScreen';
import ErrorScreen from "./src/screens/ErrorScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#f5f5f5'}
      }}>
        <Stack.Screen name="Home" component={HomeScreen}/>
        <Stack.Screen name="ImageSource" component={ImageSourceScreen}/>
        <Stack.Screen name="ImagePreview" component={ImagePreviewScreean}/>
        <Stack.Screen name="Loading" component={LoadingScreen}/>
        <Stack.Screen name="Results" component={ResultsScreen}/>
        <Stack.Screen name="Error" component={ErrorScreen}/>
        <Stack.Screen name="EditResults" component={EditResultsScreen}/>
        <Stack.Screen name="History"      component={HistoryScreen} />
        <Stack.Screen name="MealDetail"   component={MealDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

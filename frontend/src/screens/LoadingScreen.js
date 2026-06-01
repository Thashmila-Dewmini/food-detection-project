// frontend/src/screens/LoadingScreen.js
import React, { useEffect, useRef} from "react";
import {
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  SafeAreaView, 
  Animated, 
  Easing,
} from 'react-native';
import { analyzeFood } from "../services/api";
import { COLORS } from "../constants/theme";


export default function LoadingScreen({ navigation, route }) {
  const { image } = route.params;
  const spinValue = useRef(new Animated.Value(0)).current;

  // Start spinner animation on mount
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1, 
        duration: 1000,
        easing: Easing.linear, 
        useNativeDriver: true,
      })
    ).start();
  }, []);
  
  // Run food analysis and navigate based on result
  useEffect(() => {
    const run = async () => {
      try {
        const result = await analyzeFood(image.uri);

        if (result.status === 'success') {
          navigation.replace('Results', { result, imageUri: image.uri });

        } else if (result.status === 'no_food_detected') {
          navigation.replace('Error', { 
            type: 'no_food', 
            imageUri: image.uri 
          });

        } else {
          navigation.replace('Error', { type: 'server_error' });
        }

      } catch (e) {
        navigation.replace('Error', { type: 'network_error' });
      }
    };
    run();
  }, []);
 
  const spin = spinValue.interpolate({ 
    inputRange: [0, 1], 
    outputRange: ['0deg', '360deg'] 
  });
 
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        {/* Spinner */}
        <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
          <View style={styles.spinnerInner} />
        </Animated.View>
 
        <Text style={styles.title}>Processing your image....</Text>
        <Text style={styles.subtitle}>This may take a few seconds</Text>

        {/* Cancel returns user to home without waiting */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    spinner: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 6,
        borderColor: COLORS.primaryLight,
        borderTopColor: COLORS.primary,
        marginBottom: 32,
    },
    spinnerInner: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textDark,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textMedium,
        marginTop: 8,
        marginBottom: 48,
    },
    cancelButton: {
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderRadius: 30,
        paddingVertical: 12,
        paddingHorizontal: 48,
    },
    cancelText: {
        color: COLORS.primary,
        fontSize: 15,
        fontWeight: '600',
    }
});
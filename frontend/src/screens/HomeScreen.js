import React from "react";
import {
    View, Text, TouchableOpacity, StyleSheet,
    SafeAreaView, StatusBar
} from 'react-native'
import { COLORS } from "../constants/theme";

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.content}>
        <Text style={styles.appName}>NutriSight</Text>
        <Text style={styles.greeting}>Hi!👋</Text>
        <Text style={styles.description}>
          Scan your meals and instantly discover nutrition insights.
        </Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.outlineButton}
            onPress={() => navigation.navigate('ImageSource')}
          >
            <Text style={styles.outlineButtonText}>Scan your meal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filledButton}
            onPress={() => navigation.navigate('History')}
          >
            <Text style={styles.filledButtonText}>View History</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.footer}>Smart food analysis powered by AI</Text>
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
        paddingHorizontal: 36,
        
    },
    appName: {
        marginTop: 10,
        fontSize: 70,
        fontWeight: '800',
        color: COLORS.textDark,
        marginBottom: 100, 
    },
    greeting: {
        fontSize: 50,
        fontWeight: '800',
        color: COLORS.primary,
        marginBottom: 10,
    },
    description: {
        fontSize: 25,
        fontWeight: '500',
        color: COLORS.textMedium,
        textAlign: 'center',
        lineHeight: 27,
        marginBottom: 100,
    },
    buttonGroup: {
        width: '100%',
        gap: 20,
    },
    outlineButton: {
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderRadius: 30,
        paddingVertical: 14,
        alignItems: 'center',
    },
    outlineButtonText: {
        color: COLORS.primary,
        fontSize: 20,
        fontWeight: '700',
    },
    filledButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 30,
        paddingVertical: 14,
        alignItems: 'center',
    },
    filledButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
    },
    footer: {
        textAlign: 'center',
        color: COLORS.textLight,
        fontSize: 12,
        paddingBottom: 25,
    }
});
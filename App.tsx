import { Keyboard, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import gradientColors from "./config/GradientColors";
import { renderAppContent } from "./app/screens/AppContent";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import colors from "./config/colors";

export default function App() {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaProvider>
        <LinearGradient
          colors={gradientColors as any}
          style={styles.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          <NavigationContainer
            theme={{
              ...DarkTheme,
              dark: true,
              colors: {
                primary: colors.primary,
                background: "transparent",
                card: colors.primary,
                text: colors.white,
                border: colors.dark,
                notification: colors.secondary,
              },
            }}
          >
            <SafeAreaView style={styles.container}>
              {renderAppContent()}
            </SafeAreaView>
          </NavigationContainer>
        </LinearGradient>
      </SafeAreaProvider>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "transparent",
  },
});

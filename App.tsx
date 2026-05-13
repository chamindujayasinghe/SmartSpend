import { Keyboard, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import colors from "./src/config/colors";
import { ThemeProvider, useTheme } from "./src/contexts/ThemeProvider";
import lightGradientColors from "./src/config/theme/LightGradientColors";
import gradientColors from "./src/config/theme/GradientColors";
import { CurrencyProvider } from "./src/contexts/currencyProvider";
import { AppContent } from "./src/AppContent";

const AppGradientWrapper = () => {
  const { isLightMode } = useTheme();

  return (
    <LinearGradient
      colors={(isLightMode ? lightGradientColors : gradientColors) as any}
      style={styles.gradient}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <NavigationContainer
        theme={{
          ...DarkTheme,
          dark: !isLightMode,
          colors: {
            primary: colors.black,
            background: "transparent",
            card: colors.black,
            text: colors.white,
            border: colors.black,
            notification: colors.secondary,
          },
        }}
      >
        <SafeAreaView style={styles.container}>
          <AppContent />
        </SafeAreaView>
      </NavigationContainer>
    </LinearGradient>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaProvider>
            <AppGradientWrapper />
          </SafeAreaProvider>
        </TouchableWithoutFeedback>
      </CurrencyProvider>
    </ThemeProvider>
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

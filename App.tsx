import { Keyboard, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { AppContent } from "./app/AppContent";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import colors from "./config/colors";
import { ThemeProvider, useTheme } from "./config/theme/ThemeProvider";
import lightGradientColors from "./config/theme/LightGradientColors";
import gradientColors from "./config/theme/GradientColors";
import { CurrencyProvider } from "./config/currencyProvider";

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

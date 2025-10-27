import { ActivityIndicator, View, StyleSheet } from "react-native";
import AppScreen from "./AuthenticatedAppScreen";
import { useAuthSession } from "../../Hooks/useAuthSession";
import { NavigationContainer } from "@react-navigation/native";
import AuthNavigator from "../navigation/AuthNavigator";

export const renderAppContent = () => {
  const { loading, session, isFreshLogin } = useAuthSession();
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (session && session.user) {
    return <AppScreen isInitialLogin={isFreshLogin} user={session.user} />;
  }

  return (
    <NavigationContainer>
      <AuthNavigator />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

import { ActivityIndicator, View } from "react-native";
import { useAuthSession } from "../../Hooks/useAuthSession";
import AuthNavigator from "../navigation/AuthNavigator";
import AppScreen from "./AppScreen";

export const renderAppContent = () => {
  const { session, isFreshLogin, loading } = useAuthSession();
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (session && session.user) {
    return <AppScreen user={session.user} isInitialLogin={isFreshLogin} />;
  }
  return <AuthNavigator />;
};

// app/screens/AppContent.tsx
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthSession } from "../../Hooks/useAuthSession";
import AuthNavigator from "../navigation/AuthNavigator";
import AppScreen from "./AppScreen";

export const AppContent = () => {
  const { session, isFreshLogin, loading: authLoading } = useAuthSession();
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [checkingResetState, setCheckingResetState] = useState(true);

  // Check if we are in the middle of a password reset flow
  useEffect(() => {
    const checkResetStatus = async () => {
      const resetStatus = await AsyncStorage.getItem("is_resetting_password");
      setIsResettingPassword(resetStatus === "true");
      setCheckingResetState(false);
    };
    checkResetStatus();
  }, [session]);

  if (authLoading || checkingResetState) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isResettingPassword) {
    return <AuthNavigator initialRouteName="NewPassword" />;
  }

  if (session && session.user) {
    return <AppScreen user={session.user} isInitialLogin={isFreshLogin} />;
  }

  return <AuthNavigator />;
};

import React from "react";
import { User } from "@supabase/supabase-js";
import { useAppScreenLogic } from "../../Hooks/useAppScreen";
import SuccessOverlay from "../components/SuccessOverlay";
import MainTabNavigator from "../navigation/MainTabNavigator";
import AppNavigator from "../navigation/AppNavigator";

interface AppScreenProps {
  user: User;
  isInitialLogin?: boolean;
}

const AppScreen: React.FC<AppScreenProps> = ({
  user,
  isInitialLogin = false,
}) => {
  const { showSuccessMessage, fullName } = useAppScreenLogic(
    user,
    isInitialLogin
  );

  if (showSuccessMessage) {
    return <SuccessOverlay fullName={fullName} />;
  }

  return <AppNavigator user={user} />;
};

export default AppScreen;

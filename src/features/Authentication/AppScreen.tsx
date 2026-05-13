import React from "react";
import { User } from "@supabase/supabase-js";
<<<<<<<< HEAD:src/AppScreen.tsx
import { useAppScreenLogic } from "./Hooks/useAppScreen";
import SuccessOverlay from "./components/ui/SuccessOverlay";
========
import { useAppScreenLogic } from "../Hooks/useAppScreen";
import SuccessOverlay from "./components/SuccessOverlay";
>>>>>>>> 2df68ee2fa9c5e3984406726648b7ae9c4cdc2b5:src/features/Authentication/AppScreen.tsx
import AppNavigator from "./navigation/AppNavigator";

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
    isInitialLogin,
  );

  if (showSuccessMessage) {
    return <SuccessOverlay fullName={fullName} />;
  }

  return <AppNavigator user={user} />;
};

export default AppScreen;

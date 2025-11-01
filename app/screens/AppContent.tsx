import { useAuthSession } from "../../Hooks/useAuthSession";
import AuthNavigator from "../navigation/AuthNavigator";
import MainTabNavigator from "../navigation/MainTabNavigator";

export const renderAppContent = () => {
  const { session, isFreshLogin } = useAuthSession();

  if (session && session.user) {
    return (
      <MainTabNavigator isInitialLogin={isFreshLogin} user={session.user} />
    );
  }
  return <AuthNavigator />;
};

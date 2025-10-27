import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/Supabase-client-config";

interface AppScreenLogic {
  loading: boolean;
  showSuccessMessage: boolean;
  fullName: string;
  handleSignOut: () => Promise<void>;
}


export const useAppScreenLogic = (user: User, isInitialLogin: boolean): AppScreenLogic => {
  const [loading, setLoading] = useState(false); 
  const [showSuccessMessage, setShowSuccessMessage] = useState(isInitialLogin);

  const firstName = (user.user_metadata?.first_name as string) || "";
  const lastName = (user.user_metadata?.last_name as string) || "";

  const fullName =
    firstName && lastName
      ? `${firstName} ${lastName}`
      : user.email || "Authenticated User";

  useEffect(() => {
    if (isInitialLogin) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isInitialLogin]);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error.message);
      }
    } catch (e) {
      console.error("Sign out failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return { 
    loading, 
    showSuccessMessage, 
    fullName, 
    handleSignOut 
  };
};
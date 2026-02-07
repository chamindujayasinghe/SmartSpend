import { useEffect, useState } from "react";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/Supabase-client-config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TRANSACTIONS_KEY = "@transactions";

export const useAuthSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFreshLogin, setIsFreshLogin] = useState(false);

  useEffect(() => {
    let mounted = true;

    // 1️⃣ Validate session safely on app start
    const initSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error || !data.session) {
        // token revoked / expired / multi-device login
        await supabase.auth.signOut({ scope: "local" });
        setSession(null);
      } else {
        setSession(data.session);
      }

      setIsFreshLogin(false);
      setLoading(false);
    };

    initSession();

    // 2️⃣ Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return;

        if (event === "SIGNED_IN" && session) {
          setSession(session);
          setIsFreshLogin(true);
        } else if (event === "SIGNED_OUT" || !session) {
          setSession(null);
          setIsFreshLogin(false);

          // cleanup local-only data
          AsyncStorage.removeItem(TRANSACTIONS_KEY).catch((e) =>
            console.error("Failed to clear transactions on signout", e)
          );
        } else {
          setSession(session);
          setIsFreshLogin(false);
        }

        setLoading(false);
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, loading, isFreshLogin };
};

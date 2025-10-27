import { useState, useEffect } from "react";
import { Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "../lib/Supabase-client-config";

export const useAuthSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFreshLogin, setIsFreshLogin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setIsFreshLogin(false);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      setSession(session);

      if (event === "SIGNED_IN") {
        setIsFreshLogin(true);
      } else {
        setIsFreshLogin(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, loading, isFreshLogin };
};
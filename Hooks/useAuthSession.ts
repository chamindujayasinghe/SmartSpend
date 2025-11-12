
import { useState, useEffect } from "react";
import { Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "../lib/Supabase-client-config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TRANSACTIONS_KEY = "@transactions";

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

} else if (event === "SIGNED_OUT") {
AsyncStorage.removeItem(TRANSACTIONS_KEY).catch(e => 
console.error("Failed to clear transactions on signout", e)
);
setIsFreshLogin(false);
} else {
setIsFreshLogin(false);
}
setLoading(false);
});

return () => subscription.unsubscribe();
}, []);

return { session, loading, isFreshLogin };
};
import { supabase } from "../lib/Supabase-client-config";
import * as WebBrowser from "expo-web-browser";

const handleSignInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {

      },
    });

    if (error) {
      console.error("Google Sign-In Error:", error.message);

      alert(`Error: ${error.message}`);
      return;
    }


    if (data.url) {
      await WebBrowser.openAuthSessionAsync(data.url);
    }
    
  } catch (err) {
    console.error("An unexpected error occurred:", err);
    alert("An unexpected error occurred during Google sign-in.");
  }
};

export default handleSignInWithGoogle;
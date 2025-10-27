import { supabase } from "../lib/Supabase-client-config";

interface SigninValues {
  email: string;
  password: string;
}

export interface ServerStatus {
  type: "error" | "success" | "info";
  message: string;
}

const handleSignIn = async (
  values: SigninValues,
  {
    setSubmitting,
    setStatus,
  }: {
    setSubmitting: (isSubmitting: boolean) => void;
    setStatus: (status: ServerStatus | null) => void;
  }
) => {
  setSubmitting(true);
  setStatus(null); // Clear previous status messages

  try {
    const { email, password } = values;

    const {
      data: { session },
      error,
    } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setStatus({ type: "error", message: error.message });
    } else if (session) {
      // SUCCESS: Session is active, App.tsx listener will handle navigation
      setStatus({ type: "success", message: "Signed in successfully!" });
    }
  } catch (e) {
    setStatus({
      type: "error",
      message: "An unexpected network error occurred.",
    });
    console.error("Signin Error:", e);
  } finally {
    setSubmitting(false);
  }
};

export default handleSignIn;

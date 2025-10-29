import { supabase } from "../lib/Supabase-client-config";
import { ServerStatus } from "./HandleSignIn"; // Reuse your existing ServerStatus type

interface ForgotPasswordValues {
  email: string;
}

const handleForgotPassword = async (
  values: ForgotPasswordValues,
  {
    setSubmitting,
    setStatus,
  }: {
    setSubmitting: (isSubmitting: boolean) => void;
    setStatus: (status: ServerStatus | null) => void;
  }
) => {
  setSubmitting(true);
  setStatus(null);
  try {
    const { email } = values;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://smart-spend-web-ten.vercel.app/Update-Password.html",
    });

    if (error) {
      setStatus({ type: "error", message: error.message });
    } else {
      setStatus({
        type: "info",
        message: "Success! Please check your email for a password reset link.",
      });
    }
  } catch (e) {
    setStatus({
      type: "error",
      message: "An unexpected network error occurred.",
    });
    console.error(
      "Forgot Password Error:",
      e instanceof Error ? e.message : "Unknown error"
    );
  } finally {
    setSubmitting(false);
  }
};

export default handleForgotPassword;
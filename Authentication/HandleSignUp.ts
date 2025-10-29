import { supabase } from "../lib/Supabase-client-config";

interface SignupValues {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  confirmPassword?: string;
}
export interface ServerStatus {
  type: "error" | "success" | "info";
  message: string;
}

const handleSignUp = async (
  values: SignupValues,
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
    const { email, password, firstname, lastname } = values;

    const {
      data: { user, session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: "https://smart-spend-web-ten.vercel.app/SignUpConfirm.html",
        data: {
          first_name: firstname,
          last_name: lastname,
        },
      },
    });

    if (error) {
      setStatus({ type: "error", message: error.message });
    } else if (session) {
      setStatus({
        type: "success",
        message: "Successfully signed up and logged in!",
      });
    } else if (user) {
      setStatus({
        type: "info",
        message: "Success! Please check your email to verify your account.",
      });
    }
  } catch (e) {
    setStatus({
      type: "error",
      message: "An unexpected network error occurred.",
    });
    console.error(
      "Signup Error:",
      e instanceof Error ? e.message : "Unknown error"
    );
  } finally {
    setSubmitting(false);
  }
};

export default handleSignUp;

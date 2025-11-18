import { supabase } from "../lib/Supabase-client-config";
import { ServerStatus } from "./HandleSignIn";


export const sendResetPasswordEmail = async (
  email: string,
  setStatus: (status: ServerStatus | null) => void,
  setLoading: (loading: boolean) => void
): Promise<boolean> => {
  setLoading(true);
  setStatus(null);
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      setStatus({ type: "error", message: error.message });
      return false;
    } else {
      setStatus({
        type: "info",
        message: "OTP sent! Check your email for the code.",
      });
      return true;
    }
  } catch (e) {
    setStatus({
      type: "error",
      message: "Network error occurred.",
    });
    console.error("Send Email Error:", e);
    return false;
  } finally {
    setLoading(false);
  }
};


export const verifyResetPasswordOtp = async (
  email: string,
  token: string,
  setStatus: (status: ServerStatus | null) => void,
  setLoading: (loading: boolean) => void
): Promise<boolean> => {
  setLoading(true);
  setStatus(null);

  try {

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "recovery",
    });

    if (error) {
      setStatus({ type: "error", message: error.message });
      return false;
    }

    if (data.session) {

        return true;
    }
    
    return false;

  } catch (e) {
    setStatus({
      type: "error",
      message: "Failed to verify OTP.",
    });
    console.error("Verify OTP Error:", e);
    return false;
  } finally {
    setLoading(false);
  }
};


export const updateUserPassword = async (
  newPassword: string,
  setStatus: (status: ServerStatus | null) => void,
  setLoading: (loading: boolean) => void
): Promise<boolean> => {
  setLoading(true);
  setStatus(null);

  try {

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setStatus({ type: "error", message: error.message });
      return false;
    } else {
      setStatus({
        type: "info",
        message: "Password updated successfully! Redirecting...",
      });
      return true;
    }
  } catch (e) {
    setStatus({
      type: "error",
      message: "Failed to update password.",
    });
    console.error("Update Password Error:", e);
    return false;
  } finally {
    setLoading(false);
  }
};
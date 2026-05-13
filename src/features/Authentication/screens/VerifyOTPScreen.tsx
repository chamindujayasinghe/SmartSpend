import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { supabase } from "../../../config/Supabase-client-config";
import { useThemeColors } from "../../../config/theme/colorMode";
import AppText from "../../../components/ui/AppText";
import AppTextInput from "../../../components/ui/AppTextInput";
import AppErrorText from "../../../components/ui/AppErrorText";
import colors from "../../../config/colors";
import AppButton from "../../../components/ui/AppButton";

type VerifyOtpRouteParams = {
  VerifyOtp: {
    email: string;
  };
};

type VerifyOtpScreenRouteProp = RouteProp<VerifyOtpRouteParams, "VerifyOtp">;

const VerifyOtpScreen = () => {
  const route = useRoute<VerifyOtpScreenRouteProp>();
  const { email } = route.params;

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError(null);

    const {
      data: { session },
      error,
    } = await supabase.auth.verifyOtp({
      email: email,
      token: otp,
      type: "signup",
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else if (session) {
      console.log("Verification Success!");
    }
  };
  const { titlecolor, secondarycolormode, placeholder, textinputcolor } =
    useThemeColors();

  return (
    <View style={styles.container}>
      <AppText style={[styles.title, { color: titlecolor }]}>
        Check your email
      </AppText>
      <AppText style={[styles.subtitle, { color: secondarycolormode }]}>
        We sent a 6-digit code to {email}
      </AppText>

      <AppTextInput
        icon="numeric"
        placeholder="Enter 6-digit code"
        keyboardType="numeric"
        maxLength={6}
        onChangeText={setOtp}
        value={otp}
        style={{ backgroundColor: textinputcolor }}
        placeholderTextColor={placeholder}
      />

      {error && <AppErrorText visible={true}>{error}</AppErrorText>}

      {loading ? (
        <ActivityIndicator
          size="small"
          color={colors.secondary}
          style={{ marginTop: 20 }}
        />
      ) : (
        <AppButton
          title="Verify Account"
          onPress={handleVerifyOtp}
          disabled={otp.length !== 6}
          textColor={colors.white}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: "center",
  },
  title: {
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
});

export default VerifyOtpScreen;

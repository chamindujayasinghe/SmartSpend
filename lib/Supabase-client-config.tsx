import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://elitsbvotlouwtzjdzlw.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaXRzYnZvdGxvdXd0empkemx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyOTQwNDUsImV4cCI6MjA3Njg3MDA0NX0.cwvmkWVPJFRiWRxMSb1u1NVHNdvHhMdB--GHdyxdYa0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

console.log("Supabase client initialized.");

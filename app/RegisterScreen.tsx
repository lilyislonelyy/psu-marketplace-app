import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Firebase
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

const RegisterScreen: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    try {
      // สมัครสมาชิก
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // สร้าง document ใน Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        // ✅ ตั้งชื่อ default เป็น user + 6 ตัวแรกของ uid
        name: "user" + user.uid.substring(0, 6),
        faculty: "",
        phone: "",
        instagram: "",
        createdAt: new Date(),
      });

      Alert.alert("Success", "Account created for " + user.email);
      router.push("/SigninScreen"); // ไปหน้า Sign in
    } catch (error: any) {
      Alert.alert("Registration Error", error.message);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={["#AAFFE7", "#638CF2", "#0D00FF"]}
        style={styles.container}
      >
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Image
                source={require("../assets/CartLogo.png") as ImageSourcePropType}
                style={styles.logoImage}
              />
              <TouchableOpacity onPress={() => router.push("/LoginScreen")}>
                <Text style={styles.logoText}>PSU Market place</Text>
              </TouchableOpacity>
            </View>
            
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.title}>Create Account</Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            {/* Sign up */}
            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleRegister}
            >
              <Text style={styles.signupText}>Sign up</Text>
            </TouchableOpacity>

            {/* Already have account */}
            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => router.push("/SigninScreen")}
            >
              <Text style={styles.switchText}>Already have an account</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    marginTop: 10,
    marginHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoRow: { flexDirection: "row", alignItems: "center" },
  logoImage: { width: 28, height: 28, marginRight: 8, tintColor: "#fff" },
  logoText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  langIcon: { width: 28, height: 28, tintColor: "#fff" },
  form: { flex: 1, marginTop: 60, paddingHorizontal: 30 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 40,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    fontSize: 14,
    color: "#333",
  },
  signupButton: {
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#fff",
    paddingVertical: 14,
    marginTop: 10,
    alignItems: "center",
  },
  signupText: { color: "#fff", fontWeight: "600" },
  switchButton: {
    borderRadius: 30,
    backgroundColor: "#fff",
    paddingVertical: 14,
    marginTop: 16,
    alignItems: "center",
  },
  switchText: { color: "#000", fontWeight: "600" },
});

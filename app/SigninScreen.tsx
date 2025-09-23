import { LinearGradient } from "expo-linear-gradient";
import { Link, Stack } from "expo-router";
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
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

const SigninScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "Welcome back " + userCredential.user.email);
      // 👉 หลังจาก login สำเร็จสามารถ Redirect ไป Home หรือ Tabs ได้
    } catch (error: any) {
      Alert.alert("Login Error", error.message);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={["#AAFFE7", "#638CF2", "#0D00FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
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
              <Text style={styles.logoText}>PSU Market place</Text>
            </View>
            <TouchableOpacity>
              <Image
                source={require("../assets/Language.png") as ImageSourcePropType}
                style={styles.langIcon}
              />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.title}>Login</Text>

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

            <TouchableOpacity style={styles.signinButton} onPress={handleSignin}>
              <Text style={styles.signinText}>Sign in</Text>
            </TouchableOpacity>

            {/* 👉 ลิงก์ไป RegisterScreen */}
            <Link href="/RegisterScreen" asChild>
              <TouchableOpacity style={styles.switchButton}>
                <Text style={styles.switchText}>Create new account</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

export default SigninScreen;

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
  signinButton: {
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#fff",
    paddingVertical: 14,
    marginTop: 10,
    alignItems: "center",
  },
  signinText: { color: "#fff", fontWeight: "600" },
  switchButton: {
    borderRadius: 30,
    backgroundColor: "#fff",
    paddingVertical: 14,
    marginTop: 16,
    alignItems: "center",
  },
  switchText: { color: "#000", fontWeight: "600" },
});

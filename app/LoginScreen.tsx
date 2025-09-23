import { LinearGradient } from "expo-linear-gradient";

import { Link, useRouter } from "expo-router";
import React from "react";
import {
    Image,
    ImageSourcePropType,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// กำหนด type ของ props
interface LoginScreenProps {
    onSuccess?: () => void;
}

export default function LoginScreen({ onSuccess }: LoginScreenProps) {
    const handleSignIn = (provider: string) => {
        // TODO: ใส่โค้ด auth ของจริง
        onSuccess && onSuccess();
    };

    const router = useRouter()

    return (
        <LinearGradient
            colors={["#AAFFE7", "#638CF2", "#0D00FF"]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.container}
        >
            {/* ปุ่มเปลี่ยนภาษา มุมขวาบน */}
            <TouchableOpacity
                style={styles.langButton}
                onPress={() => alert("Change Language")}
            >
                <Image
                    source={require("../assets/Language.png") as ImageSourcePropType}
                    style={styles.langIcon}
                />
            </TouchableOpacity>

            {/* โลโก้ + ข้อความ 2 บรรทัด */}
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.logoRow}>
                    <Image
                        source={require("../assets/CartLogo.png") as ImageSourcePropType}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                    <View>
                        <Text style={styles.logoTextTop}>PSU</Text>
                        <Text style={styles.logoTextBottom}>Market place</Text>
                    </View>
                </View>

                <View style={styles.bottomSection}>
                    {/* Terms */}
                    <Text style={styles.terms}>
                        By tapping Create Account or Sign In, you agree to our
                        <Text style={styles.link}> Terms</Text>. Learn how we process your
                        data in our
                        <Text style={styles.link}> Privacy Policy</Text> and
                        <Text style={styles.link}> Cookies Policy</Text>.
                    </Text>

                    {/* ปุ่ม PSU Passport → ไปหน้า SigninScreen */}
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.push("/SigninScreen")} // หรือ "/auth/SigninScreen"
                    >
                        <Text style={styles.buttonText}>SIGN IN TO PSU MARKETPLACE</Text>
                    </TouchableOpacity>

                    {/* ปุ่ม Google */}
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => handleSignIn("google")}
                    >
                        <Text style={styles.buttonText}>SIGN IN WITH GOOGLE</Text>
                    </TouchableOpacity>

                    {/* ปุ่ม Apple */}
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => handleSignIn("apple")}
                    >
                        <Text style={styles.buttonText}>SIGN IN WITH APPLE</Text>
                    </TouchableOpacity>

                    {/* Sign up link */}
                    <Text style={styles.signup}>
                        Don’t have an account?{" "}
                        <Link href="/RegisterScreen" style={styles.link}>
                            Sign up
                        </Link>
                    </Text>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        alignItems: "center",
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 20,
    },
    langButton: {
        position: "absolute",
        top: 70,
        right: 30,
    },
    langIcon: {
        width: 28,
        height: 28,
    },
    logoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 250,
        marginBottom: 40,
        justifyContent: "center",
    },
    logoImage: {
        width: 50,
        height: 50,
        marginRight: 12,
    },
    logoTextTop: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
    },
    logoTextBottom: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
    },
    bottomSection: {
        flex: 1,
        justifyContent: "flex-end",
        marginBottom: 40,
        alignItems: "center",
    },
    terms: {
        color: "#fff",
        fontSize: 12,
        textAlign: "center",
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    link: {
        textDecorationLine: "underline",
        fontWeight: "600",
    },
    button: {
        width: "100%",
        paddingVertical: 14,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: "#fff",
        marginBottom: 15,
        alignItems: "center",
    },
    buttonText: {
        textAlign: "center",
        color: "#fff",
        fontWeight: "600",
    },
    signup: {
        marginTop: 20,
        marginBottom: 10,
        color: "#fff",
    },
});

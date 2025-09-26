import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../firebaseConfig"; // ✅ config ที่คุณสร้างไว้

const ProfileScreen: React.FC = () => {
    const [tab, setTab] = useState<"post" | "history">("post");
    const [userData, setUserData] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const user = auth.currentUser; // ผู้ใช้ที่ login อยู่
            if (!user) return;

            try {
                const ref = doc(db, "users", user.uid);
                const snap = await getDoc(ref);
                if (snap.exists()) {
                    setUserData(snap.data());
                }
            } catch (err) {
                console.error("❌ Error fetching user:", err);
            }
        };

        fetchUser();
    }, []);

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header Gradient */}
            <LinearGradient
                colors={["#AAFFE7", "#638CF2", "#0D00FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>My profile</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Profile Info */}
                <View style={styles.profileRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.name}>
                            {userData?.name || "Loading..."}
                        </Text>
                        <Text style={styles.faculty}>
                            {userData?.faculty || "Faculty / Department"}
                        </Text>
                        <Text style={styles.instagram}>
                            {userData?.instagram || ""}
                        </Text>
                    </View>
                    <Image
                        source={
                            userData?.photoURL
                                ? { uri: userData.photoURL }
                                : require("../../assets/Profile.png") // fallback ถ้ายังไม่มี
                        }
                        style={styles.avatar}
                    />
                </View>

                {/* Buttons */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => router.push("../EditProfile")}
                    >
                        <Text style={styles.editButtonText}>Edit profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.editButton}>
                        <Text style={styles.editButtonText}>Share profile</Text>
                    </TouchableOpacity>
                </View>
                {/* Divider */}
                <View style={styles.divider} />

                {/* Tabs (ยังใช้ mock data ได้เหมือนเดิม หรือจะดึง products จาก Firestore ทีหลังก็ได้) */}
            </ScrollView>
        </SafeAreaView>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#fff" },
    header: {
        height: 80,
        flexDirection: "row",
        alignItems: "center",   // 👉 จัดให้แนวตั้งอยู่ตรงกลาง header
        justifyContent: "space-between",
        paddingHorizontal: 16,
    },
    headerTitle: {
        flex: 1,
        textAlign: "center",
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
    },
    content: { padding: 16 },

    profileRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        marginTop: 10,
    },
    name: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
    faculty: { color: "gray", marginBottom: 2 },
    instagram: { color: "#3366cc" },
    avatar: { width: 70, height: 70, borderRadius: 35 },

    buttonRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
        gap: 10,
    },
    editButton: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    editButtonText: { fontWeight: "600" },

    tabs: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        marginBottom: 12,
    },
    tabItem: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
    },
    tabText: { fontSize: 16, color: "gray" },
    activeTab: { borderBottomWidth: 2, borderBottomColor: "#2C32FA" },
    activeTabText: { color: "#000", fontWeight: "700" },

    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    cardAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
    cardName: { fontWeight: "bold" },
    cardSub: { fontSize: 12, color: "gray" },
    cardImage: {
        width: "100%",
        height: 180,
        borderRadius: 12,
        resizeMode: "cover",
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        marginVertical: 5,
    },

});

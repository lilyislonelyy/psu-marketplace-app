import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


// Firebase
import * as ImagePicker from "expo-image-picker";
import { signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { auth, db } from "../firebaseConfig";

const storage = getStorage();

export default function EditProfile() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [faculty, setFaculty] = useState("");
    const [phone, setPhone] = useState("");
    const [instagram, setInstagram] = useState("");
    const [photoURL, setPhotoURL] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const user = auth.currentUser;
            if (!user) return;
            try {
                const ref = doc(db, "users", user.uid);
                const snap = await getDoc(ref);
                if (snap.exists()) {
                    const data = snap.data();
                    setName(data.name || "");
                    setFaculty(data.faculty || "");
                    setPhone(data.phone || "");
                    setInstagram(data.instagram || "");
                    setPhotoURL(data.photoURL || null);
                }
            } catch (err) {
                console.error("Error fetching user:", err);
            }
        };
        fetchUser();
    }, []);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"], // ✅ ใช้ string array แทน
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            await uploadImage(uri);
        }
    };

    const uploadImage = async (uri: string) => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            // แปลงไฟล์เป็น blob
            const response = await fetch(uri);
            const blob = await response.blob();

            // path: profile_images/{uid}/profile.jpg
            const fileRef = ref(storage, `profile_images/${user.uid}/profile.jpg`);

            await uploadBytes(fileRef, blob);
            const downloadURL = await getDownloadURL(fileRef);

            // อัปเดต Firestore
            await updateDoc(doc(db, "users", user.uid), {
                photoURL: downloadURL,
            });

            setPhotoURL(downloadURL);
            Alert.alert("Success", "Profile image updated!");
        } catch (err: any) {
            Alert.alert("Upload Error", err.message);
        }
    };


    // ✅ Save profile
    const handleSave = async () => {
        const user = auth.currentUser;
        if (!user) return;
        try {
            const ref = doc(db, "users", user.uid);
            await updateDoc(ref, {
                name,
                faculty,
                phone,
                instagram,
            });
            Alert.alert("Success", "Profile updated!");
            router.replace("/(tabs)/profile");
        } catch (err: any) {
            Alert.alert("Error", err.message);
        }
    };

    // ✅ Logout
    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.replace("/LoginScreen"); // ไปหน้า LoginScreen
        } catch (error: any) {
            console.error("Logout Error:", error.message);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <LinearGradient
                colors={["#AAFFE7", "#638CF2", "#0D00FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Edit profile</Text>
                <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => router.replace("/(tabs)/profile")}
                >
                    <Ionicons name="close" size={26} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>

            {/* Content */}
            <ScrollView contentContainerStyle={styles.content}>
                {/* Avatar */}
                <View style={styles.avatarWrap}>
                    <Image
                        source={
                            photoURL
                                ? { uri: photoURL }
                                : require("../assets/Profile.png") // default
                        }
                        style={styles.avatar}
                    />
                    <TouchableOpacity style={styles.avatarEdit} onPress={pickImage}>
                        <Ionicons name="camera" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Info fields */}
                <View style={styles.field}>
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your name"
                        placeholderTextColor="#aaa"
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Faculty / Department</Text>
                    <TextInput
                        style={styles.input}
                        value={faculty}
                        onChangeText={setFaculty}
                        placeholder="Faculty / Department"
                        placeholderTextColor="#aaa"
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Phone number</Text>
                    <TextInput
                        style={styles.input}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Phone number"
                        keyboardType="phone-pad"
                        placeholderTextColor="#aaa"
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Instagram</Text>
                    <TextInput
                        style={styles.input}
                        value={instagram}
                        onChangeText={setInstagram}
                        placeholder="@username"
                        placeholderTextColor="#aaa"
                    />
                </View>

                {/* Save button */}
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveText}>Save Changes</Text>
                </TouchableOpacity>

                {/* Logout */}
                <TouchableOpacity style={styles.logout} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={22} color="black" />
                    <Text style={styles.logoutText}>Log out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#fff" },
    header: {
        height: 80,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
    },
    closeBtn: {
        position: "absolute",
        right: 16,
    },
    content: { padding: 20, alignItems: "center" },

    avatarWrap: { marginVertical: 20 },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#ddd",
    },
    avatarEdit: {
        position: "absolute",
        right: 0,
        bottom: 0,
        backgroundColor: "#000",
        borderRadius: 12,
        padding: 4,
    },

    field: {
        width: "100%",
        marginBottom: 20,
    },
    label: { fontSize: 13, color: "#aaa", marginBottom: 4 },
    input: {
        borderWidth: 1,
        borderColor: "#aaa",
        borderRadius: 8,
        padding: 10,
        fontSize: 15,
        color: "#000",
    },

    saveButton: {
        backgroundColor: "#4C6EF5",
        paddingVertical: 14,
        borderRadius: 8,
        width: "100%",
        alignItems: "center",
        marginTop: 10,
    },
    saveText: { color: "#fff", fontWeight: "700", fontSize: 16 },

    logout: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 30,
    },
    logoutText: { fontSize: 16, marginLeft: 6 },
});

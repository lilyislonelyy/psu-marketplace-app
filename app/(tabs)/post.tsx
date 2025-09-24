import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PostScreen: React.FC = () => {
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [location, setLocation] = useState("");
    const [type, setType] = useState("");
    const [quantity, setQuantity] = useState("");

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
            {/* Header Gradient */}
            <LinearGradient
                colors={["#AAFFE7", "#638CF2", "#0D00FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.header}
            >
                {/* ซ้าย (เว้นไว้ให้บาลานซ์) */}
                <View style={{ flex: 1 }} />

                {/* Title */}
                <Text style={styles.headerTitle}>New post</Text>

                {/* ปุ่มขวา */}
                <TouchableOpacity style={{ flex: 1, alignItems: "flex-end" }}>
                    <Text style={styles.headerAction}>Post</Text>
                </TouchableOpacity>
            </LinearGradient>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Upload Image */}
                <TouchableOpacity style={styles.imageUpload}>
                    <Image
                        source={require("../../assets/post/AddPhoto.png")}
                        style={styles.plusIcon}
                    />
                </TouchableOpacity>

                {/* Description */}
                <TextInput
                    placeholder="Add a description..."
                    style={styles.input}
                    value={description}
                    onChangeText={setDescription}
                />

                {/* Price */}
                <View style={styles.row}>
                    <Image
                        source={require("../../assets/post/Price.png")}
                        style={styles.icon}
                    />
                    <TextInput
                        placeholder="Price"
                        keyboardType="numeric"
                        style={styles.rowInput}
                        value={price}
                        onChangeText={setPrice}
                    />
                </View>

                {/* Location */}
                <View style={styles.row}>
                    <Image
                        source={require("../../assets/post/Location.png")}
                        style={styles.icon}
                    />
                    <TextInput
                        placeholder="Location"
                        style={styles.rowInput}
                        value={location}
                        onChangeText={setLocation}
                    />
                </View>

                {/* Product type */}
                <View style={styles.row}>
                    <Image
                        source={require("../../assets/post/Type.png")}
                        style={styles.icon}
                    />
                    <TextInput
                        placeholder="Product type (Used / New)"
                        style={styles.rowInput}
                        value={type}
                        onChangeText={setType}
                    />
                </View>

                {/* Quantity */}
                <View style={styles.row}>
                    <Image
                        source={require("../../assets/post/Quantity.png")}
                        style={styles.icon}
                    />
                    <TextInput
                        placeholder="Quantity"
                        keyboardType="numeric"
                        style={styles.rowInput}
                        value={quantity}
                        onChangeText={setQuantity}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default PostScreen;

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#fff" },

    header: {
        height: 90,
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
    headerAction: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    postBtn: {
        position: "absolute",
        right: 16,
        bottom: 12,
    },
    
    content: { padding: 16 },

    imageUpload: {
        width: "100%",
        height: 220,
        borderRadius: 16,
        backgroundColor: "#eee",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    plusIcon: { width: 48, height: 48, tintColor: "#999" },

    input: {
        borderWidth: 1,
        borderColor: "#aaa", // เข้มขึ้น
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 20,
        color: "#333",
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#aaa", // เข้มขึ้น
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 56,
    },
    icon: { width: 22, height: 22, marginRight: 10, tintColor: "#666" },
    rowInput: { flex: 1, fontSize: 16, color: "#333" },
});

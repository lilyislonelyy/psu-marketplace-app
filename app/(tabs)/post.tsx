import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import React, { useState } from "react";
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../firebaseConfig";

const storage = getStorage();

const PostScreen: React.FC = () => {
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [location, setLocation] = useState("");
    const [type, setType] = useState("");
    const [quantity, setQuantity] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [showPicker, setShowPicker] = useState(false);

    // 📌 เลือกรูป
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImages([...images, result.assets[0].uri]);
        }
    };

    // 📌 อัปโหลดรูป + Post
    const handlePost = async () => {
  if (!description.trim()) {
    Alert.alert("Error", "กรุณาใส่คำอธิบายสินค้า");
    return;
  }

  if (!price || isNaN(Number(price)) || Number(price) < 0) {
    Alert.alert("Error", "กรุณาใส่ราคา และราคาต้องมากกว่าหรือเท่ากับ 0");
    return;
  }

  if (!type || (type !== "Used" && type !== "New")) {
    Alert.alert("Error", "กรุณาเลือกประเภทสินค้า (มือหนึ่งหรือมือสอง)");
    return;
  }

  if (!quantity || isNaN(Number(quantity)) || Number(quantity) < 1) {
    Alert.alert("Error", "กรุณาใส่จำนวนสินค้า และต้องมากกว่าหรือเท่ากับ 1");
    return;
  }

  if (images.length === 0) {
    Alert.alert("Error", "กรุณาเลือกรูปสินค้าอย่างน้อย 1 รูป");
    return;
  }

  try {
    const user = auth.currentUser;
    if (!user) return;

    // 👉 ดึงชื่อจาก users collection
    let sellerName = user.email; // fallback = email
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      sellerName = userDoc.data().name || sellerName;
    }

    // 1) upload รูปทั้งหมด
    const uploadedUrls: string[] = [];
    for (const uri of images) {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileRef = ref(storage, `product_images/${Date.now()}.jpg`);
      await uploadBytes(fileRef, blob);
      const url = await getDownloadURL(fileRef);
      uploadedUrls.push(url);
    }

    // 2) save product ลง Firestore
    await addDoc(collection(db, "products"), {
      seller_id: user.uid,
      seller_name: sellerName, // 👈 เก็บชื่อผู้ขาย
      title: description.split(" ")[0] || "Untitled",
      description,
      price: Number(price),
      quantity: Number(quantity),
      type,
      location,
      image_urls: uploadedUrls,
      is_sold_out: false,
      createdAt: serverTimestamp(),
    });

    Alert.alert("Success", "โพสต์สินค้าสำเร็จ!");
    setDescription("");
    setPrice("");
    setLocation("");
    setType("");
    setQuantity("");
    setImages([]);
  } catch (err: any) {
    Alert.alert("Error", err.message);
  }
};
    



    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
            {/* Header Gradient */}
            <LinearGradient
                colors={["#AAFFE7", "#638CF2", "#0D00FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.header}
            >
                <View style={{ flex: 1 }} />
                <Text style={styles.headerTitle}>New post</Text>
                <TouchableOpacity
                    style={{ flex: 1, alignItems: "flex-end" }}
                    onPress={handlePost}
                >
                    <Text style={styles.headerAction}>Post</Text>
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Upload Image */}
                {/* Upload Image */}
                {images.length === 0 ? (
                    // ถ้ายังไม่มีรูป → แสดงช่องใหญ่
                    <TouchableOpacity style={styles.imageUploadBig} onPress={pickImage}>
                        <Image
                            source={require("../../assets/post/AddPhoto.png")}
                            style={{ width: 80, height: 80, tintColor: "#999" }}
                            resizeMode="contain"
                        />
                        <Text style={{ color: "#666", marginTop: 8 }}>Add Photo</Text>
                    </TouchableOpacity>
                ) : (
                    // ถ้ามีรูปแล้ว → แสดงแบบแถวเล็ก
                    <ScrollView
                        horizontal
                        style={{ marginBottom: 20 }} // ✅ เพิ่มระยะห่างกับ Description
                        showsHorizontalScrollIndicator={false}
                    >
                        {images.map((uri, idx) => (
                            <View key={idx} style={styles.imageWrap}>
                                <Image source={{ uri }} style={styles.previewImage} />

                                {/* ปุ่มลบ */}
                                <TouchableOpacity
                                    style={styles.deleteBtn}
                                    onPress={() => {
                                        const newImages = images.filter((_, i) => i !== idx);
                                        setImages(newImages);
                                    }}
                                >
                                    <Text style={{ color: "#fff", fontWeight: "bold" }}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))}

                        {/* ปุ่มเพิ่มรูปเล็ก */}
                        <TouchableOpacity style={styles.imageUploadSmall} onPress={pickImage}>
                            <Text style={{ fontSize: 40, color: "#999" }}>+</Text>
                        </TouchableOpacity>
                    </ScrollView>
                )}


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
                        placeholder="Price(฿)"
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
                        style={{ width: 18, height: 22, marginRight: 10, tintColor: "#666" }}
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
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowPicker(true)}>
                        <Text style={{ fontSize: 16, color: type ? "#000" : "#aaa" }}>
                            {type || "Type"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Modal สำหรับเลือก */}
                <Modal visible={showPicker} transparent animationType="slide">
                    <View
                        style={{
                            flex: 1,
                            justifyContent: "flex-end",
                            backgroundColor: "rgba(0,0,0,0.5)",
                        }}
                    >
                        <View style={{ backgroundColor: "#fff", padding: 20 }}>
                            <Text
                                style={{
                                    fontSize: 18,
                                    fontWeight: "600",
                                    marginBottom: 10,
                                }}
                            >
                                Select product type
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setType("Used");
                                    setShowPicker(false);
                                }}
                            >
                                <Text style={{ fontSize: 16, padding: 10 }}>Used</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setType("New");
                                    setShowPicker(false);
                                }}
                            >
                                <Text style={{ fontSize: 16, padding: 10 }}>New</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowPicker(false)}>
                                <Text style={{ fontSize: 16, padding: 10, color: "red" }}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

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

    imageUploadBig: {
        width: "100%",
        height: 220,
        borderRadius: 16,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#ccc",
    },

    imageUploadSmall: {
        width: 120,
        height: 120,
        borderRadius: 12,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
    },

    imageWrap: {
        position: "relative",
        marginRight: 10,
    },
    previewImage: {
        width: 120,
        height: 120,
        borderRadius: 12,
    },
    deleteBtn: {
        position: "absolute",
        top: 5,
        right: 5,
        backgroundColor: "rgba(0,0,0,0.6)",
        borderRadius: 12,
        padding: 4,
    },

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
    icon: { width: 20, height: 20, marginRight: 10, tintColor: "#666" },
    rowInput: { flex: 1, fontSize: 16, color: "#333" },
});

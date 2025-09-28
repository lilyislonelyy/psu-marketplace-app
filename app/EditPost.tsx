import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react";
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
import { db } from "../firebaseConfig";

const storage = getStorage();

export default function EditPost() {
  const router = useRouter();
  const { postId } = useLocalSearchParams();

  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  // 📌 โหลดข้อมูลเก่า
  useEffect(() => {
    if (!postId) return;
    const fetchPost = async () => {
      try {
        const ref = doc(db, "products", postId as string);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setDescription(data.description || "");
          setPrice(String(data.price || ""));
          setLocation(data.location || "");
          setType(data.type || "");
          setQuantity(String(data.quantity || ""));
          setImages(data.image_urls || []);
        }
      } catch (err) {
        console.error("❌ Error loading post:", err);
      }
    };
    fetchPost();
  }, [postId]);

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

  // 📌 บันทึกการแก้ไข
  const handleSave = async () => {
    if (!postId) return;
    if (!description || !price || !type || !quantity) {
      Alert.alert("Error", "กรอกข้อมูลให้ครบ");
      return;
    }

    try {
      const uploadedUrls: string[] = [];

      for (const uri of images) {
        if (uri.startsWith("http")) {
          uploadedUrls.push(uri);
        } else {
          const response = await fetch(uri);
          const blob = await response.blob();
          const fileRef = ref(storage, `product_images/${Date.now()}.jpg`);
          await uploadBytes(fileRef, blob);
          const url = await getDownloadURL(fileRef);
          uploadedUrls.push(url);
        }
      }

      await updateDoc(doc(db, "products", postId as string), {
        description,
        price: Number(price),
        quantity: Number(quantity),
        type,
        location,
        image_urls: uploadedUrls,
        is_sold_out: Number(quantity) <= 0,
        updatedAt: serverTimestamp(),
      });

      Alert.alert("Success", "อัปเดตโพสต์สำเร็จ!");
      router.replace("/(tabs)/profile");
    } catch (err: any) {
      Alert.alert("Error", err.message);
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
        <View style={{ flex: 1 }} />
        <Text style={styles.headerTitle}>Edit post</Text>
        <TouchableOpacity
          style={{ flex: 1, alignItems: "flex-end" }}
          onPress={handleSave}
        >
          <Text style={styles.headerAction}>Save</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Images */}
        {images.length === 0 ? (
          <TouchableOpacity style={styles.imageUploadBig} onPress={pickImage}>
            <Image
              source={require("../assets/post/AddPhoto.png")}
              style={{ width: 80, height: 80, tintColor: "#999" }}
              resizeMode="contain"
            />
            <Text style={{ color: "#666", marginTop: 8 }}>Add Photo</Text>
          </TouchableOpacity>
        ) : (
          <ScrollView
            horizontal
            style={{ marginBottom: 20 }}
            showsHorizontalScrollIndicator={false}
          >
            {images.map((uri, idx) => (
              <View key={idx} style={styles.imageWrap}>
                <Image source={{ uri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => {
                    setImages(images.filter((_, i) => i !== idx));
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.imageUploadSmall} onPress={pickImage}>
              <Text style={{ fontSize: 40, color: "#999" }}>+</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Description */}
        <View style={styles.row}>
          <TextInput
            placeholder="Add a description..."
            style={styles.rowInput}
            value={description}
            onChangeText={setDescription}
            placeholderTextColor="#aaa"
          />
        </View>

        {/* Price */}
        <View style={styles.row}>
          <Image
            source={require("../assets/post/Price.png")}
            style={styles.icon}
          />
          <TextInput
            placeholder="Price(฿)"
            keyboardType="numeric"
            style={styles.rowInput}
            value={price}
            onChangeText={setPrice}
            placeholderTextColor="#aaa"
          />
        </View>

        {/* Location */}
        <View style={styles.row}>
          <Image
            source={require("../assets/post/Location.png")}
            style={{ width: 18, height: 22, marginRight: 10, tintColor: "#666" }}
          />
          <TextInput
            placeholder="Location"
            style={styles.rowInput}
            value={location}
            onChangeText={setLocation}
            placeholderTextColor="#aaa"
          />
        </View>

        {/* Product type */}
        <View style={styles.row}>
          <Image
            source={require("../assets/post/Type.png")}
            style={styles.icon}
          />
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowPicker(true)}>
            <Text style={{ fontSize: 16, color: type ? "#000" : "#aaa" }}>
              {type || "Type"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Modal */}
        <Modal visible={showPicker} transparent animationType="slide">
          <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
            <View style={{ backgroundColor: "#fff", padding: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 10 }}>
                Select product type
              </Text>
              <TouchableOpacity onPress={() => { setType("Used"); setShowPicker(false); }}>
                <Text style={{ fontSize: 16, padding: 10 }}>Used</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setType("New"); setShowPicker(false); }}>
                <Text style={{ fontSize: 16, padding: 10 }}>New</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={{ fontSize: 16, padding: 10, color: "red" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Quantity */}
        <View style={styles.row}>
          <Image
            source={require("../assets/post/Quantity.png")}
            style={styles.icon}
          />
          <TextInput
            placeholder="Quantity"
            keyboardType="numeric"
            style={styles.rowInput}
            value={quantity}
            onChangeText={setQuantity}
            placeholderTextColor="#aaa"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 80,
    flexDirection: "row",
    alignItems: "center",
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
  headerAction: { fontSize: 16, fontWeight: "600", color: "#fff" },
  content: { padding: 16 },
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
  imageWrap: { position: "relative", marginRight: 10 },
  previewImage: { width: 120, height: 120, borderRadius: 12 },
  deleteBtn: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    padding: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 56,
  },
  icon: { width: 20, height: 20, marginRight: 10, tintColor: "#666" },
  rowInput: { flex: 1, fontSize: 16, color: "#333" },
});

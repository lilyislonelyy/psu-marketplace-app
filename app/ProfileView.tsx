import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../firebaseConfig";

const ProfileView: React.FC = () => {
  const { uid } = useLocalSearchParams(); // uid ของ seller
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // ✅ โหลดข้อมูลผู้ขาย
  useEffect(() => {
    if (!uid) return;
    const fetchUser = async () => {
      try {
        const ref = doc(db, "users", uid as string);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setUserData(snap.data());
        }
      } catch (err) {
        console.error("❌ Error fetching user:", err);
      }
    };
    fetchUser();
  }, [uid]);

  // ✅ โหลดโพสต์ของ seller (เฉพาะที่ยังมีสินค้าเหลือ)
  useEffect(() => {
    if (!uid) return;
    const fetchProducts = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("seller_id", "==", uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        const items: any[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.quantity > 0) { // filter client-side
            items.push({ id: docSnap.id, ...data });
          }
        });
        setProducts(items);
      } catch (err) {
        console.error("❌ Error fetching products:", err);
      }
    };
    fetchProducts();
  }, [uid]);

  // ✅ โหลด favorites ของ user ที่ login อยู่
  useEffect(() => {
    const fetchFavorites = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const favSnap = await getDocs(
          collection(db, "favorites", user.uid, "items")
        );
        const favIds: string[] = [];
        favSnap.forEach((docSnap) => favIds.push(docSnap.id));
        setFavorites(favIds);
      } catch (err) {
        console.error("❌ Error fetching favorites:", err);
      }
    };
    fetchFavorites();
  }, []);

  // ✅ toggle Add/Remove favorite
  const toggleFavorite = async (post: any) => {
    const user = auth.currentUser;
    if (!user) return;

    const favRef = doc(db, "favorites", user.uid, "items", post.id);

    try {
      if (favorites.includes(post.id)) {
        await deleteDoc(favRef);
        setFavorites(favorites.filter((id) => id !== post.id));
        Alert.alert("Removed", "สินค้านี้ถูกลบออกจาก favorites แล้ว");
      } else {
        await setDoc(favRef, {
          ...post,
          addedAt: new Date(),
        });
        setFavorites([...favorites, post.id]);
        Alert.alert("Added", "เพิ่มสินค้าไปที่ favorites แล้ว");
      }
    } catch (err) {
      console.error("❌ Error toggling favorite:", err);
      Alert.alert("Error", "ไม่สามารถอัปเดต favorites ได้");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header gradient */}
      <LinearGradient
        colors={["#AAFFE7", "#638CF2", "#0D00FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        {/* ปุ่ม X */}
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 28 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* ข้อมูลโปรไฟล์ */}
        <View style={styles.profileRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{userData?.name || "Loading..."}</Text>
            <Text style={styles.faculty}>
              {userData?.faculty || "Faculty / Department"}
            </Text>
            <Text style={styles.instagram}>{userData?.instagram || ""}</Text>
          </View>
          <Image
            source={
              userData?.photoURL
                ? { uri: userData.photoURL }
                : require("../assets/Profile.png")
            }
            style={styles.avatar}
          />
        </View>

        <View style={styles.divider} />

        {/* Posts */}
        {products.map((p) => (
          <View key={p.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Image
                source={
                  userData?.photoURL
                    ? { uri: userData.photoURL }
                    : require("../assets/Profile.png")
                }
                style={styles.cardAvatar}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardName}>{userData?.name}</Text>
                <Text style={styles.cardSub}>
                  {p.type} • {p.quantity} pcs
                </Text>
              </View>

              {/* ปุ่ม Add/Added */}
              <TouchableOpacity
                onPress={() => toggleFavorite(p)}
                style={styles.orderBtn}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  {favorites.includes(p.id) ? "Added" : "Add"}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 10 }}
            >
              {p.image_urls?.map((url: string, i: number) => (
                <Image key={i} source={{ uri: url }} style={styles.cardImage} />
              ))}
            </ScrollView>

            <Text style={{ marginTop: 8 }}>{p.description}</Text>
            <Text style={{ marginTop: 4, fontWeight: "600" }}>{p.price}฿</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileView;

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
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  closeBtn: { padding: 8 },
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
  divider: { borderBottomWidth: 1, borderBottomColor: "#ddd", marginVertical: 5 },
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
    width: 300,
    height: 200,
    borderRadius: 12,
    resizeMode: "cover",
    marginRight: 10,
  },
  orderBtn: {
    backgroundColor: "#0D00FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
});

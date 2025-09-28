import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { deleteObject, getStorage, ref } from "firebase/storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native"; // ✅ ใช้ hook นี้
import { auth, db } from "../../firebaseConfig";

const storage = getStorage();

const ProfileScreen: React.FC = () => {
  const [tab, setTab] = useState<"post" | "history">("post");
  const [userData, setUserData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const router = useRouter();
  const isFocused = useIsFocused(); // ✅ ตรวจว่าอยู่หน้า Profile หรือไม่

  // โหลดข้อมูลผู้ใช้
  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
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

  // โหลดโพสต์ใหม่ทุกครั้งที่เข้ามาหน้า Profile
  useEffect(() => {
    const fetchProducts = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const q = query(
          collection(db, "products"),
          where("seller_id", "==", user.uid)
        );
        const snap = await getDocs(q);
        const items: any[] = [];
        snap.forEach((docSnap) =>
          items.push({ id: docSnap.id, ...docSnap.data() })
        );

        // 👉 จัดเรียงตาม createdAt (ล่าสุดขึ้นก่อน)
        items.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });

        setProducts(items);
      } catch (err) {
        console.error("❌ Error fetching products:", err);
      }
    };

    if (isFocused) {
      fetchProducts(); // ✅ refresh ทุกครั้งที่กลับมา
    }
  }, [isFocused]);

  // กด ⋮
  const openMenu = (post: any) => {
    setSelectedPost(post);
    setShowMenu(true);
  };

  // แก้ไขโพสต์
  const handleEdit = () => {
    if (selectedPost) {
      setShowMenu(false);
      router.push({
        pathname: "../EditPost",
        params: { postId: selectedPost.id },
      });
    }
  };

  // ลบโพสต์
  const handleDelete = async () => {
    if (!selectedPost) return;

    Alert.alert("Confirm Delete", "คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์นี้?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            // 1. ลบไฟล์รูปจาก Storage
            if (selectedPost.image_urls?.length) {
              for (const url of selectedPost.image_urls) {
                try {
                  const path = url.split("/o/")[1].split("?")[0];
                  const fileRef = ref(storage, decodeURIComponent(path));
                  await deleteObject(fileRef);
                } catch (err) {
                  console.warn("⚠️ ลบไฟล์ไม่สำเร็จ:", err);
                }
              }
            }

            // 2. ลบ document ใน Firestore
            await deleteDoc(doc(db, "products", selectedPost.id));

            // 3. อัปเดต state
            setProducts(products.filter((p) => p.id !== selectedPost.id));
            setShowMenu(false);
            Alert.alert("Deleted", "โพสต์ถูกลบเรียบร้อยแล้ว ✅");
          } catch (err: any) {
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
  };

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
                : require("../../assets/Profile.png")
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
          <TouchableOpacity
            style={styles.editButton}
            onPress={async () => {
              const user = auth.currentUser;
              if (!user) return;

              const profileUrl = `https://psu-marketplace-app.vercel.app/user/${user.uid}`;
              await Clipboard.setStringAsync(profileUrl);

              Alert.alert("Copied!", "Profile link copied to clipboard ✅");
            }}
          >
            <Text style={styles.editButtonText}>Share profile</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tabItem, tab === "post" && styles.activeTab]}
            onPress={() => setTab("post")}
          >
            <Text
              style={[styles.tabText, tab === "post" && styles.activeTabText]}
            >
              Post
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, tab === "history" && styles.activeTab]}
            onPress={() => setTab("history")}
          >
            <Text
              style={[styles.tabText, tab === "history" && styles.activeTabText]}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>

        {/* Posts */}
        {tab === "post" &&
          products
            .filter((p) => p.quantity > 0)
            .map((p) => (
              <View key={p.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Image
                    source={
                      userData?.photoURL
                        ? { uri: userData.photoURL }
                        : require("../../assets/Profile.png")
                    }
                    style={styles.cardAvatar}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardName}>{userData?.name}</Text>
                    <Text style={styles.cardSub}>
                      {p.type} • {p.quantity} pcs
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => openMenu(p)}>
                    <Ionicons name="ellipsis-vertical" size={20} color="gray" />
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
              </View>
            ))}

        {tab === "history" &&
          products
            .filter((p) => p.quantity === 0)
            .map((p) => (
              <View key={p.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Image
                    source={
                      userData?.photoURL
                        ? { uri: userData.photoURL }
                        : require("../../assets/Profile.png")
                    }
                    style={styles.cardAvatar}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardName}>{userData?.name}</Text>
                    <Text style={styles.cardSub}>Sold out</Text>
                  </View>
                  <TouchableOpacity onPress={() => openMenu(p)}>
                    <Ionicons name="ellipsis-vertical" size={20} color="gray" />
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
              </View>
            ))}
      </ScrollView>

      {/* Modal เมนูแก้ไข/ลบ */}
      <Modal transparent visible={showMenu} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuBox}>
            <TouchableOpacity onPress={handleEdit} style={styles.menuItem}>
              <Text style={styles.menuText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.menuItem}>
              <Text style={[styles.menuText, { color: "red" }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileScreen;

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
    width: 300,
    height: 200,
    borderRadius: 12,
    resizeMode: "cover",
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: 200,
  },
  menuItem: { paddingVertical: 12 },
  menuText: { fontSize: 16, fontWeight: "600", textAlign: "center" },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginVertical: 5,
  },
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
});

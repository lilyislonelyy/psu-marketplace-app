import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../firebaseConfig";
import { useIsFocused } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const Index: React.FC = () => {
  const router = useRouter();
  const isFocused = useIsFocused();

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [disliked, setDisliked] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const currentProduct = products[currentIndex];
  const images: string[] = currentProduct?.image_urls || [];

  // โหลดโปรไฟล์
  const fetchUserProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log("🔥 User profile data:", data); // Debug log
        setProfileImage(data.photoURL || null); // ✅ ใช้ photoURL ให้ตรงกับ EditProfile
      }
    } catch (err) {
      console.error("❌ Error fetching profile:", err);
    }
  };

  // โหลด favorites
  const fetchFavorites = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const snap = await getDocs(collection(db, "favorites", user.uid, "items"));
    const favIds: string[] = [];
    snap.forEach((docSnap) => favIds.push(docSnap.id));
    setFavorites(favIds);
  };

  // โหลดโพสต์
  const fetchProducts = async () => {
    const user = auth.currentUser;
    const q = query(
      collection(db, "products"),
      where("quantity", ">", 0),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);

    const items: any[] = [];
    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      if (user && data.seller_id === user.uid) continue;
      if (favorites.includes(docSnap.id)) continue;
      items.push({ id: docSnap.id, ...data });
    }
    setProducts(items);
    setCurrentIndex(0);
    setImageIndex(0);
  };

  useEffect(() => {
    if (isFocused) {
      fetchUserProfile();
      fetchFavorites().then(() => fetchProducts());
    }
  }, [isFocused]);

  // ---------- Slide ----------
  const animateSlide = (direction: "left" | "right", onEnd?: () => void) => {
    Animated.timing(slideAnim, {
      toValue: direction === "left" ? -width : width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      slideAnim.setValue(0);
      onEnd && onEnd();
    });
  };

  const nextProduct = () => {
    if (currentIndex < products.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setImageIndex(0);
    } else {
      setProducts([]);
    }
  };

  // ❌ Dislike
  const handleDislike = () => {
    if (!currentProduct) return;
    animateSlide("left", () => {
      setDisliked((prev) => [...prev, currentProduct]);
      nextProduct();
    });
  };

  // ✅ Like
  const handleAddToCart = async () => {
    if (!currentProduct) return;
    const user = auth.currentUser;
    if (!user) return;
    const favRef = doc(db, "favorites", user.uid, "items", currentProduct.id);
    await setDoc(favRef, { ...currentProduct, addedAt: new Date() });
    animateSlide("right", () => {
      setFavorites((prev) => [...prev, currentProduct.id]);
      nextProduct();
    });
  };

  const handleRefresh = () => {
    if (products.length === 0 && disliked.length > 0) {
      setProducts(disliked);
      setDisliked([]);
      setCurrentIndex(0);
    } else {
      fetchProducts();
    }
  };

  // ---------- Image navigation ----------
  const handleImageTap = (side: "left" | "right") => {
    if (!images.length) return;
    if (side === "right" && imageIndex < images.length - 1) {
      setImageIndex((prev) => prev + 1);
    }
    if (side === "left" && imageIndex > 0) {
      setImageIndex((prev) => prev - 1);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={
              profileImage
                ? { uri: profileImage } // ✅ โหลดจาก Firestore
                : require("../../assets/Profile.png") // default
            }
            style={styles.profileIcon}
          />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.headerTitle}>What are you looking for today?</Text>
            <Text style={styles.subTitle}>Welcome to PSU Market place</Text>
          </View>
        </View>

        {/* Product card */}
        {currentProduct ? (
          <Animated.View style={{ flex: 1, transform: [{ translateX: slideAnim }] }}>
            <ImageBackground
              source={{ uri: images[imageIndex] }}
              style={styles.productCard}
              imageStyle={{ borderRadius: 16 }}
            >
              {/* Progress bar */}
              <View style={styles.progressRow}>
                {images.map((_: string, idx: number) => (
                  <View
                    key={idx}
                    style={[
                      styles.progressBar,
                      { opacity: idx === imageIndex ? 1 : 0.3 },
                    ]}
                  />
                ))}
              </View>

              {/* Click zones */}
              <View style={styles.clickRow}>
                <Pressable style={{ flex: 1 }} onPress={() => handleImageTap("left")} />
                <Pressable style={{ flex: 1 }} onPress={() => handleImageTap("right")} />
              </View>

              {/* ข้อมูลสินค้า */}
              <View style={styles.productInfoWrapper}>
                <BlurView intensity={50} tint="dark" style={styles.productInfoOverlay} />
                <View style={styles.productInfo}>
                  <Text style={styles.productTitle}>
                    {currentProduct.description}{" "}
                    <Text style={styles.price}>({currentProduct.type})</Text>
                  </Text>
                  <Text style={styles.meta}>
                    {currentProduct.price}฿ • {currentProduct.quantity} pcs
                  </Text>
                </View>
              </View>

              {/* ปุ่ม action */}
              <View style={styles.actionRow}>
                <TouchableOpacity onPress={handleDislike}>
                  <Image
                    source={require("../../assets/home/X.png")}
                    style={styles.actionIcon}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleRefresh}>
                  <Image
                    source={require("../../assets/home/Refresh.png")}
                    style={styles.actionIcon}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAddToCart}>
                  <Image
                    source={require("../../assets/home/Cart.png")}
                    style={styles.actionIcon}
                  />
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </Animated.View>
        ) : (
          <View style={styles.emptyFeed}>
            <Text style={{ color: "gray", fontSize: 16 }}>No more products avaliable</Text>
            <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh}>
              <Text>Refresh Feed</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Index;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, padding: 16 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  headerTitle: { fontSize: 16, fontWeight: "600" },
  subTitle: { fontSize: 12, color: "gray" },
  profileIcon: { width: 40, height: 40, borderRadius: 20, resizeMode: "cover" },
  productCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    justifyContent: "flex-end",
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: "row",
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#fff",
    marginHorizontal: 2,
    borderRadius: 2,
  },
  clickRow: { ...StyleSheet.absoluteFillObject, flexDirection: "row" },
  productInfoWrapper: {
    position: "absolute",
    bottom: 90,
    left: 0,
    right: 0,
    borderRadius: 12,
    overflow: "hidden",
  },
  productInfoOverlay: { ...StyleSheet.absoluteFillObject },
  productInfo: { padding: 12 },
  productTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  price: { fontSize: 14, color: "#fff" },
  meta: { fontSize: 12, color: "#fff", marginTop: 2 },
  actionRow: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  actionIcon: { width: 60, height: 60, resizeMode: "contain" },
  emptyFeed: {
    flex: 1,
    marginTop: 40,
    borderRadius: 16,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  refreshBtn: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
});

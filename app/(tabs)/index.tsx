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
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../firebaseConfig";

// 👇 import เพิ่ม
import { useIsFocused } from "@react-navigation/native";

const { height } = Dimensions.get("window");

const Index: React.FC = () => {
  const router = useRouter();
  const isFocused = useIsFocused(); // ✅ detect focus
  const [products, setProducts] = useState<any[]>([]);
  const [disliked, setDisliked] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // โหลด favorites ของ user
  const fetchFavorites = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const snap = await getDocs(collection(db, "favorites", user.uid, "items"));
      const favIds: string[] = [];
      snap.forEach((docSnap) => favIds.push(docSnap.id));
      setFavorites(favIds);
    } catch (err) {
      console.error("❌ Error loading favorites:", err);
    }
  };

  // โหลดโพสต์ (ยกเว้นตัวเอง + ที่อยู่ใน favorites)
  const fetchProducts = async () => {
    try {
      const user = auth.currentUser;
      const q = query(
        collection(db, "products"),
        where("quantity", ">", 0),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);

      const items: any[] = [];
      const sellerCache: Record<string, string> = {};

      for (const docSnap of snap.docs) {
        const data = docSnap.data();

        if (user && data.seller_id === user.uid) continue; // ข้ามโพสต์ของตัวเอง
        if (favorites.includes(docSnap.id)) continue; // ข้ามโพสต์ที่ add แล้ว

        let sellerName = "Unknown";
        if (data.seller_id) {
          if (sellerCache[data.seller_id]) {
            sellerName = sellerCache[data.seller_id];
          } else {
            try {
              const sellerDoc = await getDoc(doc(db, "users", data.seller_id));
              if (sellerDoc.exists()) {
                sellerName = sellerDoc.data().name || sellerName;
                sellerCache[data.seller_id] = sellerName;
              }
            } catch (err) {
              console.warn("⚠️ Error fetching seller name:", err);
            }
          }
        }

        items.push({
          id: docSnap.id,
          ...data,
          seller_name: sellerName,
        });
      }

      setProducts(items);
      setCurrentIndex(0);
    } catch (err) {
      console.error("❌ Error loading products:", err);
    }
  };

  // ✅ โหลดใหม่ทุกครั้งที่ focus
  useEffect(() => {
    if (isFocused) {
      fetchFavorites().then(() => fetchProducts());
    }
  }, [isFocused]);

  const currentProduct = products[currentIndex];

  // ปัดซ้าย
  const handleDislike = () => {
    if (!currentProduct) return;
    setDisliked([...disliked, currentProduct]);
    nextProduct();
  };

  // ปัดขวา = add to favorites
  const handleAddToCart = async () => {
    if (!currentProduct) return;
    const user = auth.currentUser;
    if (!user) return;

    try {
      const favRef = doc(db, "favorites", user.uid, "items", currentProduct.id);

      await setDoc(favRef, {
        ...currentProduct,
        addedAt: new Date(),
      });

      console.log("✅ Added to favorites:", currentProduct.id);

      setFavorites((prev) => [...prev, currentProduct.id]);
      nextProduct();
    } catch (err) {
      console.error("❌ Error adding to favorites:", err);
    }
  };

  const nextProduct = () => {
    if (currentIndex < products.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setProducts([]);
    }
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

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require("../../assets/Profile.png") as ImageSourcePropType}
            style={styles.profileIcon}
          />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.headerTitle}>What are you looking for today?</Text>
            <Text style={styles.subTitle}>Welcome to PSU Market place</Text>
          </View>
          <Image
            source={require("../../assets/Notification.png") as ImageSourcePropType}
            style={styles.notifyIcon}
          />
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Image
            source={require("../../assets/Search.png") as ImageSourcePropType}
            style={styles.iconSmall}
          />
          <TextInput
            placeholder="Looking for something special?"
            style={{ flex: 1 }}
          />
          <Image
            source={require("../../assets/Filter.png") as ImageSourcePropType}
            style={styles.iconSmall}
          />
        </View>

        {/* Product card */}
        {currentProduct ? (
          <ImageBackground
            source={{ uri: currentProduct.image_urls?.[0] }}
            style={styles.productCard}
            imageStyle={{ borderRadius: 16 }}
          >
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

                <TouchableOpacity
                  style={styles.metaRow}
                  onPress={() =>
                    router.push({
                      pathname: "../ProfileView",
                      params: { uid: currentProduct.seller_id },
                    })
                  }
                >
                  <Image
                    source={require("../../assets/home/ShopName.png")}
                    style={styles.metaIcon}
                  />
                  <Text style={[styles.meta, { textDecorationLine: "underline" }]}>
                    Seller: {currentProduct.seller_name || "Unknown"}
                  </Text>
                </TouchableOpacity>

                <View style={styles.metaRow}>
                  <Image
                    source={require("../../assets/home/Location.png")}
                    style={styles.metaIcon}
                  />
                  <Text style={styles.meta}>
                    {currentProduct.location || "Faculty / Department / Address"}
                  </Text>
                </View>
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
        ) : (
          <View style={styles.emptyFeed}>
            <Text style={{ color: "gray", fontSize: 16 }}>
              ไม่มีสินค้าเพิ่มเติมแล้ว
            </Text>
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
  profileIcon: { width: 40, height: 40, resizeMode: "contain" },
  notifyIcon: { width: 24, height: 24 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 24,
    paddingHorizontal: 12,
    marginBottom: 12,
    marginHorizontal: 16,
    height: 50,
  },
  iconSmall: { width: 24, height: 24, marginHorizontal: 6, resizeMode: "contain" },
  productCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    justifyContent: "flex-end",
    marginBottom: 16,
  },
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
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  metaIcon: { width: 16, height: 16, marginRight: 6, resizeMode: "contain" },
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

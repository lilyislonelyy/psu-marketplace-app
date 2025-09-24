// app/(tabs)/index.tsx
import { BlurView } from "expo-blur";
import React from "react";
import {
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

const Index: React.FC = () => {
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
        <ImageBackground
          source={{ uri: "https://picsum.photos/500" }}
          style={[styles.productCard, { paddingBottom: 20 }]}
          imageStyle={{ borderRadius: 16 }}
        >
          {/* ข้อมูลสินค้า */}
          <View style={styles.productInfoWrapper}>
            <BlurView intensity={50} tint="dark" style={styles.productInfoOverlay} />
            <View style={styles.productInfo}>
              <Text style={styles.productTitle}>
                Product <Text style={styles.price}>(Used/New)</Text>
              </Text>
              <Text style={styles.meta}>Quantity / Stock</Text>

              <View style={styles.metaRow}>
                <Image
                  source={require("../../assets/home/ShopName.png") as ImageSourcePropType}
                  style={styles.metaIcon}
                />
                <Text style={styles.meta}>Seller / Shop Name</Text>
              </View>

              <View style={styles.metaRow}>
                <Image
                  source={require("../../assets/home/Location.png") as ImageSourcePropType}
                  style={styles.metaIcon}
                />
                <Text style={styles.meta}>Faculty / Department / Address</Text>
              </View>
            </View>
          </View>

          {/* ปุ่ม action (เหลือ 3 ปุ่ม) */}
          <View style={styles.actionRow}>
            <TouchableOpacity>
              <Image
                source={require("../../assets/home/Refresh.png") as ImageSourcePropType}
                style={styles.actionIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image
                source={require("../../assets/home/X.png") as ImageSourcePropType}
                style={styles.actionIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image
                source={require("../../assets/home/Cart.png") as ImageSourcePropType}
                style={styles.actionIcon}
              />
            </TouchableOpacity>
          </View>
        </ImageBackground>
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
  },
  productInfoWrapper: {
    marginBottom: 100,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  productInfoOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  productInfo: {
    padding: 12,
  },
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
});

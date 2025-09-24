import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ProfileScreen: React.FC = () => {
  const [tab, setTab] = useState<"post" | "history">("post");

  const posts = [
    {
      id: 1,
      name: "Kanyapak Nunpan",
      faculty: "Science / Computer Science",
      instagram: "@myinstagram",
      product: "Product A",
      image: require("../../assets/Sample.jpg"),
      quantity: 5,
    },
    {
      id: "2",
      name: "Kanyapak Nunpan",
      faculty: "Science / Computer Science",
      product: "Product B",
      image: require("../../assets/Sample.jpg"),
      quantity: 0, // ✅ หมดแล้ว → ไปอยู่ history
    },
  ];

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
            <Text style={styles.name}>Kanyapak Nunpan</Text>
            <Text style={styles.faculty}>Science / Computer Science</Text>
            <Text style={styles.instagram}>@myinstagram</Text>
          </View>
          <Image
            source={require("../../assets/Profile.png")}
            style={styles.avatar}
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Share profile</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tabItem, tab === "post" && styles.activeTab]}
            onPress={() => setTab("post")}
          >
            <Text
              style={[
                styles.tabText,
                tab === "post" && styles.activeTabText,
              ]}
            >
              Post
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, tab === "history" && styles.activeTab]}
            onPress={() => setTab("history")}
          >
            <Text
              style={[
                styles.tabText,
                tab === "history" && styles.activeTabText,
              ]}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>

        {/* Posts */}
        {tab === "post" &&
  posts
    .filter((p) => p.quantity > 0) // ✅ เฉพาะสินค้าที่เหลือ
    .map((p) => (
      <View key={p.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <Image
            source={require("../../assets/Profile.png")}
            style={styles.cardAvatar}
          />
          <View>
            <Text style={styles.cardName}>{p.name}</Text>
            <Text style={styles.cardSub}>
              @{p.faculty} • Quantity: {p.quantity}
            </Text>
          </View>
        </View>
        <Image source={p.image} style={styles.cardImage} />
      </View>
    ))}

{tab === "history" &&
  posts
    .filter((p) => p.quantity === 0) // ✅ เฉพาะสินค้าที่หมดแล้ว
    .map((p) => (
      <View key={p.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <Image
            source={require("../../assets/Profile.png")}
            style={styles.cardAvatar}
          />
          <View>
            <Text style={styles.cardName}>{p.name}</Text>
            <Text style={styles.cardSub}>
              @{p.faculty} • Quantity: {p.quantity}
            </Text>
          </View>
        </View>
        <Image source={p.image} style={styles.cardImage} />
      </View>
    ))}
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
});

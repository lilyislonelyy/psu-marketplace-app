import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Item {
  id: string;
  shop: string;
  product: string;
  price: number;
  quantity: number;
  maxQuantity: number;
  shopLogo: any;
  productImage: any;
}

const CartScreen: React.FC = () => {
  const [items, setItems] = useState<Item[]>([
    {
      id: "1",
      shop: "Chisanupong",
      product: "Product A",
      price: 100,
      quantity: 1,
      maxQuantity: 5,
      shopLogo: require("../../assets/home/ShopName.png"),
      productImage: require("../../assets/Sample.jpg"),
    },
    {
      id: "2",
      shop: "Kanthima",
      product: "Product B",
      price: 50,
      quantity: 2,
      maxQuantity: 2,
      shopLogo: require("../../assets/home/ShopName.png"),
      productImage: require("../../assets/Sample.jpg"),
    },
    {
      id: "3",
      shop: "Methasit",
      product: "Product C",
      price: 20,
      quantity: 1,
      maxQuantity: 10,
      shopLogo: require("../../assets/home/ShopName.png"),
      productImage: require("../../assets/Sample.jpg"),
    },
  ]);

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const updateQuantity = (id: string, change: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;

          if (newQuantity > item.maxQuantity) {
            Alert.alert("Notice", "This is the maximum quantity available.");
            return item;
          }
          if (newQuantity <= 0) {
            Alert.alert("Confirm", "Are you sure you want to remove this item?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Remove",
                style: "destructive",
                onPress: () => {
                  setItems((prev) => prev.filter((i) => i.id !== id));
                },
              },
            ]);
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.card}>
      {/* Top Row: Shop name + Edit */}
      <View style={styles.rowBetween}>
        <View style={styles.shopRow}>
          <Image source={item.shopLogo} style={styles.shopLogo} />
          <Text style={styles.shopName}>{item.shop}</Text>
        </View>
        <TouchableOpacity onPress={() => setSelectedItem(item)}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Product Row */}
      <View style={styles.row}>
        <Image source={item.productImage} style={styles.productImage} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.product}>{item.product}</Text>
          <Text style={styles.price}>฿ {item.price}</Text>
        </View>
        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => updateQuantity(item.id, -1)}
          >
            <Text style={styles.qtyTextBtn}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => updateQuantity(item.id, 1)}
          >
            <Text style={styles.qtyTextBtn}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Now */}
      <TouchableOpacity style={styles.chatButton}>
        <Text style={styles.chatButtonText}>Chat Now !</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <LinearGradient
        colors={["#AAFFE7", "#638CF2", "#0D00FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Your order ({items.length})</Text>
      </LinearGradient>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
      />

      {/* Edit Modal */}
      <Modal
        visible={!!selectedItem}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedItem && (
              <>
                <Text style={styles.modalTitle}>
                  Edit {selectedItem.product}
                </Text>
                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => updateQuantity(selectedItem.id, -1)}
                  >
                    <Text style={styles.qtyTextBtn}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{selectedItem.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => updateQuantity(selectedItem.id, 1)}
                  >
                    <Text style={styles.qtyTextBtn}>+</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => {
                    Alert.alert("Confirm", "Remove this item?", [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Remove",
                        style: "destructive",
                        onPress: () => {
                          setItems((prev) =>
                            prev.filter((i) => i.id !== selectedItem.id)
                          );
                          setSelectedItem(null);
                        },
                      },
                    ]);
                  }}
                >
                  <Text style={styles.deleteText}>Delete Item</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedItem(null)}
                >
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CartScreen;

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
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  shopRow: { flexDirection: "row", alignItems: "center" },
  shopLogo: { width: 18, height: 18, marginRight: 6, tintColor: "#555" },
  shopName: { fontWeight: "600", fontSize: 14 },
  editText: { color: "#2C32FA", fontWeight: "500" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  productImage: {
    width: 60,
    height: 60,
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  product: { fontSize: 14, fontWeight: "500" },
  price: { fontSize: 14, color: "gray", marginBottom: 4 },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  qtyButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qtyTextBtn: { fontSize: 16, fontWeight: "600" },
  qtyText: { fontSize: 14, marginHorizontal: 8 },
  chatButton: {
    backgroundColor: "#2C32FA",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  chatButtonText: { color: "#fff", fontWeight: "600" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "600", marginBottom: 20 },
  deleteButton: {
    marginTop: 20,
    backgroundColor: "#ff4444",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  deleteText: { color: "#fff", fontWeight: "600" },
  closeButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  closeText: { fontWeight: "600" },
});

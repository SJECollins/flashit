import { useCallback, useState } from "react";
import { Text, TextInput, Button } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import {
  addCard,
  Card,
  getAllCategories,
  Category,
  Subcategory,
} from "@/data/db";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useMessage } from "../_layout";
import PageView from "@/components/pageView";
import { StyleSheet, View } from "react-native";

export default function AddCardScreen() {
  const { categoryId, subcategoryId } = useLocalSearchParams();
  const router = useRouter();
  const { triggerMessage } = useMessage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>(
    categoryId[0] || ""
  );
  const [selectedSubcatId, setSelectedSubcatId] = useState<string>(
    subcategoryId[0] || ""
  );
  const [newCard, setNewCard] = useState<Omit<Card, "id" | "createdAt">>({
    categoryId: "",
    subcategoryId: "",
    title: "",
    definition: "",
    lastReviewed: undefined,
    numCorrect: 0,
    numIncorrect: 0,
    clue: "",
  });

  const loadData = () => {
    try {
      const allCategories = getAllCategories();
      setCategories(allCategories);
      // Probably unnecessary but helps for visualising logic
      if (!categoryId && !subcategoryId) {
        setSelectedCatId("");
        setSelectedSubcatId("");
      }
      // If an id for a category is provided, set the selected category
      if (categoryId) {
        const selectedCategory = allCategories.find(
          (cat) => cat.id === categoryId[0]
        );
        if (selectedCategory) {
          setSelectedCatId(selectedCategory.id);
        }
      }
      // If an id for a subcategory is provided, set the subcategory and it's parent category
      if (subcategoryId) {
        allCategories.forEach((cat) => {
          const subcat = cat.subcategories.find(
            (sub) => sub.id === subcategoryId[0]
          );
          if (subcat) {
            setSelectedCatId(cat.id);
            setSelectedSubcatId(subcat.id);
          }
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      triggerMessage("Error loading categories: " + errorMsg, "error");
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleAddCard = () => {
    if (!newCard.title || !newCard.definition) {
      triggerMessage("Title and Definition are required", "error");
      return;
    }
    if (!selectedCatId) {
      triggerMessage("Please select a category", "error");
      return;
    }

    const cardToAdd: Omit<Card, "id" | "createdAt"> = {
      ...newCard,
      categoryId: selectedCatId,
      subcategoryId: selectedSubcatId || undefined,
    };

    try {
      addCard(cardToAdd);
      triggerMessage("Card added successfully", "success");
      router.back();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      triggerMessage("Failed to add card: " + errorMsg, "error");
    }
  };

  return (
    <PageView>
      <Text variant="headlineMedium" style={{ marginBottom: 20 }}>
        Add New Card
      </Text>
      {categoryId ? (
        <Text variant="bodyMedium" style={{ marginBottom: 10 }}>
          {`Category: ${
            categories.find((cat) => cat.id === selectedCatId)?.name || ""
          }`}
        </Text>
      ) : (
        <Picker
          selectedValue={selectedCatId}
          onValueChange={(itemValue) => setSelectedCatId(itemValue)}
        >
          {categories.map((cat) => (
            <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
          ))}
        </Picker>
      )}
      {subcategoryId ? (
        <Text variant="bodyMedium" style={{ marginBottom: 10 }}>
          {`Subcategory: ${
            categories
              .find((cat) => cat.id === selectedCatId)
              ?.subcategories.find((sub) => sub.id === selectedSubcatId)
              ?.name || ""
          }`}
        </Text>
      ) : (
        <Picker
          selectedValue={selectedSubcatId}
          onValueChange={(itemValue) => setSelectedSubcatId(itemValue)}
        >
          {categories
            .find((cat) => cat.id === selectedCatId)
            ?.subcategories.map((sub) => (
              <Picker.Item key={sub.id} label={sub.name} value={sub.id} />
            ))}
        </Picker>
      )}
      <View style={styles.col}>
        <Text variant="bodyMedium">Title: </Text>
        <TextInput
          style={styles.input}
          mode="outlined"
          value={newCard.title}
          onChangeText={(text) => setNewCard({ ...newCard, title: text })}
        />
      </View>
      <View style={styles.col}>
        <Text variant="bodyMedium">Definition: </Text>
        <TextInput
          style={styles.input}
          mode="outlined"
          value={newCard.definition}
          onChangeText={(text) => setNewCard({ ...newCard, definition: text })}
        />
      </View>
      <Button mode="contained" onPress={handleAddCard}>
        Add Card
      </Button>
    </PageView>
  );
}

const styles = StyleSheet.create({
  col: {
    flexDirection: "column",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    marginLeft: 10,
  },
});

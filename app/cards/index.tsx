import PageView from "@/components/pageView";
import { Card, Category, getAllCategories, Subcategory } from "@/data/db";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, IconButton, List, Text, useTheme } from "react-native-paper";
import { useMessage } from "../_layout";

export default function CardsIndex() {
  const router = useRouter();
  const theme = useTheme();
  const { triggerMessage } = useMessage();
  const [cards, setCards] = useState<Card[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);

  const loadData = () => {
    try {
      const allCategories = getAllCategories();
      setCategories(allCategories);
      const allCards = allCategories.flatMap((cat) => cat.cards);
      setCards(allCards);
      setFilteredCards(allCards);
      const allSubcategories = allCategories.flatMap(
        (cat) => cat.subcategories
      );
      setSubcategories(allSubcategories);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      triggerMessage("Failed to load cards: " + errorMsg, "error");
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const filterByCategory = (catId: string | null) => {
    if (!catId) {
      setFilteredCards(cards);
      return;
    }
    const filteredCards = cards.filter((card) => card.categoryId === catId);
    setFilteredCards(filteredCards);
  };

  const filterBySubcategory = (subcatId: string | null) => {
    if (!subcatId) {
      setFilteredCards(cards);
      return;
    }
    const filteredCards = cards.filter(
      (card) => card.subcategoryId === subcatId
    );
    setFilteredCards(filteredCards);
  };

  return (
    <PageView>
      <Text variant="headlineMedium">Cards</Text>
      <Button
        icon="plus"
        mode="contained"
        onPress={() => router.push("./cards/add")}
      >
        Add Card
      </Button>
      <Text variant="bodyMedium">Total: {cards.length}</Text>
      <Text variant="bodyMedium">Filter by Category:</Text>
      <Picker
        style={{ color: theme.colors.primary }}
        selectedValue={selectedCategory}
        onValueChange={(value) => {
          setSelectedCategory(value);
          filterByCategory(value);
        }}
      >
        <Picker.Item label="None" value={null} />
        {categories.map((category) => (
          <Picker.Item
            key={category.id}
            label={category.name}
            value={category.id}
          />
        ))}
      </Picker>
      <Text variant="bodyMedium">Filter by Subcategory:</Text>
      <Picker
        style={{ color: theme.colors.primary }}
        selectedValue={selectedSubcategory}
        onValueChange={(value) => {
          setSelectedSubcategory(value);
          filterBySubcategory(value);
        }}
      >
        <Picker.Item label="None" value={null} />
        {subcategories.map((subcategory) => (
          <Picker.Item
            key={subcategory.id}
            label={subcategory.name}
            value={subcategory.id}
          />
        ))}
      </Picker>
      <ScrollView style={styles.scrollStyle}>
        {filteredCards.map((card) => (
          <List.Item
            key={card.id}
            title={card.title}
            left={() => <List.Icon icon="card-text" />}
            right={() => (
              <IconButton
                icon="chevron-right"
                onPress={() => router.push({ pathname: `./${card.id}` as any })}
              />
            )}
          />
        ))}
      </ScrollView>
    </PageView>
  );
}

const styles = StyleSheet.create({
  scrollStyle: {
    maxHeight: "80%",
    padding: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

import { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import { Text, Button } from "react-native-paper";
import {
  ReviewSession,
  getAllCategories,
  Category,
  Subcategory,
  Card,
} from "@/data/db";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useMessage } from "../_layout";
import PageView from "@/components/pageView";
import { Picker } from "@react-native-picker/picker";
import CardDisplay from "@/components/card";

const sessionType = ["standard", "timed", "100%", "incorrect", "custom"];

export default function NewSessionScreen() {
  const { triggerMessage } = useMessage();
  const { categoryId, subcategoryId } = useLocalSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedSession, setSelectedSession] = useState<
    Omit<ReviewSession, "id" | "createdAt">
  >({
    categoryId: "",
    subcategoryId: "",
    reviewType: "standard",
    wrong: [],
    right: [],
  });
  const [category, setCategory] = useState<Category | undefined>(undefined);
  const [subcategory, setSubcategory] = useState<Subcategory | undefined>(
    undefined
  );
  const [sessionCards, setSessionCards] = useState<Card[]>([]);
  const [startSession, setStartSession] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [correct, setCorrect] = useState<boolean>(false);
  const [incorrect, setIncorrect] = useState<boolean>(false);

  const loadData = () => {
    try {
      const allCategories = getAllCategories();
      setCategories(allCategories);

      let initialCategoryId = categoryId?.[0] ?? "";
      let initialSubcategoryId = subcategoryId?.[0] ?? "";

      // If subcategoryId exists, find its parent category
      if (initialSubcategoryId) {
        for (const cat of allCategories) {
          if (
            cat.subcategories.some((sub) => sub.id === initialSubcategoryId)
          ) {
            initialCategoryId = cat.id;
            break;
          }
        }
      }

      setSelectedSession({
        categoryId: initialCategoryId,
        subcategoryId: initialSubcategoryId,
        reviewType: "standard",
        wrong: [],
        right: [],
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      triggerMessage("Failed to load data: " + errorMsg, "error");
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [categoryId, subcategoryId])
  );

  const handleCategoryChange = (value: Category) => {
    setSelectedSession({
      categoryId: value.id,
      subcategoryId: "",
      reviewType: "standard",
      wrong: [],
      right: [],
    });
    setCategory(value);
  };

  const handleSubcategoryChange = (value: Subcategory) => {
    setSelectedSession((prev) => ({
      ...prev,
      subcategoryId: value.id,
    }));
    setSubcategory(value);
  };

  const handleTypeChange = (value: ReviewSession["reviewType"]) => {
    setSelectedSession((prev) => ({
      ...prev,
      reviewType: value,
    }));
  };

  const handleStartSession = () => {
    if (selectedSession.categoryId && selectedSession.reviewType) {
    }
  };

  const currentCategory = categories.find(
    (c) => c.id === selectedSession.categoryId
  );

  const handleNext = () => {
    if (currentIndex < sessionCards.length - 1) {
      if (!correct && !incorrect) {
        triggerMessage("Mark correct/incorrect to continue", "success");
      } else {
        setSessionCards((prevCards) =>
          prevCards.map((card, idx) =>
            idx === currentIndex
              ? {
                  ...card,
                  numCorrect: card.numCorrect + (correct ? 1 : 0),
                  numIncorrect: card.numIncorrect + (incorrect ? 1 : 0),
                }
              : card
          )
        );
        setCorrect(false);
        setIncorrect(false);
        setCurrentIndex(currentIndex + 1);
      }
    } else {
      // End the session
    }
  };

  if (startSession) {
    return (
      <PageView>
        <Text variant="headlineMedium">
          {category && `Category: ${category.name}`}{" "}
          {subcategory && `Subcategory: ${subcategory.name}`}
        </Text>
        {sessionCards[currentIndex] && (
          <CardDisplay
            card={sessionCards[currentIndex]}
            setCorrect={setCorrect}
            setIncorrect={setIncorrect}
          />
        )}
        <Button mode="contained" onPress={handleNext}>
          Next Card
        </Button>
      </PageView>
    );
  } else {
    return (
      <PageView>
        <Text variant="headlineMedium">New Session</Text>
        <ScrollView>
          {/* Category Picker */}
          <View style={{ marginVertical: 10 }}>
            <Text variant="titleMedium">Category</Text>
            <Picker
              selectedValue={
                categories.find(
                  (cat) => cat.id === selectedSession.categoryId
                ) || null
              }
              onValueChange={(itemValue) => {
                if (itemValue && typeof itemValue === "object") {
                  handleCategoryChange(itemValue as Category);
                }
              }}
            >
              <Picker.Item label="Select a category" value={null} />
              {categories.map((cat) => (
                <Picker.Item key={cat.id} label={cat.name} value={cat} />
              ))}
            </Picker>
          </View>

          {/* Subcategory Picker */}
          {selectedSession.categoryId &&
            currentCategory &&
            currentCategory.subcategories.length > 0 && (
              <View style={{ marginVertical: 10 }}>
                <Text variant="titleMedium">Subcategory</Text>
                <Picker
                  selectedValue={
                    category?.subcategories.find(
                      (subcat) => subcat.id === selectedSession.subcategoryId
                    ) || undefined
                  }
                  onValueChange={handleSubcategoryChange}
                >
                  <Picker.Item label="Select a subcategory" value="" />
                  {currentCategory.subcategories.map((subcat) => (
                    <Picker.Item
                      key={subcat.id}
                      label={subcat.name}
                      value={subcat}
                    />
                  ))}
                </Picker>
              </View>
            )}
          <View style={{ marginVertical: 10 }}>
            <Text variant="titleMedium">Type</Text>
            <Picker
              selectedValue={selectedSession.reviewType}
              onValueChange={handleTypeChange}
            >
              {sessionType.map((type) => (
                <Picker.Item
                  key={type}
                  label={type}
                  value={type as ReviewSession["reviewType"]}
                />
              ))}
            </Picker>
          </View>
          <Button
            mode="contained"
            onPress={handleStartSession}
            disabled={!selectedSession.categoryId}
          >
            Start Session
          </Button>
        </ScrollView>
      </PageView>
    );
  }
}

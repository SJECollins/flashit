// app/new-session.tsx
import { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import { Text, Button } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useLocalSearchParams, router } from "expo-router";

import { useMessage } from "../_layout";
import PageView from "@/components/pageView";
import {
  getAllCategories,
  Category,
  Subcategory,
  ReviewSession,
} from "@/data/db";

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

  const loadData = () => {
    try {
      const allCategories = getAllCategories();
      setCategories(allCategories);

      let initialCategoryId = categoryId?.[0] ?? "";
      let initialSubcategoryId = subcategoryId?.[0] ?? "";

      // find parent category if subcategory was passed
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

      setSelectedSession((prev) => ({
        ...prev,
        categoryId: initialCategoryId,
        subcategoryId: initialSubcategoryId,
      }));
    } catch (error) {
      triggerMessage("Failed to load data: " + String(error), "error");
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [categoryId, subcategoryId])
  );

  const handleCategoryChange = (value: Category) => {
    setSelectedSession((prev) => ({
      ...prev,
      categoryId: value.id,
      subcategoryId: "",
    }));
  };

  const handleSubcategoryChange = (value: Subcategory) => {
    setSelectedSession((prev) => ({
      ...prev,
      subcategoryId: value.id,
    }));
  };

  const handleTypeChange = (value: ReviewSession["reviewType"]) => {
    setSelectedSession((prev) => ({
      ...prev,
      reviewType: value,
    }));
  };

  const handleStartSession = () => {
    if (!selectedSession.categoryId) {
      triggerMessage("Select a category first", "error");
      return;
    }

    // Navigate to /session and pass params
    router.push({
      pathname: "/session",
      params: {
        categoryId: selectedSession.categoryId,
        subcategoryId: selectedSession.subcategoryId,
        reviewType: selectedSession.reviewType,
      },
    });
  };

  const currentCategory = categories.find(
    (c) => c.id === selectedSession.categoryId
  );

  return (
    <PageView>
      <Text variant="headlineMedium">New Session</Text>
      <ScrollView>
        {/* Category Picker */}
        <View style={{ marginVertical: 10 }}>
          <Text variant="titleMedium">Category</Text>
          <Picker
            selectedValue={currentCategory || null}
            onValueChange={(val) => handleCategoryChange(val as Category)}
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
                  currentCategory.subcategories.find(
                    (s) => s.id === selectedSession.subcategoryId
                  ) || undefined
                }
                onValueChange={(val) =>
                  handleSubcategoryChange(val as Subcategory)
                }
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

        {/* Session Type */}
        <View style={{ marginVertical: 10 }}>
          <Text variant="titleMedium">Type</Text>
          <Picker
            selectedValue={selectedSession.reviewType}
            onValueChange={(val) => handleTypeChange(val)}
          >
            {sessionType.map((type) => (
              <Picker.Item key={type} label={type} value={type} />
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

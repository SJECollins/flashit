import PageView from "@/components/pageView";
import { Category, addCategory } from "@/data/db";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Button, Text, TextInput } from "react-native-paper";
import { useMessage } from "../_layout";

const initialCategoryState: Omit<Category, "id" | "createdAt"> = {
  name: "",
  description: "",
  subcategories: [],
  cards: [],
};

export default function AddCategoryScreen() {
  const router = useRouter();
  const { triggerMessage } = useMessage();
  const [category, setCategory] =
    useState<Omit<Category, "id" | "createdAt">>(initialCategoryState);

  useFocusEffect(
    useCallback(() => {
      setCategory(initialCategoryState);
    }, [])
  );

  const addCategoryHandler = async () => {
    try {
      addCategory(category);
      triggerMessage("Category added successfully", "success");
      router.push("./categories");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      triggerMessage("Failed to add category: " + errorMsg, "error");
    }
  };

  return (
    <PageView>
      <Text variant="headlineMedium">Add Category</Text>
      <TextInput
        label="Name"
        value={category.name}
        onChangeText={(text) => setCategory({ ...category, name: text })}
      />
      <TextInput
        label="Description"
        value={category.description}
        onChangeText={(text) => setCategory({ ...category, description: text })}
      />
      <Button mode="contained" onPress={addCategoryHandler}>
        Add Category
      </Button>
    </PageView>
  );
}

import { useCallback, useState } from "react";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useMessage } from "../../_layout";
import { Category, getCategoryById, updateCategory } from "@/data/db";
import { Text, TextInput, Button } from "react-native-paper";
import PageView from "@/components/pageView";

export default function EditCategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { triggerMessage } = useMessage();
  const [category, setCategory] = useState<Category | null>(null);

  const loadData = () => {
    try {
      if (id) {
        const categoryData = getCategoryById(id[0]);
        if (categoryData) {
          setCategory(categoryData);
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      triggerMessage("Failed to load category: " + errorMsg, "error");
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  const updateCategoryHandler = async () => {
    try {
      if (category) {
        updateCategory(id[0], category);
      }
      triggerMessage("Category added successfully", "success");
      router.push("./categories");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      triggerMessage("Failed to add category: " + errorMsg, "error");
    }
  };

  if (!category) {
    return <Text>Loading...</Text>;
  }

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
      <Button mode="contained" onPress={updateCategoryHandler}>
        Add Category
      </Button>
    </PageView>
  );
}

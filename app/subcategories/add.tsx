import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useTheme, Button, TextInput, Text } from "react-native-paper";
import { useMessage } from "../_layout";
import {
  addSubcategory,
  Subcategory,
  getAllCategories,
  Category,
} from "@/data/db";
import PageView from "@/components/pageView";
import { Picker } from "@react-native-picker/picker";

export default function AddSubcategoryScreen() {
  const router = useRouter();
  const { triggerMessage } = useMessage();
  const theme = useTheme();
  const { categoryId } = useLocalSearchParams();
  const [subcategory, setSubcategory] = useState<
    Omit<Subcategory, "id" | "createdAt">
  >({
    name: "",
    description: "",
    categoryId: "",
    cards: [],
  });
  const [categoryList, setCategoryList] = useState<Category[]>([]);

  const loadData = async () => {
    try {
      const categories = getAllCategories();
      setCategoryList(categories);
      if (categoryId) {
        const selectedCategory = categories.find(
          (cat) => cat.id === categoryId
        );
        setSubcategory({
          ...subcategory,
          categoryId: selectedCategory?.id || "",
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      triggerMessage("Failed to load categories: " + errorMsg, "error");
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleAddSubcategory = async () => {
    try {
      addSubcategory(subcategory);
      triggerMessage("Subcategory added successfully", "success");
      router.push("./subcategories");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      triggerMessage("Failed to add subcategory: " + errorMsg, "error");
    }
  };

  return (
    <PageView>
      <TextInput
        label="Name"
        value={subcategory.name}
        onChangeText={(text) => setSubcategory({ ...subcategory, name: text })}
        style={{ marginBottom: 12 }}
      />
      <TextInput
        label="Description"
        value={subcategory.description}
        onChangeText={(text) =>
          setSubcategory({ ...subcategory, description: text })
        }
        style={{ marginBottom: 12 }}
      />
      <Text variant="titleMedium" style={{ marginBottom: 8 }}>
        Category
      </Text>
      <Picker
        selectedValue={subcategory.categoryId}
        onValueChange={(itemValue) =>
          setSubcategory({ ...subcategory, categoryId: itemValue })
        }
      >
        {categoryList.map((category) => (
          <Picker.Item
            key={category.id}
            label={category.name}
            value={category.id}
          />
        ))}
      </Picker>
      <Button mode="contained" onPress={handleAddSubcategory}>
        Add Subcategory
      </Button>
    </PageView>
  );
}

import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useTheme, Button, TextInput, Text } from "react-native-paper";
import { useMessage } from "../../_layout";
import {
  updateSubcategory,
  getSubcategoryById,
  Subcategory,
  getAllCategories,
  Category,
} from "@/data/db";
import PageView from "@/components/pageView";
import { Picker } from "@react-native-picker/picker";

export default function EditSubcategoryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { triggerMessage } = useMessage();
  const theme = useTheme();
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [categoryList, setCategoryList] = useState<Category[]>([]);

  const loadData = async () => {
    if (id) {
      const subcategoryId = Array.isArray(id) ? id[0] : id;
      const subcategory = getSubcategoryById(subcategoryId);
      if (subcategory) setSubcategory(subcategory);
    }
    try {
      const categories = getAllCategories();
      setCategoryList(categories);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      triggerMessage("Failed to load categories: " + errorMsg, "error");
      router.push("../");
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleEditSubcategory = async () => {
    try {
      if (!subcategory) return;
      updateSubcategory(id[0], subcategory);
      triggerMessage("Subcategory updated successfully", "success");
      router.push("../" + id[0]);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      triggerMessage("Failed to update subcategory: " + errorMsg, "error");
    }
  };

  return (
    <PageView>
      <TextInput
        label="Name"
        value={subcategory?.name ?? ""}
        onChangeText={(text) =>
          setSubcategory((prev) => (prev ? { ...prev, name: text } : prev))
        }
        style={{ marginBottom: 12 }}
      />
      <TextInput
        label="Description"
        value={subcategory?.description ?? ""}
        onChangeText={(text) =>
          setSubcategory((prev) =>
            prev ? { ...prev, description: text } : prev
          )
        }
        style={{ marginBottom: 12 }}
      />
      <Picker
        selectedValue={subcategory?.categoryId ?? ""}
        onValueChange={(itemValue) =>
          setSubcategory((prev) =>
            prev ? { ...prev, categoryId: itemValue } : prev
          )
        }
        style={{ marginBottom: 12 }}
      >
        <Picker.Item label="Select Category" value="" />
        {categoryList.map((category) => (
          <Picker.Item
            key={category.id}
            label={category.name}
            value={category.id}
          />
        ))}
      </Picker>
      <Button mode="contained" onPress={handleEditSubcategory}>
        Edit Subcategory
      </Button>
    </PageView>
  );
}

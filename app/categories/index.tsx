import PageView from "@/components/pageView";
import { Category, getAllCategories } from "@/data/db";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, IconButton, List, Text } from "react-native-paper";
import { useMessage } from "../_layout";

export default function CategoriesPage() {
  const router = useRouter();
  const { triggerMessage } = useMessage();
  const [categories, setCategories] = useState<Category[]>([]);

  const loadData = () => {
    try {
      const data = getAllCategories();
      setCategories(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      triggerMessage("Error loading categories: " + errorMessage, "error");
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  return (
    <PageView>
      <Text variant="headlineMedium"> All Categories: </Text>
      <Button
        mode="contained"
        onPress={() => router.push("./categories/add")}
        style={{ marginBottom: 10 }}
      >
        Add Category
      </Button>
      {categories.length > 0 ? (
        <ScrollView style={styles.scrollView}>
          {categories.map((category) => (
            <List.Item
              key={category.id}
              title={category.name}
              left={() => <List.Icon icon="folder-outline" />}
              right={() => (
                <IconButton
                  icon="chevron-right"
                  onPress={() =>
                    router.push({ pathname: `./categories/${category.id}` })
                  }
                />
              )}
            />
          ))}
        </ScrollView>
      ) : (
        <Text>No categories found</Text>
      )}
    </PageView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    padding: 10,
    maxHeight: "75%",
  },
});

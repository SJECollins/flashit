import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Text, Button, Modal } from "react-native-paper";
import {
  getCategoryById,
  deleteCategory,
  Category,
  getReviewSessionsByCategory,
  ReviewSession,
  getSubcategories,
  Subcategory,
} from "@/data/db";
import { useMessage } from "../_layout";
import PageView from "@/components/pageView";

export default function CategoryDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { triggerMessage } = useMessage();

  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [sessions, setSessions] = useState<ReviewSession[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const loadData = () => {
    if (id) {
      const category = getCategoryById(id[0]);
      if (category) {
        setCategory(category);
        const subcategories = getSubcategories(category.id);
        setSubcategories(subcategories);
        const sessions = getReviewSessionsByCategory(category.id);
        setSessions(sessions);
      } else {
        triggerMessage("Category not found", "error");
        router.push("./");
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  if (!category) {
    return <Text>Loading...</Text>;
  }

  return (
    <PageView>
      <Text variant="headlineMedium" style={{ marginBottom: 8 }}>
        {category.name}
      </Text>
    </PageView>
  );
}

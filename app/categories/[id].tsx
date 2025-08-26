import { useCallback, useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import {
  Text,
  Button,
  Modal,
  List,
  IconButton,
  TextInput,
} from "react-native-paper";
import {
  getCategoryById,
  updateCategory,
  deleteCategory,
  Category,
  getReviewSessionsByCategory,
  ReviewSession,
  deleteCard,
  deleteSubcategory,
  deleteReviewSession,
} from "@/data/db";
import { useMessage } from "../_layout";
import PageView from "@/components/pageView";

export default function CategoryDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { triggerMessage } = useMessage();

  const [category, setCategory] = useState<Category | null>(null);
  const [sessions, setSessions] = useState<ReviewSession[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [tempName, setTempName] = useState("");
  const [tempDescription, setTempDescription] = useState("");
  const [editName, seteditName] = useState(false);
  const [editDescription, setEditDescription] = useState(false);

  const loadData = () => {
    try {
      if (id) {
        const category = getCategoryById(id[0]);
        if (category) {
          setCategory(category);
          const sessions = getReviewSessionsByCategory(category.id);
          setSessions(sessions);
        } else {
          triggerMessage("Category not found", "error");
          router.push("./");
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

  const editNameHandler = () => {
    if (category) {
      updateCategory(category.id, { ...category, name: tempName });
      setCategory({ ...category, name: tempName });
      seteditName(false);
    }
  };

  const editDefinitionHandler = () => {
    if (category) {
      updateCategory(category.id, {
        ...category,
        description: tempDescription,
      });
      setCategory({ ...category, description: tempDescription });
      setEditDescription(false);
    }
  };

  const deleteCategoryHandler = () => {
    if (id) {
      // Delete related cards and subcategories and sessions
      category?.subcategories.forEach((subcat) => {
        deleteSubcategory(subcat.id);
      });
      category?.cards.forEach((card) => {
        deleteCard(card.id);
      });
      sessions?.forEach((session) => {
        deleteReviewSession(session.id);
      });
      deleteCategory(id[0]);
      triggerMessage("Category deleted successfully", "success");
      router.push("./");
    }
  };

  if (!category) {
    return <Text>Loading...</Text>;
  }

  return (
    <PageView>
      {editName ? (
        <>
          <TextInput
            label="Name"
            value={tempName}
            onChangeText={(text) => setTempName(text)}
          />
          <View style={styles.row}>
            <Button mode="contained" onPress={editNameHandler}>
              Save
            </Button>
            <Button mode="outlined" onPress={() => seteditName(false)}>
              Cancel
            </Button>
          </View>
        </>
      ) : (
        <>
          <Text variant="headlineMedium" style={{ marginBottom: 8 }}>
            {category.name}
          </Text>
          <Button mode="contained" onPress={() => seteditName(true)}>
            Edit
          </Button>
        </>
      )}
      {editDescription ? (
        <>
          <TextInput
            label="Description"
            value={tempDescription}
            onChangeText={(text) => setTempDescription(text)}
          />
          <View style={styles.row}>
            <Button mode="contained" onPress={editDefinitionHandler}>
              Save
            </Button>
            <Button mode="outlined" onPress={() => setEditDescription(false)}>
              Cancel
            </Button>
          </View>
        </>
      ) : (
        <>
          <Text variant="bodyMedium">{category.description}</Text>
          <Button mode="contained" onPress={() => setEditDescription(true)}>
            Edit
          </Button>
        </>
      )}
      {category.subcategories.length > 0 ? (
        <ScrollView style={styles.scrollView}>
          <Text variant="headlineSmall">
            Subcategories ({category.subcategories.length}):
          </Text>
          {category.subcategories.map((subcat) => (
            <List.Item
              key={subcat.id}
              title={subcat.name}
              left={() => <List.Icon icon="folder-outline" />}
              right={() => (
                <IconButton
                  icon="chevron-right"
                  onPress={() => router.push("./subcategories/" + subcat.id)}
                />
              )}
            />
          ))}
        </ScrollView>
      ) : (
        <>
          <Text variant="bodyMedium">No subcategories yet.</Text>
          <Button
            onPress={() =>
              router.push("./add-subcategory?categoryId=" + category.id)
            }
          >
            Add Subcategory
          </Button>
        </>
      )}
      <View style={styles.row}>
        {sessions.length > 0 ? (
          <>
            <Text variant="bodySmall">Reviewed {sessions.length} times</Text>
            <Text variant="bodySmall">
              Last reviewed:{" "}
              {sessions[0].reviewedAt
                ? new Date(sessions[0].reviewedAt).toLocaleDateString()
                : "Never"}
            </Text>
          </>
        ) : (
          <Text variant="bodyMedium">No review sessions available.</Text>
        )}
      </View>
      <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)}>
        <Text>Are you sure you want to delete this category?</Text>
        <Text variant="bodySmall">
          This action cannot be undone. Related items (e.g. subcategories,
          cards, etc.) will be deleted.
        </Text>
        <View style={styles.row}>
          <Button mode="contained" onPress={deleteCategoryHandler}>
            Confirm
          </Button>
          <Button mode="outlined" onPress={() => setModalVisible(false)}>
            Cancel
          </Button>
        </View>
      </Modal>
    </PageView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    padding: 16,
    maxHeight: "50%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
});

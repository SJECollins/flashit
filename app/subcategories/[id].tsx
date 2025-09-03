import PageView from "@/components/pageView";
import {
  Card,
  Category,
  deleteSubcategory,
  getCardsBySubcategory,
  getCategoryById,
  getReviewSessionsBySubcategory,
  getSubcategoryById,
  ReviewSession,
  Subcategory,
  updateCard,
  updateSubcategory,
} from "@/data/db";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Modal, Text, TextInput } from "react-native-paper";
import { useMessage } from "../_layout";

export default function SubcategoryDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { triggerMessage } = useMessage();

  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [category, setCategory] = useState<Category | undefined>(undefined);
  const [sessions, setSessions] = useState<ReviewSession[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [editName, setEditName] = useState(false);
  const [editDescription, setEditDescription] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempDescription, setTempDescription] = useState("");

  const loadData = () => {
    try {
      if (id) {
        const subcategory = getSubcategoryById(id[0]);
        if (subcategory) {
          setSubcategory(subcategory);
          const category = getCategoryById(subcategory.categoryId);
          setCategory(category);
          const sessions = getReviewSessionsBySubcategory(id[0]);
          setSessions(sessions);
        } else {
          triggerMessage("Subcategory not found", "error");
          router.push("./");
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      triggerMessage("Failed to load subcategory: " + errorMsg, "error");
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  const editNameHandler = () => {
    if (subcategory) {
      updateSubcategory(subcategory.id, { ...subcategory, name: tempName });
      setSubcategory({ ...subcategory, name: tempName });
      setEditName(false);
    }
  };

  const editDescriptionHandler = () => {
    if (subcategory) {
      updateSubcategory(subcategory.id, {
        ...subcategory,
        description: tempDescription,
      });
      setSubcategory({ ...subcategory, description: tempDescription });
      setEditDescription(false);
    }
  };

  const deleteSubcategoryHandler = () => {
    if (id) {
      const relatedCards = getCardsBySubcategory(id[0]);
      if (relatedCards.length > 0) {
        relatedCards.forEach((card: Card) => {
          card.subcategoryId = undefined;
          updateCard(card.id, card);
        });
      }
      deleteSubcategory(id[0]);
      triggerMessage("Subcategory deleted successfully", "success");
      router.push("./");
    }
  };

  if (!subcategory) {
    return <Text>Loading...</Text>;
  }

  return (
    <PageView>
      {editName ? (
        <>
          <TextInput label="Name" value={tempName} onChangeText={setTempName} />
          <View style={styles.row}>
            <Button mode="contained" onPress={editNameHandler}>
              Save
            </Button>
            <Button mode="outlined" onPress={() => setEditName(false)}>
              Cancel
            </Button>
          </View>
        </>
      ) : (
        <>
          <Text variant="headlineMedium">{subcategory.name}</Text>
          <Button mode="contained" onPress={() => setEditName(true)}>
            Edit
          </Button>
        </>
      )}
      {category && (
        <Text variant="bodyMedium">Subcategory of {category?.name}</Text>
      )}
      {editDescription ? (
        <>
          <TextInput
            label="Description"
            value={tempDescription}
            onChangeText={setTempDescription}
          />
          <View style={styles.row}>
            <Button mode="contained" onPress={editDescriptionHandler}>
              Save
            </Button>
            <Button mode="outlined" onPress={() => setEditDescription(false)}>
              Cancel
            </Button>
          </View>
        </>
      ) : (
        <>
          <Text variant="bodyMedium">{subcategory.description}</Text>
          <Button mode="contained" onPress={() => setEditDescription(true)}>
            Edit
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
          <Text variant="bodySmall">Not review yet</Text>
        )}
      </View>
      <View style={styles.row}>
        <Button
          mode="contained"
          onPress={() =>
            router.push({
              pathname: `./edit/${Array.isArray(id) ? id[0] : id}`,
            })
          }
        >
          Edit
        </Button>
        <Button mode="contained-tonal" onPress={() => setModalVisible(true)}>
          Delete
        </Button>
      </View>
      <Button
        mode="contained"
        onPress={() =>
          router.push({
            pathname: "../cards/add",
            params: { subcategoryId: id[0] },
          })
        }
      >
        Add Flashcard
      </Button>
      <Button
        mode="contained"
        onPress={() =>
          router.push({
            pathname: "../cards/index",
            params: { subcategoryId: id[0] },
          })
        }
      >
        View Flashcards
      </Button>

      <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)}>
        <Text>Are you sure you want to delete this subcategory?</Text>
        <Text variant="bodySmall">
          This action cannot be undone. Related cards will not be deleted and
          will remain assigned to their parent category.
        </Text>
        <View style={styles.row}>
          <Button mode="contained" onPress={deleteSubcategoryHandler}>
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
});

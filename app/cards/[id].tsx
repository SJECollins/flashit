import { useCallback, useState, useEffect } from "react";
import {
  getCardById,
  updateCard,
  deleteCard,
  getCategoryById,
  getSubcategoryById,
  Card,
  Category,
  Subcategory,
} from "@/data/db";
import { useMessage } from "../_layout";
import PageView from "@/components/pageView";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Text, TextInput, Button, Divider, Modal } from "react-native-paper";
import { StyleSheet, View } from "react-native";

export default function CardDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { triggerMessage } = useMessage();
  const [card, setCard] = useState<Card | null>(null);
  const [category, setCategory] = useState<Category | undefined>(undefined);
  const [subcategory, setSubcategory] = useState<Subcategory | undefined>(
    undefined
  );
  const [editTitle, setEditTitle] = useState(false);
  const [editDefinition, setEditDefinition] = useState(false);
  const [editClue, setEditClue] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [tempDefinition, setTempDefinition] = useState("");
  const [tempClue, setTempClue] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const loadData = () => {
    try {
      if (id) {
        const card = getCardById(id[0]);
        if (card) {
          setCard(card);
          const category = getCategoryById(card.categoryId);
          if (card.subcategoryId) {
            const subcategory = getSubcategoryById(card.subcategoryId);
            setSubcategory(subcategory);
          }
          setCategory(category);
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      triggerMessage("Error loading card data: " + errorMsg, "error");
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  useEffect(() => {
    if (card) {
      setTempTitle(card.title);
      setTempDefinition(card.definition);
    }
  }, [card]);

  const handleSaveTitle = () => {
    if (card) {
      updateCard(card.id, { ...card, title: tempTitle });
      setCard({ ...card, title: tempTitle });
      setEditTitle(false);
    }
  };

  const handleSaveDefinition = () => {
    if (card) {
      updateCard(card.id, { ...card, definition: tempDefinition });
      setCard({ ...card, definition: tempDefinition });
      setEditDefinition(false);
    }
  };

  const handleSaveClue = () => {
    if (card) {
      updateCard(card.id, { ...card, clue: tempClue });
      setCard({ ...card, clue: tempClue });
      setEditClue(false);
    }
  };

  const handleDeleteCard = () => {
    if (card) {
      deleteCard(card.id);
      triggerMessage("Card deleted successfully", "success");
      router.push("./");
    }
  };

  if (!card) {
    return <Text>Loading...</Text>;
  }

  return (
    <PageView>
      {editTitle ? (
        <>
          <TextInput value={tempTitle} onChangeText={setTempTitle} />
          <View style={styles.row}>
            <Button mode="contained" onPress={handleSaveTitle}>
              Save
            </Button>
            <Button mode="outlined" onPress={() => setEditTitle(false)}>
              Cancel
            </Button>
          </View>
        </>
      ) : (
        <>
          <Text variant="titleMedium">{card?.title}</Text>
          <Button mode="contained" onPress={() => setEditTitle(true)}>
            Edit
          </Button>
        </>
      )}

      {editDefinition ? (
        <>
          <TextInput value={tempDefinition} onChangeText={setTempDefinition} />
          <View style={styles.row}>
            <Button mode="contained" onPress={handleSaveDefinition}>
              Save
            </Button>
            <Button mode="outlined" onPress={() => setEditDefinition(false)}>
              Cancel
            </Button>
          </View>
        </>
      ) : (
        <Text variant="bodyMedium">{card?.definition}</Text>
      )}
      <Button
        mode="contained"
        onPress={() => setEditDefinition(!editDefinition ? true : false)}
      >
        Edit
      </Button>
      <Divider />
      <Text variant="bodyMedium">In category: {category?.name}</Text>
      {subcategory && (
        <Text variant="bodyMedium">In subcategory: {subcategory?.name}</Text>
      )}
      {editClue ? (
        <>
          <TextInput value={tempClue} onChangeText={setTempClue} />
          <View style={styles.row}>
            <Button mode="contained" onPress={handleSaveClue}>
              Save
            </Button>
            <Button mode="outlined" onPress={() => setEditClue(false)}>
              Cancel
            </Button>
          </View>
        </>
      ) : (
        <>
          <Text variant="bodyMedium">
            {card.clue
              ? `Clue: ${card.clue}`
              : "You have not added a clue yet."}
          </Text>
          <Button mode="contained" onPress={() => setEditClue(true)}>
            {card.clue ? "Edit" : "Add Clue"}
          </Button>
        </>
      )}

      <Divider />
      {card.lastReviewed && (
        <Text variant="bodySmall">
          Last reviewed:{" "}
          {card.lastReviewed instanceof Date
            ? card.lastReviewed.toLocaleString()
            : card.lastReviewed}
        </Text>
      )}
      <Text variant="bodySmall">
        Times reviewed: {card.numCorrect + card.numIncorrect}
      </Text>
      <Text variant="bodySmall">Correct: {card.numCorrect}</Text>
      <Text variant="bodySmall">Incorrect: {card.numIncorrect}</Text>
      <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)}>
        <Text>Are you sure you want to delete this card?</Text>
        <Text variant="bodySmall">This action cannot be undone.</Text>
        <View style={styles.row}>
          <Button mode="contained" onPress={handleDeleteCard}>
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
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
});

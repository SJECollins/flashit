import { useCallback, useState } from "react";
import { IconButton, List, Text } from "react-native-paper";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import {
  getCategoryById,
  Category,
  getSubcategoryById,
  Subcategory,
  getReviewSessionById,
  ReviewSession,
  getCardBySession,
  Card,
} from "@/data/db";
import PageView from "@/components/pageView";
import { useMessage } from "../_layout";
import { ScrollView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";

const sessionTotals = {
  correct: 0,
  incorrect: 0,
  total: 0,
};

interface SessionCard {
  id: string;
  title: string;
  timesReviewed: number;
  timesCorrect: number;
  timesIncorrect: number;
}

const countInstance = (id: string, array: any) => {
  return array.filter((item: any) => item.id === id).length;
};

export default function SessionDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { triggerMessage } = useMessage();
  const [session, setSession] = useState<ReviewSession | null>(null);
  const [category, setCategory] = useState<Category | undefined>(undefined);
  const [subcategory, setSubcategory] = useState<Subcategory | undefined>(
    undefined
  );
  const [cards, setCards] = useState<SessionCard[]>([]);
  const [totals, setTotals] = useState(sessionTotals);

  const loadData = () => {
    try {
      if (id) {
        const session = getReviewSessionById(id[0]);
        setSession(session);
        if (session?.categoryId) {
          const category = getCategoryById(session.categoryId);
          setCategory(category);
        }
        if (session?.subcategoryId) {
          const subcategory = getSubcategoryById(session.subcategoryId);
          setSubcategory(subcategory);
        }
        let correct = 0;
        let incorrect = 0;
        let total = 0;
        let cardIds: string[] = [];
        if (session?.right) {
          correct = session.right.length;
          cardIds = session.right;
        }
        if (session?.wrong) {
          incorrect = session.wrong.length;
          cardIds = [...cardIds, ...session.wrong];
        }
        total = correct + incorrect;
        setTotals({ correct, incorrect, total });
        cardIds = [...new Set(cardIds)];
        const allCards = cardIds.map((cardId) => getCardBySession(cardId));
        const flatCards = allCards.flat();
        const sessionCards: SessionCard[] = flatCards.map((card) => ({
          id: card.id,
          title: card.title,
          timesReviewed:
            countInstance(card.id, session?.wrong) +
            countInstance(card.id, session?.right),
          timesCorrect: countInstance(card.id, session?.right),
          timesIncorrect: countInstance(card.id, session?.wrong),
        }));
        setCards(sessionCards);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      triggerMessage("Error loading session: " + errorMsg, "error");
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  if (!session) {
    return <Text>Loading...</Text>;
  }

  return (
    <PageView>
      <Text variant="headlineMedium">Session Details</Text>
      {session.reviewedAt && (
        <Text variant="bodySmall">
          Reviewed on: {session.reviewedAt.toLocaleString()}
        </Text>
      )}
      <Text variant="bodyMedium">Session type: {session.reviewType}</Text>
      {category && <Text variant="bodyMedium">Category: {category.name}</Text>}
      {subcategory && (
        <Text variant="bodyMedium">Subcategory: {subcategory.name}</Text>
      )}
      <Text variant="bodyMedium">
        Cards Reviewed: {totals.total} (Correct: {totals.correct}, Incorrect:{" "}
        {totals.incorrect})
      </Text>
      <ScrollView style={styles.scrollView}>
        {cards.length > 0 ? (
          cards.map((card) => (
            <List.Item
              key={card.id}
              title={card.title}
              description={
                <>
                  <Text variant="labelSmall">Right: {card.timesCorrect}</Text>
                  <Text variant="labelSmall">Wrong: {card.timesIncorrect}</Text>
                </>
              }
              left={() => <List.Icon icon="card" />}
              right={() => (
                <IconButton
                  icon="chevron-right"
                  onPress={() => {
                    router.push("../cards/" + card.id);
                  }}
                />
              )}
            />
          ))
        ) : (
          <Text>No cards found.</Text>
        )}
      </ScrollView>
    </PageView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: "50%",
  },
});

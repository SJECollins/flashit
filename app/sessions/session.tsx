// app/session.tsx
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, Button } from "react-native-paper";
import PageView from "@/components/pageView";
import CardDisplay from "@/components/card";
import { Category, Card, getAllCategories } from "@/data/db";
import { useMessage } from "../_layout";

export default function SessionScreen() {
  const { triggerMessage } = useMessage();
  const { categoryId, subcategoryId, reviewType } = useLocalSearchParams();

  const [category, setCategory] = useState<Category | undefined>();
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(false);
  const [incorrect, setIncorrect] = useState(false);

  useEffect(() => {
    const allCategories = getAllCategories();
    const found = allCategories.find((c) => c.id === categoryId);
    if (!found) {
      triggerMessage("Category not found", "error");
      router.back();
      return;
    }
    setCategory(found);

    let selectedCards: Card[] = [];
    if (reviewType === "incorrect") {
      selectedCards = found.cards.filter((c) => c.numIncorrect > 0);
    } else {
      selectedCards =
        found.cards.filter((c) => c.subcategoryId === subcategoryId) || [];
    }

    if (selectedCards.length === 0) {
      triggerMessage("No cards available for this session", "error");
      router.back();
      return;
    }

    setCards(selectedCards);
  }, [categoryId, subcategoryId, reviewType]);

  const handleNext = () => {
    if (!correct && !incorrect) {
      triggerMessage("Mark correct/incorrect to continue", "success");
      return;
    }

    setCards((prev) =>
      prev.map((card, idx) =>
        idx === currentIndex
          ? {
              ...card,
              numCorrect: card.numCorrect + (correct ? 1 : 0),
              numIncorrect: card.numIncorrect + (incorrect ? 1 : 0),
            }
          : card
      )
    );

    setCorrect(false);
    setIncorrect(false);

    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // TODO: Handle end of session
      triggerMessage("Session finished!", "success");
      router.replace("/"); // or results screen
    }
  };

  if (!category || cards.length === 0) {
    return (
      <PageView>
        <Text>Loading...</Text>
      </PageView>
    );
  }

  return (
    <PageView>
      <Text variant="headlineMedium">Category: {category.name}</Text>
      {cards[currentIndex] && (
        <CardDisplay
          card={cards[currentIndex]}
          setCorrect={setCorrect}
          setIncorrect={setIncorrect}
        />
      )}
      <Button mode="contained" onPress={handleNext}>
        {currentIndex < cards.length - 1 ? "Next Card" : "Finish"}
      </Button>
    </PageView>
  );
}

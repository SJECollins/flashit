import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text, Button, Card as PaperCard } from "react-native-paper";
import { Card } from "../data/db";

export default function CardDisplay({
  card,
  setCorrect,
  setIncorrect,
}: {
  card: Card;
  setCorrect: React.Dispatch<React.SetStateAction<boolean>>;
  setIncorrect: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [flipped, setFlipped] = useState(false);
  const [showClue, setShowClue] = useState(false);

  useEffect(() => {
    setCorrect(false);
    setIncorrect(false);
  }, [card]);

  const markCorrect = () => {
    setCorrect(true);
    setIncorrect(false);
  };

  const markIncorrect = () => {
    setIncorrect(true);
    setCorrect(false);
  };

  return (
    <PaperCard mode="elevated">
      <PaperCard.Content>
        <Text style={styles.cardText}>
          {flipped ? card.definition : card.title}
        </Text>
        {!flipped && showClue && <Text>{card.clue}</Text>}
      </PaperCard.Content>
      <PaperCard.Actions>
        <Button mode="contained" onPress={() => setFlipped(!flipped)}>
          {flipped ? "Show Title" : "Show Definition"}
        </Button>
        {card.clue && !showClue && !flipped && (
          <Button mode="outlined" onPress={() => setShowClue(true)}>
            Show Clue
          </Button>
        )}
        {flipped && (
          <View style={styles.row}>
            <Button mode="contained" onPress={markCorrect}>
              Correct
            </Button>
            <Button mode="contained-tonal" onPress={markIncorrect}>
              Incorrect
            </Button>
          </View>
        )}
      </PaperCard.Actions>
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  cardText: {
    marginVertical: 10,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
});

import { Text, Button, List, IconButton } from "react-native-paper";
import {
  getAllReviewSessions,
  getReviewSessionsByCategory,
  getReviewSessionsBySubcategory,
  ReviewSession,
} from "@/data/db";
import PageView from "@/components/pageView";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useMessage } from "../_layout";
import { ScrollView, StyleSheet } from "react-native";

export default function SessionsScreen() {
  const router = useRouter();
  const { triggerMessage } = useMessage();
  const { categoryId, subcategoryId } = useLocalSearchParams();
  const [sessions, setSessions] = useState<ReviewSession[]>([]);

  const loadData = () => {
    try {
      if (categoryId) {
        const sessions = getReviewSessionsByCategory(categoryId as string);
        setSessions(sessions);
      } else if (subcategoryId) {
        const sessions = getReviewSessionsBySubcategory(
          subcategoryId as string
        );
        setSessions(sessions);
      } else {
        const sessions = getAllReviewSessions();
        setSessions(sessions);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      triggerMessage("Failed to load sessions: " + errorMsg, "error");
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  return (
    <PageView>
      <Text variant="headlineMedium"> All Sessions: </Text>
      <ScrollView style={styles.scrollView}>
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <List.Item
              key={session.id}
              title={`Session on ${
                session.reviewedAt?.toLocaleDateString() || "N/A"
              }`}
              left={() => <List.Icon icon="calendar" />}
              right={() => (
                <IconButton
                  icon="chevron-right"
                  onPress={() => router.push("./" + session.id)}
                />
              )}
            />
          ))
        ) : (
          <Text>No sessions found.</Text>
        )}
      </ScrollView>
      <Button
        icon="plus"
        mode="contained"
        onPress={() => router.push("./session")}
      >
        New Session
      </Button>
    </PageView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: "80%",
  },
});

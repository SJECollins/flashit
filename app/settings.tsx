import { useAppTheme, useMessage } from "@/app/_layout";
import PageView from "@/components/pageView";
import { resetDatabase } from "@/data/db";
import { ScrollView, View } from "react-native";
import { Text, Button, Switch } from "react-native-paper";

export default function SettingsScreen() {
  const { darkMode, toggleTheme } = useAppTheme();
  const { triggerMessage } = useMessage();

  return (
    <PageView>
      <ScrollView style={{ flex: 1, padding: 10 }}>
        <Button
          mode="contained-tonal"
          style={{ marginTop: 20 }}
          onPress={() => {
            resetDatabase();
            triggerMessage("Database reset", "success");
          }}
        >
          Reset Database
        </Button>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 40,
          }}
        >
          <Text variant="titleLarge">Dark Mode</Text>
          <Switch value={darkMode} onValueChange={toggleTheme} />
        </View>
      </ScrollView>
    </PageView>
  );
}

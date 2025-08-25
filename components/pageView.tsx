import { View } from "react-native";
import { useTheme } from "react-native-paper";
import { ReactNode } from "react";

export default function PageView({ children }: { children: ReactNode }) {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        // alignItems: "center",
        padding: 20,
        backgroundColor: theme.colors.background,
      }}
    >
      {children}
    </View>
  );
}

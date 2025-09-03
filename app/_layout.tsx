import DisplayMessage from "@/components/displayMessage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { withLayoutContext } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import { setupDatabase } from "../data/db";

// Handle theme for app, based on device theme - darkmode by default
const ThemeContext = createContext<
  { darkMode: boolean; toggleTheme: () => void } | undefined
>(undefined);

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within a ThemeProvider");
  }
  return context;
};

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [darkMode, setDarkMode] = useState(
    Appearance.getColorScheme() === "dark"
  );
  const toggleTheme = () => setDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Messages/notifications
interface MessageContextType {
  message: string | null;
  messageType: "error" | "success" | null;
  triggerMessage: (message: string, type: "error" | "success") => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessage must be used within a MessageProvider");
  }
  return context;
};

const MessageProvider = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"error" | "success" | null>(
    null
  );

  const triggerMessage = (msg: string, type: "error" | "success") => {
    setMessage(msg);
    setMessageType(type);
  };

  return (
    <MessageContext.Provider value={{ message, messageType, triggerMessage }}>
      {children}
    </MessageContext.Provider>
  );
};

const { Navigator } = createDrawerNavigator();
const DrawerNavigator = withLayoutContext(Navigator);

// Root layout - bottom tabs for navigation
function RootLayout() {
  const { darkMode } = useAppTheme();
  const theme = darkMode ? MD3DarkTheme : MD3LightTheme;
  const { message, messageType } = useMessage();

  return (
    <PaperProvider theme={theme}>
      <StatusBar style={darkMode ? "light" : "dark"} />
      <DisplayMessage
        messageText={message ?? ""}
        messageType={messageType ?? "success"}
      />
      <DrawerNavigator
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.onBackground,
          drawerStyle: {
            backgroundColor: theme.colors.background,
          },
          drawerActiveTintColor: theme.colors.primary,
          drawerInactiveTintColor: theme.colors.onBackground,
        }}
      >
        <DrawerNavigator.Screen
          name="index"
          options={{
            headerShown: true,
            title: "Home",
            drawerIcon: ({ color, size }: { color: string; size: number }) => (
              <MaterialCommunityIcons name="home" color={color} size={24} />
            ),
          }}
        />
        <DrawerNavigator.Screen
          name="categories/index"
          options={{
            headerShown: true,
            title: "Categories",
            drawerIcon: ({ color, size }: { color: string; size: number }) => (
              <MaterialCommunityIcons
                name="format-list-bulleted"
                color={color}
                size={24}
              />
            ),
          }}
        />
        <DrawerNavigator.Screen
          name="cards/index"
          options={{
            headerShown: true,
            title: "Cards",
            drawerIcon: ({ color, size }: { color: string; size: number }) => (
              <MaterialCommunityIcons name="card" color={color} size={24} />
            ),
          }}
        />
        <DrawerNavigator.Screen
          name="sessions/index"
          options={{
            headerShown: true,
            title: "Sessions",
            drawerIcon: ({ color, size }: { color: string; size: number }) => (
              <MaterialCommunityIcons name="timer" color={color} size={24} />
            ),
          }}
        />
        <DrawerNavigator.Screen
          name="settings"
          options={{
            headerShown: true,
            title: "Settings",
            drawerIcon: ({ color, size }: { color: string; size: number }) => (
              <MaterialCommunityIcons name="cog" color={color} size={24} />
            ),
          }}
        />
        {/* Hidden navigation screens */}
        <DrawerNavigator.Screen
          name="cards/[id]"
          options={{
            headerShown: true,
            title: "Card Details",
            drawerItemStyle: { height: 0 },
          }}
        />
        <DrawerNavigator.Screen
          name="cards/add"
          options={{
            headerShown: true,
            title: "Add Card",
            drawerItemStyle: { height: 0 },
          }}
        />
        <DrawerNavigator.Screen
          name="categories/[id]"
          options={{
            headerShown: true,
            title: "Category Details",
            drawerItemStyle: { height: 0 },
          }}
        />
        <DrawerNavigator.Screen
          name="categories/add"
          options={{
            headerShown: true,
            title: "Add Category",
            drawerItemStyle: { height: 0 },
          }}
        />
        <DrawerNavigator.Screen
          name="subcategories/[id]"
          options={{
            headerShown: true,
            title: "Subcategory Details",
            drawerItemStyle: { height: 0 },
          }}
        />
        <DrawerNavigator.Screen
          name="subcategories/add"
          options={{
            headerShown: true,
            title: "Add Subcategory",
            drawerItemStyle: { height: 0 },
          }}
        />
        <DrawerNavigator.Screen
          name="sessions/[id]"
          options={{
            headerShown: true,
            title: "Session Details",
            drawerItemStyle: { height: 0 },
          }}
        />
        <DrawerNavigator.Screen
          name="sessions/new"
          options={{
            headerShown: true,
            title: "New Session",
            drawerItemStyle: { height: 0 },
          }}
        />
        <DrawerNavigator.Screen
          name="sessions/session"
          options={{
            headerShown: true,
            title: "Review Session",
            drawerItemStyle: { height: 0 },
          }}
        />
      </DrawerNavigator>
    </PaperProvider>
  );
}

// Layout wrapper - all the bits
export default function LayoutWrapper() {
  useEffect(() => {
    setupDatabase();
  }, []);

  return (
    <ThemeProvider>
      <MessageProvider>
        <RootLayout />
      </MessageProvider>
    </ThemeProvider>
  );
}

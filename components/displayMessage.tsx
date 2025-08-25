import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    zIndex: 99,
  },
  error: {
    backgroundColor: "#ffebee",
  },
  success: {
    backgroundColor: "#e8f5e9",
  },
  messageText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
  },
  successText: {
    color: "green",
  },
});

interface DisplayMessageProps {
  messageText: string;
  messageType: "error" | "success";
}

export default function DisplayMessage({
  messageText,
  messageType,
}: DisplayMessageProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<"error" | "success">("success");

  useEffect(() => {
    setMessage(messageText);
    setType(messageType);
    const timer = setTimeout(() => {
      setMessage(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [messageText, messageType]);

  if (!message) return null;

  return (
    <View style={[styles.container, styles[type]]}>
      <Text style={[styles.messageText, styles[`${type}Text`]]}>{message}</Text>
    </View>
  );
}

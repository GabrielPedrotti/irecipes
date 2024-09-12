import React, { useState, forwardRef } from "react";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Colors } from "../../constants/Colors";

interface ButtonProps {
  title: string;
  onClick: () => void;
  style?: object;
  isLoading?: boolean;
}

const ButtonComponent = forwardRef<TouchableOpacity, ButtonProps>(
  ({ title, onClick, style, isLoading = false, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <TouchableOpacity
        {...props}
        ref={ref}
        onPress={onClick}
        style={[styles.button, style, isFocused && styles.focused]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: "white" }}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  },
);

ButtonComponent.displayName = "TextInputComponent";
export default ButtonComponent;

const styles = StyleSheet.create({
  focused: {
    borderColor: "blue",
  },
  button: {
    alignItems: "center",
    padding: 10,
    width: 250,
    margin: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "white",
    backgroundColor: Colors.red.brand,
  },
});

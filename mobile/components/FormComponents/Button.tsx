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
  color?: "primary" | "secondary";
  disabled?: boolean;
}

const ButtonComponent = forwardRef<TouchableOpacity, ButtonProps>(
  (
    {
      title,
      onClick,
      style,
      isLoading = false,
      color = "primary",
      disabled,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <TouchableOpacity
        {...props}
        ref={ref}
        onPress={onClick}
        style={[
          color === "primary" ? styles.button : styles.buttonSecondary,
          style,
          isFocused && styles.focused,
        ]}
        disabled={isLoading || disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text
            style={
              color === "primary" ? { color: "white" } : { color: "black" }
            }
          >
            {title}
          </Text>
        )}
      </TouchableOpacity>
    );
  },
);

ButtonComponent.displayName = "ButtonComponent";
export default ButtonComponent;

const styles = StyleSheet.create({
  focused: {
    borderColor: "white",
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
  buttonSecondary: {
    alignItems: "center",
    padding: 10,
    width: 250,
    margin: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.red.brand,
    backgroundColor: "white",
  },
});

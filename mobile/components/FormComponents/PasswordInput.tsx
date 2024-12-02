import React, { useState, forwardRef } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";

interface TextInputProps {
  placeholder: string;
  title?: string;
  value: string;
  onChangeText: (text: string) => void;
  style?: object;
  required?: boolean;
  error?: string;
  isPasswordVisible: boolean;
  setPasswordVisible: (isVisible: boolean) => void;
}

const PasswordInput = forwardRef<TextInput, TextInputProps>(
  (
    {
      placeholder,
      title = "",
      value,
      onChangeText,
      style,
      required = false,
      error = "",
      isPasswordVisible,
      setPasswordVisible,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View style={styles.main}>
        {title && (
          <Text style={styles.titleInput}>
            {title} {required && "*"}
          </Text>
        )}
        <View style={{ flexDirection: "row" }}>
          <TextInput
            {...props}
            ref={ref}
            placeholder={placeholder}
            placeholderTextColor="black"
            value={value}
            onChangeText={onChangeText}
            style={[
              styles.input,
              style,
              isFocused && styles.focused,
              // required && styles.required,
              error !== "" && styles.error,
            ]}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            secureTextEntry={!isPasswordVisible}
          />
          <Ionicons
            name={!isPasswordVisible ? "eye-off" : "eye"}
            size={24}
            color="black"
            style={{ position: "absolute", right: 10, top: 8, }}
            onPress={() => {
              setPasswordVisible(!isPasswordVisible);
            }}
          />
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
export default PasswordInput;

const styles = StyleSheet.create({
  titleInput: {
    paddingBottom: 5,
  },
  main: {
    marginBottom: 10,
  },
  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 10,
  },
  focused: {
    borderColor: Colors.red.brand,
  },
  required: {
    borderColor: "red",
  },
  error: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
  },
});

import React, { useState, forwardRef } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Colors } from "../../constants/Colors";

interface TextInputProps {
  placeholder: string;
  title?: string;
  value: string;
  onChangeText: (text: string) => void;
  style?: object;
  required?: boolean;
  error?: string;
  multiline?: boolean;
  onFocus?: () => void;
}

const TextInputComponent = forwardRef<TextInput, TextInputProps>(
  (
    {
      placeholder,
      title = "",
      value,
      onChangeText,
      style,
      required = false,
      error = "",
      multiline = false,
      onFocus,
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

        <TextInput
          {...props}
          ref={ref}
          placeholder={placeholder}
          placeholderTextColor={"black"}
          value={value}
          multiline={multiline}
          onChangeText={onChangeText}
          style={[
            styles.input,
            style,
            isFocused && styles.focused,
            // required && styles.required,
            error !== "" && styles.error,
          ]}
          onFocus={onFocus}
          onBlur={() => setIsFocused(false)}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  },
);

TextInputComponent.displayName = "TextInputComponent";
export default TextInputComponent;

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

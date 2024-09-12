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
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View>
        {title && (
          <Text style={styles.titleInput}>
            {title} {required && "*"}
          </Text>
        )}

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
  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 10,
    marginBottom: 10,
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

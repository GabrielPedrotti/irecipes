import React, { useState, forwardRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from "react-native";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { Colors } from "../../constants/Colors";

interface DatePickerProps {
  title: string;
  value: Date;
  style?: object;
  setValue: (value: Date) => void;
  error?: string;
  onFocus?: () => void;
}

const DatePicker = forwardRef<TouchableOpacity, DatePickerProps>(
  ({ title, value, style, setValue, error, onFocus, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isDateSelected, setIsDateSelected] = useState(false);

    return (
      <View style={styles.main}>
        <View>
          <TouchableOpacity
            {...props}
            ref={ref}
            onPress={() => setShowDatePicker(!showDatePicker)}
            style={[
              styles.DatePicker,
              style,
              isFocused && styles.focused,
              error !== undefined && styles.error,
            ]}
            onFocus={onFocus}
            onBlur={() => setIsFocused(false)}
          >
            <Text style={{ color: "black" }}>
              {!isDateSelected ? title : format(value, "dd/MM/yyyy")}
            </Text>
          </TouchableOpacity>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
        <Modal
          visible={showDatePicker}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
          onDismiss={() => setShowDatePicker(false)}
          transparent={true}
        >
          <TouchableOpacity
            onPressOut={() => {
              if (Platform.OS === "ios") setShowDatePicker(false);
            }}
            activeOpacity={1}
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <View
              style={
                Platform.OS === "ios"
                  ? {
                      height: "40%",
                      width: "90%",
                      backgroundColor: "white",
                      borderRadius: 8,
                    }
                  : null
              }
            >
              <RNDateTimePicker
                value={value}
                mode="date"
                display="inline"
                textColor="black"
                accentColor={Colors.red.brand}
                themeVariant="light"
                maximumDate={new Date()}
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setIsDateSelected(true);
                    setValue(selectedDate);
                    setShowDatePicker(false);
                  }
                }}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  },
);

DatePicker.displayName = "DatePicker";
export default DatePicker;

const styles = StyleSheet.create({
  focused: {
    borderColor: "white",
  },
  main: {
    marginBottom: 10,
  },
  DatePicker: {
    justifyContent: "center",
    alignItems: "flex-start",
    // padding: 10,
    width: 250,
    // marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "black",
    // backgroundColor: "gray",
  },
  error: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
  },
});

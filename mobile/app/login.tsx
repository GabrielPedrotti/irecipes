import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Keyboard,
  TouchableOpacity,
  Image,
} from "react-native";

import TextInput from "../components/FormComponents/TextInput";
import PasswordInput from "../components/FormComponents/PasswordInput";
import Button from "../components/FormComponents/Button";
import { FontAwesome } from "@expo/vector-icons";
import logoTransparent from "../assets/images/logo-transparent.png";
type FormData = {
  email: string;
  password: string;
};

export default function Login() {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>();
  const [submittedData, setSubmittedData] = useState(null as FormData | null);
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const onSubmit = (data: FormData) => {
    Keyboard.dismiss();
    // Simulate form submission
    console.log("Submitted Data:", data);
    setSubmittedData(data);
  };

  return (
    <SafeAreaView>
      <TouchableOpacity
        style={styles.container}
        onPressOut={Keyboard.dismiss}
        activeOpacity={1}
      >
        <Image style={styles.logo} source={logoTransparent} />

        {/* <FontAwesome
          style={{ paddingBottom: 10 }}
          name="user-circle"
          size={100}
          color="black"
        /> */}
        <Controller
          control={control}
          render={({ field }) => (
            <TextInput
              {...field}
              style={styles.input}
              placeholder="Email"
              required={true}
              error={errors.email && errors.email.message}
              onChangeText={(text) => setValue("email", text)}
            />
          )}
          name="email"
          rules={{ required: "You must enter your email" }}
        />

        <Controller
          control={control}
          render={({ field }) => (
            <PasswordInput
              {...field}
              style={styles.input}
              placeholder="Password"
              isPasswordVisible={isPasswordVisible}
              setPasswordVisible={setPasswordVisible}
              required={true}
              error={errors.password && errors.password.message}
              onChangeText={(text) => setValue("password", text)}
            />
          )}
          name="password"
          rules={{ required: "You must enter your password" }}
        />

        <Button title="Entrar" onClick={handleSubmit(onSubmit)} />

        {submittedData && (
          <View>
            <Text>Submitted Data:</Text>
            <Text>Name: {submittedData.email}</Text>
            <Text>Password: {submittedData.password}</Text>
          </View>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 400,
    height: 150,
    marginBottom: 10,
  },
  container: {
    padding: 16,
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
    top: "30%",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    width: 250,
    padding: 8,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});

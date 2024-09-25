import React, { useState, useContext } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  StyleSheet,
  SafeAreaView,
  Keyboard,
  TouchableOpacity,
  Image,
} from "react-native";

import TextInput from "../components/FormComponents/TextInput";
import PasswordInput from "../components/FormComponents/PasswordInput";
import Button from "../components/FormComponents/Button";
import logoTransparent from "../assets/images/logo-transparent.png";
import { useRouter } from "expo-router";
import { AuthContext } from "../context/AuthContext";
import { api } from "../service/api";
import ErrorModal from "../components/ErrorModal";

const formSchema = yup.object().shape({
  email: yup
    .string()
    .email("Formato de email inválido")
    .required("Email é obrigatório"),
  password: yup.string().required("Senha é obrigatória"),
});

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
  } = useForm<FormData>({
    resolver: yupResolver(formSchema),
  });
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const { setUserLogin } = useContext(AuthContext);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const response = await api({
        method: "POST",
        url: "users/login",
        data: data,
      });

      await setUserLogin(response.data.user);
      setIsLoading(false);
      router.replace("/");
      return response;
    } catch (error: any) {
      setShowErrorModal(true);
      setIsLoading(false);
      console.error("Error:", error.response);
      setError(error.response.data.error);
    }
  };

  return (
    <SafeAreaView>
      <TouchableOpacity
        style={styles.container}
        onPressOut={Keyboard.dismiss}
        activeOpacity={1}
      >
        <Image style={styles.logo} source={logoTransparent} />

        <Controller
          control={control}
          render={({ field }) => (
            <TextInput
              {...field}
              style={styles.input}
              placeholder="Email"
              required={true}
              error={errors.email?.message}
              onChangeText={(text) => setValue("email", text)}
            />
          )}
          name="email"
        />

        <Controller
          control={control}
          render={({ field }) => (
            <PasswordInput
              {...field}
              style={styles.input}
              placeholder="Senha"
              isPasswordVisible={isPasswordVisible}
              setPasswordVisible={setPasswordVisible}
              required={true}
              error={errors.password?.message}
              onChangeText={(text) => setValue("password", text)}
            />
          )}
          name="password"
        />

        <Button
          title="Entrar"
          isLoading={isLoading}
          onClick={handleSubmit(onSubmit)}
        />
        <Button
          title="Cadastre-se"
          color={"secondary"}
          onClick={() => {
            router.replace("/SignUp/signUp");
          }}
        />
      </TouchableOpacity>
      {showErrorModal && (
        <ErrorModal
          isVisible={showErrorModal}
          message={'Erro ao criar usuário: "' + error + '"'}
          onClose={() => {
            setShowErrorModal(false);
          }}
        />
      )}
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
    width: 250,
    padding: 8,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});

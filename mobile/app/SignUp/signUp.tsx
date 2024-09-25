import React, { useState } from "react";
import { useForm, Controller, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { addYears } from "date-fns";
import * as yup from "yup";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Keyboard,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import Checkbox from "expo-checkbox";
import TextInput from "../../components/FormComponents/TextInput";
import PasswordInput from "../../components/FormComponents/PasswordInput";
import DatePicker from "../../components/FormComponents/DatePicker";
import Button from "../../components/FormComponents/Button";
import logoTransparent from "../../assets/images/logo-transparent.png";
import { Colors } from "../../constants/Colors";
import { useRouter } from "expo-router";

const formSchema = yup.object().shape({
  userName: yup
    .string()
    .required("Nome de usuário é obrigatório")
    .min(3, "Nome de usuário deve ter no mínimo 3 caracteres")
    .max(20, "Nome de usuário deve ter no máximo 20 caracteres")
    .matches(
      /^[a-zA-Z0-9_]*$/,
      "Nome de usuário não pode conter caracteres especiais",
    ),
  name: yup
    .string()
    .required("Nome é obrigatório")
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres"),
  email: yup
    .string()
    .email("Formato de email inválido")
    .required("Email é obrigatório"),
  password: yup.string().required("Senha é obrigatória"),
  passwordConfirmation: yup
    .string()
    .oneOf([yup.ref("password"), undefined], "Senhas devem ser iguais"),
  birthDate: yup
    .date()
    .required("Data de nascimento é obrigatória")
    .test("age", "Você deve ter mais de 16 anos", function (value) {
      const today = new Date();
      const minAgeDate = addYears(today, -16);
      return value <= minAgeDate;
    }),
  useTerms: yup.boolean().oneOf([true], "Você deve aceitar os termos de uso"),
});

type FormData = {
  userName: string;
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  birthDate: Date;
  useTerms: boolean;
};

export default function SignUp() {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(formSchema) as unknown as Resolver<FormData>,
    defaultValues: {
      birthDate: new Date(),
    },
  });
  const router = useRouter();
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isPasswordConfirmationVisible, setPasswordConfirmationVisible] =
    useState(false);

  const onSubmit = (data: FormData) => {
    Keyboard.dismiss();
    const dataWithStringDate = {
      ...data,
      birthDate: data.birthDate.toISOString(),
      useTerms: data.useTerms ? "Accepted" : "Declined",
    };

    router.push({
      pathname: "/SignUp/signUpConfirmation",
      params: dataWithStringDate,
    });
    setSubmittedData(data);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          <Image style={styles.logo} source={logoTransparent} />

          <Controller
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                style={styles.input}
                placeholder="Nome de Usuário"
                required={true}
                error={errors.userName?.message}
                onChangeText={(text) => setValue("userName", text)}
              />
            )}
            name="userName"
          />

          <Controller
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                style={styles.input}
                placeholder="Nome"
                required={true}
                error={errors.name?.message}
                onChangeText={(text) => setValue("name", text)}
              />
            )}
            name="name"
          />

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
              <DatePicker
                {...field}
                style={styles.input}
                title={"Data de Nascimento"}
                error={errors.birthDate?.message}
                value={field.value}
                setValue={(value) => setValue("birthDate", value)}
              />
            )}
            name="birthDate"
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
          <Controller
            control={control}
            render={({ field }) => (
              <PasswordInput
                {...field}
                style={styles.input}
                placeholder="Confirme a senha"
                isPasswordVisible={isPasswordConfirmationVisible}
                setPasswordVisible={setPasswordConfirmationVisible}
                required={true}
                error={errors.passwordConfirmation?.message}
                onChangeText={(text) => setValue("passwordConfirmation", text)}
              />
            )}
            name="passwordConfirmation"
          />
          <Controller
            control={control}
            render={({ field }) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <Checkbox
                  value={field.value}
                  onValueChange={field.onChange}
                  color={field.value ? Colors.red.brand : undefined}
                />
                <View style={{ display: "flex" }}>
                  <Text style={{ color: "black" }}>Aceito os</Text>
                  <TouchableOpacity
                    onPress={() => {
                      //TODO add terms of use link page
                      console.log("Terms of Use");
                    }}
                  >
                    <Text
                      style={{
                        color: Colors.red.brand,
                        textDecorationLine: "underline",
                      }}
                    >
                      Termos de Uso
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            name="useTerms"
          />

          <Button title="Cadastrar-se" onClick={handleSubmit(onSubmit)} />

          <TouchableOpacity
            onPress={() => {
              router.replace("/login");
            }}
          >
            <Text
              style={{
                color: Colors.red.brand,
                textDecorationLine: "underline",
              }}
            >
              Já possui uma conta? Faça login
            </Text>
          </TouchableOpacity>

          {submittedData && (
            <View>
              <Text>Submitted Data:</Text>
              <Text>Username: {submittedData.userName}</Text>
              <Text>Name: {submittedData.name}</Text>
              <Text>Email: {submittedData.email}</Text>
              <Text>
                Birth Date: {new Date(submittedData.birthDate).toDateString()}
              </Text>
              <Text>
                Terms of Use: {submittedData.useTerms ? "Accepted" : "Declined"}
              </Text>
              <Text>Password: {submittedData.password}</Text>
              <Text>
                Password Confirmation: {submittedData.passwordConfirmation}
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
  scrollView: {
    padding: 16,
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 400,
    height: 150,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    width: 250,
    padding: 8,
    marginBottom: 2,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});

/* eslint-disable import/no-unresolved */
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useForm, Controller, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "@/context/AuthContext";
import { updateProfile } from "@/service/user";
import { useRouter } from "expo-router";
import { User } from "@/types/User";
import { useToast } from "native-base";
import TextInput from "@/components/FormComponents/TextInput";
import Button from "@/components/FormComponents/Button";

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
});

type FormData = {
  userName: string;
  name: string;
};

export default function EditProfile() {
  const { user, setUserLogin } = React.useContext(AuthContext);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(formSchema) as unknown as Resolver<FormData>,
    defaultValues: {
      userName: user?.userName,
      name: user?.name,
    },
  });

  const toast = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    Keyboard.dismiss();
    setIsLoading(true);
    try {
      if (user) {
        const updatedUser = await updateProfile(user._id, {
          name: data.name,
          userName: data.userName,
        } as User);
        console.log("updatedUser", updatedUser);
        await setUserLogin(updatedUser?.user);
        toast.show({
          title: "Profile updated successfully!",
          style: { backgroundColor: "green" },
          avoidKeyboard: true,
        });
        router.back();
      }
    } catch (error: any) {
      console.warn(`Failed to update user: ${error}`);
      toast.show({
        title: "Failed to update user!",
        style: { backgroundColor: "red" },
        avoidKeyboard: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={36}
            color="black"
            style={styles.icon}
          />
        </TouchableOpacity>
        <View style={styles.form}>
          <Text style={styles.profileHeader}>Editar Perfil</Text>
          <Controller
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                title="Nome de Usuário"
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
                title="Nome"
                style={styles.input}
                placeholder="Nome"
                required={true}
                error={errors.name?.message}
                onChangeText={(text) => setValue("name", text)}
              />
            )}
            name="name"
          />

          <Button
            style={{ marginLeft: 0 }}
            title="Salvar"
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            isLoading={isLoading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    margin: 10,
    marginTop: 20,
  },
  form: {
    height: "70%",
    // bottom: 0,
    // backgroundColor: "red",
  },
  profileHeader: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 50,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1000,
  },
  icon: {
    elevation: 5,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    width: 250,
    padding: 8,
    marginBottom: 2,
  },
  scrollView: {
    padding: 16,
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
});

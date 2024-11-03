// edit profile page, edit userName and profile image

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "@/context/AuthContext";
import { updateProfile } from "@/service/user";
import { Colors } from "@/constants/Colors";
import { User } from "@/types/User";

export default function EditProfile() {
  const { user, setUserLogin } = React.useContext(AuthContext);
  const navigation = useNavigation();
  const [userName, setUserName] = useState(user?.name);
  const [profileImage, setProfileImage] = useState(user?.profileImage);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      if (user) {
        const updatedUser = await updateProfile(user._id, {
          name: userName,
          profileImage,
        } as User);
        setUserLogin(updatedUser);
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert(
        "Erro ao atualizar perfil",
        "Erro ao atualizar perfil, tente novamente",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 20,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleUpdateProfile}>
          <Text style={{ color: Colors.primary, fontSize: 16 }}>Salvar</Text>
        </TouchableOpacity>
      </View>
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Image
          source={{ uri: profileImage }}
          style={{ width: 100, height: 100, borderRadius: 50 }}
        />
        <TouchableOpacity>
          <Text style={{ color: Colors.primary, fontSize: 16 }}>
            Alterar foto
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ padding: 20 }}>
        <Text style={{ color: Colors.text, fontSize: 16 }}>Nome</Text>
        <TextInput
          style={{
            borderBottomWidth: 1,
            borderBottomColor: Colors.text,
            color: Colors.text,
            fontSize: 16,
          }}
          value={userName}
          onChangeText={setUserName}
        />
      </View>
    </View>
  );
}

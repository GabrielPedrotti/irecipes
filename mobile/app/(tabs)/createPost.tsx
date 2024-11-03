import React, { useState, useContext, useEffect } from "react";
import { StyleSheet } from "react-native";
import {
  SafeAreaView,
  TouchableOpacity,
  Image,
  Keyboard,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import TextInput from "../../components/FormComponents/TextInput";
import { View, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadVideoToBackend } from "../../service/video";
import { AuthContext } from "../../context/AuthContext";
import { Colors } from "../../constants/Colors";
import Button from "../../components/FormComponents/Button";
import * as yup from "yup";
import { useForm, Controller, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useNavigation } from "@react-navigation/native";
import SectionedMultiSelect from "react-native-sectioned-multi-select";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { tastesToSelect } from "../../constants/Tastes";
import { useRouter } from "expo-router";
import ErrorModal from "@/components/ErrorModal";
import SuccessModal from "@/components/SuccessModal";

const formSchema = yup.object().shape({
  videoUri: yup.string().required("Vídeo é obrigatório"),
  title: yup.string().required("Título é obrigatório"),
  description: yup.string().required("Descrição é obrigatória"),
  tags: yup.array().of(yup.string()).required("Tags são obrigatórias"),
});

type FormData = {
  videoUri: string;
  title: string;
  description: string;
  tags: string[];
};

export default function CreatePost() {
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(formSchema) as unknown as Resolver<FormData>,
  });

  const [videoUri, setVideoUri] = useState("");
  const [videoAssets, setVideoAssets] =
    useState<ImagePicker.ImagePickerAsset>();
  const [thumbnailUri, setThumbnailUri] = useState("");
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState("");
  // const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.addListener("blur", (e) => {
      reset();
      setVideoUri("");
      setThumbnailUri("");
    });
  }, [navigation, videoUri]);

  const pickVideo = async () => {
    setLoadingVideo(true);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    });

    if (!result.canceled) {
      const thumbnail = await VideoThumbnails.getThumbnailAsync(
        result.assets[0].uri,
        {
          time: 2000,
        },
      );
      setVideoAssets(result.assets[0]);
      setVideoUri(result.assets[0].uri);
      setValue("videoUri", result.assets[0].uri);
      setThumbnailUri(thumbnail.uri);
      setLoadingVideo(false);
    } else {
      setLoadingVideo(false);
    }
  };

  const removeVideo = () => {
    setVideoUri("");
    setThumbnailUri("");
  };

  const onSubmit = async (data: FormData) => {
    setUploading(true);
    Keyboard.dismiss();

    try {
      // Chama a função de upload passando o URI do vídeo
      const title = data.title;
      const description = data.description;
      const tags = data.tags;
      const duration = videoAssets?.duration as any;
      const userId = user._id as any;

      await uploadVideoToBackend({
        videoUri,
        title,
        description,
        tags,
        duration,
        userId,
      });
      setUploading(false);
      setShowSuccessModal(true);
    } catch (error) {
      setUploading(false);
      console.error("Erro ao fazer upload:", error);
      setError(JSON.stringify(error));
      setShowErrorModal(true);
    }
  };

  function renderSelectText() {
    const selectedItems = getValues("tags");
    if (!selectedItems || selectedItems.length === 0) {
      return "Selecione as tags";
    }
    const c = selectedItems.length;
    if (c > 0) {
      return `${c} tag(s) selecionadas`;
    }
  }

  return (
    <SafeAreaView>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView style={{ marginBottom: 20 }}>
          <TouchableOpacity
            style={styles.container}
            onPressOut={Keyboard.dismiss}
            activeOpacity={1}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                marginBottom: 10,
              }}
            >
              Qual sua nova receita?
            </Text>
            <View style={{ marginTop: 40 }}>
              <View
                style={{
                  flexDirection: "row",
                  marginBottom: 10,
                  justifyContent: "space-between",
                }}
              >
                <Controller
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      style={styles.input}
                      title="Título"
                      placeholder="Escreva o nome da sua receita."
                      multiline={true}
                      required={true}
                      error={errors.title?.message}
                      onChangeText={(text) => setValue("title", text)}
                    />
                  )}
                  name="title"
                />
                <TouchableOpacity onPress={pickVideo}>
                  {!thumbnailUri ? (
                    <View>
                      <View
                        style={{
                          marginTop: 19,
                          width: 160,
                          height: 130,
                          backgroundColor: Colors.red.brand,
                          borderRadius: 10,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {errors.videoUri?.message && !loadingVideo ? (
                          <Text
                            style={{
                              color: "black",
                              fontSize: 14,
                              fontWeight: "bold",
                            }}
                          >
                            {errors.videoUri?.message}
                          </Text>
                        ) : !loadingVideo ? (
                          <Text
                            style={{
                              color: "white",
                              fontSize: 14,
                              fontWeight: "bold",
                            }}
                          >
                            Selecionar vídeo
                          </Text>
                        ) : (
                          <ActivityIndicator color="white" />
                        )}
                      </View>
                    </View>
                  ) : (
                    <View>
                      <Image
                        source={{ uri: thumbnailUri }}
                        style={styles.image}
                      />
                      <View
                        style={{
                          position: "absolute",
                          top: 115,
                          left: 10,
                          borderRadius: 10,
                          padding: 5,
                        }}
                      >
                        <TouchableOpacity
                          onPress={removeVideo}
                          style={{ width: "auto", height: "auto" }}
                        >
                          <Text
                            style={{
                              color: "white",
                              fontWeight: 900,
                              fontSize: 18,
                            }}
                          >
                            Remover
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
              <Controller
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    style={styles.description}
                    title="Descrição"
                    placeholder="Descreva o passo a passo da sua receita..."
                    multiline={true}
                    required={true}
                    error={errors.description?.message}
                    onChangeText={(text) => setValue("description", text)}
                  />
                )}
                name="description"
              />
              <Controller
                control={control}
                render={({ field }) => (
                  <View>
                    <SectionedMultiSelect
                      {...field}
                      items={tastesToSelect}
                      IconRenderer={Icon}
                      uniqueKey="id"
                      selectText="Selecione as tags"
                      renderSelectText={renderSelectText}
                      onSelectedItemsChange={(selectedItems) =>
                        setValue("tags", selectedItems)
                      }
                      selectedItems={field.value}
                      single={false}
                      hideSearch={true}
                      confirmText="Selecionar"
                      modalAnimationType="slide"
                      colors={{ primary: Colors.red.brand }}
                      modalWithSafeAreaView={true}
                      styles={{
                        chipContainer: styles.multiSelectChipContainer,
                        chipText: styles.multiSelectChipText,
                        selectToggle: !errors.description?.message
                          ? styles.multiSelectBox
                          : { ...styles.multiSelectBox, borderColor: "red" },
                      }}
                    />
                    {errors.description?.message && (
                      <Text style={styles.errorText}>
                        {errors.description?.message}
                      </Text>
                    )}
                  </View>
                )}
                name="tags"
              />
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Button
                style={{ margin: 10, width: 150, marginTop: 20 }}
                title="Cancelar"
                color={"secondary"}
                onClick={() => {
                  removeVideo();
                  router.push("/");
                }}
                disabled={uploading}
              />
              <Button
                style={{ margin: 10, width: 150, marginTop: 20 }}
                title="Postar"
                onClick={handleSubmit(onSubmit)}
                isLoading={uploading}
              />
            </View>
          </TouchableOpacity>
          {showErrorModal && (
            <ErrorModal
              isVisible={showErrorModal}
              message={'Erro ao postar sua receita: "' + error + '"'}
              onClose={() => {
                setShowErrorModal(false);
              }}
            />
          )}
          {showSuccessModal && (
            <SuccessModal
              isVisible={showSuccessModal}
              message="Receita postada com sucesso!"
              onClose={() => {
                setShowSuccessModal(false);
                // TODO create logic to push to user profile with the new post
                router.push("/");
              }}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    margin: 10,
    marginTop: 30,
  },
  logo: {
    width: 400,
    height: 150,
    marginBottom: 10,
  },
  input: {
    height: 130,
    borderColor: "gray",
    borderWidth: 1,
    width: 160,
    padding: 8,
    backgroundColor: "white",
  },
  multiSelectBox: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    width: "auto",
    padding: 8,
    marginBottom: 2,
    borderRadius: 10,
    backgroundColor: "white",
    fontSize: 14,
  },
  multiSelectChipContainer: {
    borderWidth: 0,
    backgroundColor: "#ddd",
    borderRadius: 8,
  },
  multiSelectChipText: {
    color: "#222",
    fontSize: 14.5,
  },
  description: {
    height: 130,
    borderColor: "gray",
    borderWidth: 1,
    width: "auto",
    padding: 8,
    backgroundColor: "white",
  },
  image: {
    borderRadius: 10,
    marginTop: 19,
    width: 150,
    height: 130,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});

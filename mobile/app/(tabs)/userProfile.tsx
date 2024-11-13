/* eslint-disable import/no-unresolved */
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { getUserVideos } from "@/service/userVideo";
import { IVideo } from "@/types/Video";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "@/constants/Colors";
import * as ImagePicker from "expo-image-picker";
import { uploadProfileImage } from "@/service/user";
import Button from "../../components/FormComponents/Button";
import { Modal } from "native-base";

export default function UserProfile() {
  const { user, setUserLogin, logout } = useContext(AuthContext);
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [thumbnails, setThumbnails] = useState<{ [key: string]: string }>({});
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (user?._id) {
        fetchUserVideos();
      }
    });

    return unsubscribe;
  }, [navigation, user?._id]);

  useEffect(() => {
    fetchUserVideos();
  }, [user]);

  const fetchUserVideos = async () => {
    setIsLoading(true);
    if (user) {
      const userVideos = await getUserVideos(user._id);

      if (userVideos.videos.length > 0) {
        setVideos(userVideos.videos);
      } else {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const generateThumbnails = async () => {
      for (const video of videos) {
        if (!thumbnails[video._id]) {
          try {
            const { uri } = await VideoThumbnails.getThumbnailAsync(video.url, {
              time: 15000,
            });
            setThumbnails((prev) => ({ ...prev, [video._id]: uri }));
          } catch (e: any) {
            console.warn(`Failed to generate thumbnail for video ${video._id}`);
          }
        }
      }
      setIsLoading(false);
    };

    if (videos.length > 0) {
      generateThumbnails();
    }
  }, [videos]);

  const handleVideoPress = (video: IVideo) => {
    router.push({
      pathname: `/video/[videoId]`,
      params: { videoId: video._id },
    });
  };

  const renderVideoItem = ({ item }: { item: IVideo }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity onPress={() => handleVideoPress(item)}>
        <Image
          source={{
            uri: thumbnails[item._id] || "https://via.placeholder.com/150",
          }}
          style={styles.image}
        />
        <View
          style={{
            position: "absolute",
            top: 85,
            left: 10,
            borderRadius: 10,
            padding: 5,
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: 900,
              fontSize: 16,
            }}
          >
            {item.title}
          </Text>
        </View>
        <View
          style={{
            position: "absolute",
            top: 25,
            right: 10,
            borderRadius: 10,
            padding: 5,
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: 900,
              fontSize: 18,
            }}
          >
            {item.likes.length}
            <Ionicons name="heart" size={24} color="white" />
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const pickImage = async () => {
    setLoadingPhoto(true);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled) {
      const responseImage = await fetch(result.assets[0].uri);
      const blob = await responseImage.blob();

      try {
        await uploadProfileImage(user?._id || "", blob);
        if (user) {
          await setUserLogin(user);
        }
        await fetchUserVideos();
      } catch (error) {
        console.error("Error uploading profile image", error);
      }

      setLoadingPhoto(false);
    } else {
      setLoadingPhoto(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileHeaderContainer}>
        <TouchableOpacity
          disabled={loadingPhoto}
          onPress={pickImage}
          style={styles.uploadProfileImage}
        >
          {loadingPhoto ? (
            <ActivityIndicator style={styles.icon} size="small" color="white" />
          ) : (
            <Ionicons
              name="camera"
              size={24}
              color="white"
              style={styles.icon}
            />
          )}

          <Image
            source={{
              uri: user?.profileImage || "https://via.placeholder.com/100",
            }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <Text style={styles.profileName}>{user?.userName}</Text>
        <View style={styles.followInfo}>
          <View style={styles.followersContainer}>
            <Text style={styles.followersNumber}>
              {user?.followers?.length}
            </Text>
            <Text style={styles.followersLabel}>Followers</Text>
          </View>
          <View style={styles.followingContainer}>
            <Text style={styles.followingNumber}>
              {user?.following?.length}
            </Text>
            <Text style={styles.followingLabel}>Following</Text>
          </View>
        </View>
        <View style={styles.optionsSection}>
          <Button
            style={styles.editProfileButton}
            title="Editar Perfil"
            color={"primary"}
            onClick={() => {
              router.push("/EditProfile/editProfile");
            }}
          />

          <Button
            style={styles.LogoutButton}
            title="Sair?"
            color={"secondary"}
            onClick={() => {
              setShowModal(!showModal);
            }}
          />
          <Modal isOpen={showModal} onClose={() => setShowModal(!showModal)}>
            <Modal.Content>
              <Modal.CloseButton />
              <Modal.Header>Sair</Modal.Header>
              <Modal.Body>
                <Text>Tem certeza que deseja sair?</Text>
                <Button
                  style={{ marginTop: 16 }}
                  title="Sair"
                  color={"primary"}
                  onClick={async () => {
                    await logout();
                    router.push("/");
                    setShowModal(!showModal);
                  }}
                />
              </Modal.Body>
            </Modal.Content>
          </Modal>
        </View>
      </View>
      <View
        style={{
          borderBottomColor: "black",
          borderBottomWidth: StyleSheet.hairlineWidth,
          paddingBottom: 16,
          paddingTop: 16,
        }}
      />
      {isLoading ? (
        <ActivityIndicator
          style={{ marginTop: 24 }}
          size="large"
          color="black"
        />
      ) : !isLoading && videos.length > 0 ? (
        <FlatList
          data={videos}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={{
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        />
      ) : (
        <Text
          style={{ textAlign: "center", alignItems: "center", marginTop: 24 }}
        >
          Você ainda não postou nenhuma receita!
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    margin: 10,
    marginTop: 20,
  },
  profileHeaderContainer: {
    alignItems: "center",
    marginBottom: 6,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
    marginTop: 24,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
    marginBottom: 8,
  },
  followInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "60%",
    marginTop: 8,
    marginBottom: 16,
  },
  followersContainer: {
    alignItems: "center",
  },
  followersNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
  followersLabel: {
    fontSize: 14,
    color: "gray",
  },
  followingContainer: {
    alignItems: "center",
  },
  followingNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
  followingLabel: {
    fontSize: 14,
    color: "gray",
  },
  profileHeader: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  image: {
    borderRadius: 10,
    marginTop: 19,
    width: 150,
    height: 130,
  },
  itemContainer: {
    margin: 8,
  },
  thumbnail: {
    width: 100,
    height: 150,
    margin: 5,
  },
  optionsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "60%",
    marginTop: 16,
  },
  editProfileButton: {
    backgroundColor: Colors.red.brand,
    padding: 10,
    borderRadius: 5,
    width: "45%",
    alignItems: "center",
  },
  LogoutButton: {
    padding: 10,
    borderRadius: 5,
    width: "45%",
    alignItems: "center",
  },
  uploadProfileImage: {
    padding: 10,
    borderRadius: 5,
    width: "80%",
    alignItems: "center",
  },
  icon: {
    position: "absolute",
    top: 100,
    right: 85,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
});

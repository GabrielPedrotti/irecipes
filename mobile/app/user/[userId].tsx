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
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { getUserVideos } from "@/service/userVideo";
import { IVideo } from "@/types/Video";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { User } from "@/types/User";
import { api } from "@/service/api";
import { followUser, unfollowUser } from "@/service/user";
import Button from "../../components/FormComponents/Button";

export default function UserProfile() {
  const { user: authUser } = useContext(AuthContext);
  const { userId } = useLocalSearchParams();
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [thumbnails, setThumbnails] = useState<{ [key: string]: string }>({});
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUser(userId);
    }
  }, [userId]);

  const fetchUser = async (userId: string | string[]) => {
    setIsLoadingUser(true);
    try {
      const userResponse = await api({
        method: "GET",
        url: `users/${userId}`,
      });
      setUser(userResponse.data);
      setIsLoadingUser(false);
    } catch (error) {
      console.warn(`Failed to fetch user: ${error}`);
      setIsLoadingUser(false);
    }
  };

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
          } catch (e: unknown) {
            if (e instanceof Error) {
              console.warn(
                `Failed to generate thumbnail for video ${video._id}: ${e.message}`,
              );
            } else {
              console.warn(
                `Failed to generate thumbnail for video ${video._id}`,
              );
            }
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

  const userFollows = user?.followers?.includes(authUser?._id ?? "");

  const handleFollow = async (userId: string) => {
    if (userFollows) {
      await unfollowUser(authUser?._id ?? "", userId);
    } else {
      await followUser(authUser?._id ?? "", userId);
    }
    await fetchUser(userId);
    setLoadingFollow(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons
          name="arrow-back"
          size={36}
          color="black"
          style={styles.icon}
        />
      </TouchableOpacity>

      {isLoadingUser || isLoading ? (
        <ActivityIndicator style={styles.loading} size="large" color="black" />
      ) : (
        <>
          <View style={styles.profileHeaderContainer}>
            <TouchableOpacity
              disabled={true}
              onPress={() => {}}
              style={styles.uploadProfileImage}
            >
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
            <View style={styles.followSection}>
              <Button
                style={styles.followButton}
                title={userFollows ? "Unfollow" : "Follow"}
                color={userFollows ? "secondary" : "primary"}
                isLoading={loadingFollow}
                disabled={loadingFollow}
                onClick={() => {
                  setLoadingFollow(!loadingFollow);
                  handleFollow(user?._id ?? "");
                }}
              />
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
        </>
      )}

      {!isLoading && !isLoadingUser && videos.length > 0 ? (
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
      ) : !isLoading && !isLoadingUser && videos.length === 0 ? (
        <Text
          style={{
            textAlign: "center",
            alignItems: "center",
            marginTop: 24,
          }}
        >
          Este usuário ainda não postou nenhum vídeo!
        </Text>
      ) : null}
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
  followSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "60%",
    marginTop: 16,
  },
  followButton: {
    borderRadius: 5,
    width: "80%",
    alignItems: "center",
  },
  uploadProfileImage: {
    padding: 10,
    borderRadius: 5,
    width: "80%",
    alignItems: "center",
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
  loading: {
    flex: 1,
    marginTop: 200,
    justifyContent: "center",
    alignItems: "center",
  },
});

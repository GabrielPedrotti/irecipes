/* eslint-disable import/no-unresolved */
import React, { useRef, useState, useContext, useEffect } from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Image,
} from "react-native";
import { IVideo } from "@/types/Video";
import VideoScreen from "@/components/VideoPlayer";
import { useRouter } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "@/context/AuthContext";
import { getVideos } from "@/service/video";
import { sendInteractionData } from "@/service/videoInteraction";
import { postLike, deleteLike, getLikes } from "@/service/video";
import { useNavigation } from "@react-navigation/native";
import CommentsModal from "@/components/VideoComponents/CommentsModal";

export default function Index() {
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [videoSelected, setVideoSelected] = useState<IVideo | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreVideos, setHasMoreVideos] = useState(true);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 });
  const { height } = Dimensions.get("window");
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation();
  const router = useRouter();
  const { user, setUserLogin } = useContext(AuthContext);
  const isUserLoggedIn = !!user;

  useEffect(() => {
    if (user?._id) {
      setUserLogin(user);
      resetVideos();
    }
  }, [user?._id]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (user?._id) {
        resetVideos();
      }
    });

    return unsubscribe;
  }, [navigation, user?._id]);

  const resetVideos = async () => {
    setPage(1);
    setVideos([]);
    setHasMoreVideos(true);
    fetchVideos(1);
  };

  const fetchVideos = async (pageNumber = page) => {
    if (isLoading || !hasMoreVideos) return;
    setIsLoading(true);

    try {
      const response = await getVideos(pageNumber, user?._id || "");
      const newVideos = response;

      if (newVideos.length === 0) {
        setHasMoreVideos(false);
        return;
      }

      const uniqueVideos = newVideos.filter(
        (newVideo) =>
          !videos.some((existingVideo) => existingVideo._id === newVideo._id),
      );

      setVideos((prevVideos) => [...prevVideos, ...uniqueVideos]);
      setPage(pageNumber + 1);
    } catch (error) {
      console.error("Erro ao carregar vídeos", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      if (index !== null && index !== undefined) {
        setCurrentIndex(index);
      }
    }
  }).current;

  const sendVideoInteractionData = async (
    interactionType: string,
    videoId: string,
  ) => {
    if (!isUserLoggedIn) {
      router.push("/login");
      return;
    }

    try {
      await sendInteractionData(interactionType, user?._id, videoId, 0, false);
    } catch (error) {
      console.error("Erro ao registrar a interação", error);
    }
  };

  const likeVideo = async (videoData: IVideo) => {
    const liked = videoData.likes?.some((like: string) => like === user?._id);

    try {
      if (liked && user?._id) {
        await deleteLike(user?._id, videoData._id);
      }
      if (!liked && user?._id) {
        await postLike(user?._id, videoData._id);
      }

      const likes = await getLikes(videoData._id);
      const updatedVideos = videos.map((video) => {
        if (video._id === videoData._id) {
          const updatedLikes = Array.isArray(likes.likes) ? likes.likes : likes;
          return { ...video, likes: updatedLikes };
        }
        return video;
      });

      setVideos(updatedVideos);
    } catch (error) {
      console.error("error", error);
    }
  };

  return (
    <>
      <FlatList
        data={videos || null}
        renderItem={({ item, index }: any) => {
          let liked = item.likes?.some((like: string) => like === user?._id);

          return (
            <View style={{ height: height - tabBarHeight }}>
              <VideoScreen
                source={item.url}
                isPlaying={currentIndex === index}
                videoId={item._id}
                userId={item?.user_id || null}
              />
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  onPress={() => {
                    console.log("profile");
                  }}
                  style={styles.buttons}
                >
                  <Image
                    source={{
                      uri:
                        item.user?.profileImage || "https://picsum.photos/200",
                    }}
                    style={[
                      styles.icon,
                      {
                        width: 38,
                        height: 38,
                        borderRadius: 50,
                        zIndex: 1,
                        borderColor: "white",
                        borderWidth: 1,
                      },
                    ]}
                  />
                  <Text style={{ color: "white" }}>
                    {item.user?.userName || "user"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    liked = !liked;
                    likeVideo(item);
                    sendVideoInteractionData("like", item._id);
                  }}
                  style={styles.buttons}
                >
                  <Ionicons
                    name={"heart-outline"}
                    size={38}
                    color={!liked ? "white" : "red"}
                    style={styles.icon}
                  />
                  <Text style={{ color: "white" }}>{item.likes.length}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setVideoSelected(item);
                    setShowCommentsModal(!showCommentsModal);
                    sendVideoInteractionData("comment", item._id);
                  }}
                  style={styles.buttons}
                >
                  <Ionicons
                    name={"chatbubble-ellipses-outline"}
                    size={38}
                    color="white"
                    style={styles.icon}
                  />
                  <Text style={{ color: "white" }}>Comments</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    console.log("Shares");
                    sendVideoInteractionData("share", item._id);
                  }}
                  style={styles.buttons}
                >
                  <Ionicons
                    name={"share-outline"}
                    size={38}
                    color="white"
                    style={styles.icon}
                  />
                  <Text style={{ color: "white" }}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        keyExtractor={(item, index) => item?._id.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
        onEndReached={() => fetchVideos(page)} // Chama a função quando atinge o final da lista
        onEndReachedThreshold={0.5} // Quando carregar mais (50% antes de atingir o final)
        ListFooterComponent={
          isLoading ? (
            <ActivityIndicator
              style={{ marginTop: 100 }}
              size="large"
              color="#0000ff"
            />
          ) : null
        }
      />
      {videoSelected && user?._id && showCommentsModal && (
        <CommentsModal
          isVisible={showCommentsModal}
          onClose={() => setShowCommentsModal(!showCommentsModal)}
          userId={user?._id}
          video={videoSelected}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    top: "60%",
    right: 20,
    position: "absolute",
    transform: [{ translateY: -32 }],
  },
  buttons: {
    alignItems: "center",
    paddingBottom: 20,
  },
  icon: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
});

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
  ScrollView,
  Share,
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
import { Colors } from "@/constants/Colors";

export default function Index() {
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [videoSelected, setVideoSelected] = useState<IVideo | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreVideos, setHasMoreVideos] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 });
  const { height } = Dimensions.get("window");
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation();
  const router = useRouter();
  const {
    user,
    setUserLogin,
    isLoading: isLoadingUser,
  } = useContext(AuthContext);
  const isUserLoggedIn = !!user;
  const MAX_LENGTH = 100;

  useEffect(() => {
    if (user?._id && !isLoadingUser) {
      setUserLogin(user);
      resetVideos();
    } else if (!isUserLoggedIn && !isLoadingUser) {
      resetVideos();
    }
  }, [user?._id, isLoadingUser]);

  useEffect(() => {
    setIsExpanded(false);
  }, [currentIndex]);

  useEffect(() => {
    const onScreenFocus = () => {
      const state = navigation.getState();
      const routes = state ? state.routes : [];

      if (routes.length > 1) {
        const lastRoute = routes[routes.length - 2];

        if (lastRoute.name === "createPost") {
          resetVideos();
        }
      }
    };

    navigation.addListener("focus", onScreenFocus);

    return () => {
      navigation.removeListener("focus", onScreenFocus);
    };
  }, [navigation]);

  const resetVideos = async () => {
    console.log("resetVideos");
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

      // console.log("newVideos", newVideos);
      // verify if newVideos is array
      if (!Array.isArray(newVideos)) {
        return;
      }

      console.log("newVideos", newVideos);

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
      await sendInteractionData(interactionType, user?._id, videoId);
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

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const shareVideo = async (videoId: string) => {
    try {
      const shareUrl = `https://irecipes.com/videos/${videoId}`;
      const result = await Share.share({
        message: `Gostei dessa receita, vamos fazer? ${shareUrl}`,
      });

      // handle results if needed in the future
      // if (result.action === Share.sharedAction) {
      //   if (result.activityType) {
      //   } else {
      //   }
      // } else if (result.action === Share.dismissedAction) {
      // }
    } catch (error) {
      console.error("Error sharing video:", error);
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
                videoData={item}
                userId={item?.user_id || null}
              />
              <View style={styles.videoInfoContainer}>
                <Text style={[styles.text, styles.title]}>{item.title}</Text>
                <View style={styles.descriptionContainer}>
                  <ScrollView
                    style={
                      isExpanded
                        ? styles.scrollContainerExpanded
                        : styles.scrollContainer
                    }
                    contentContainerStyle={styles.scrollContent}
                    nestedScrollEnabled={true}
                  >
                    <Text style={[styles.text, styles.description]}>
                      {isExpanded
                        ? item.description
                        : item.description.slice(0, MAX_LENGTH)}
                      {item.description.length > MAX_LENGTH && !isExpanded
                        ? "..."
                        : ""}
                    </Text>
                  </ScrollView>
                  {item.description.length > MAX_LENGTH && (
                    <TouchableOpacity onPress={toggleExpand}>
                      <Text style={styles.showMoreText}>
                        {isExpanded ? "Mostrar Menos" : "Mostrar Mais"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  onPress={() => {
                    if (!isUserLoggedIn) {
                      router.push("/login");
                      return;
                    }

                    if (item?.user_id === user?._id) {
                      router.push("/userProfile");
                    } else {
                      router.push({
                        pathname: `/user/[userId]`,
                        params: { userId: item?.user_id },
                      });
                    }
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
                    if (liked) {
                      sendVideoInteractionData("like", item._id);
                    }
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
                  <Text style={{ color: "white" }}>Comentários</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    shareVideo(item._id);
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
                  <Text style={{ color: "white" }}>Compartilhar</Text>
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
        onEndReached={() => fetchVideos(page)}
        onEndReachedThreshold={0.5}
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
  text: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
    color: "white",
  },
  title: {
    marginBottom: 10,
    fontWeight: "bold",
    fontSize: 20,
  },
  description: {
    marginBottom: 10,
    flexWrap: "wrap",
  },
  descriptionContainer: {
    marginBottom: 10,
  },
  showMoreText: {
    color: Colors.red.brand,
    marginTop: 5,
    fontWeight: "bold",
  },
  videoInfoContainer: {
    position: "absolute",
    bottom: 40,
    zIndex: 1000,
    width: "78%",
    padding: 10,
  },
  scrollContainer: {
    maxHeight: 100,
  },
  scrollContainerExpanded: {
    maxHeight: 200,
  },
  scrollContent: {
    paddingBottom: 16,
  },
});

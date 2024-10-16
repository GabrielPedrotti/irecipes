import React, { useRef, useState, useContext, useEffect } from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { IVideo } from "@/types/Video";
import VideoScreen from "@/components/VideoPlayer";
import { useRouter } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "@/context/AuthContext";
import { getVideos } from "@/service/video";
import { sendInteractionData } from "@/service/videoInteraction";
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
  const { user } = useContext(AuthContext);
  const isUserLoggedIn = !!user;

  useEffect(() => {
    if (user?._id) {
      resetVideos();
    }
  }, [user?._id]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      console.log("Focused", user?._id);
      if (user?._id) {
        resetVideos();
      }
    });

    return unsubscribe;
  }, [navigation, user?._id]);

  // useEffect(() => {
  //   if (user?._id) {
  //     console.log("User:", user);
  //     fetchVideos();
  //   }
  // }, [user?._id]);

  const resetVideos = async () => {
    setPage(1); // Reinicia a página
    setVideos([]); // Limpa a lista de vídeos
    setHasMoreVideos(true); // Habilita a busca novamente
    fetchVideos(1); // Busca os vídeos a partir da página 1
  };

  const fetchVideos = async (pageNumber = page) => {
    if (isLoading || !hasMoreVideos) return;
    setIsLoading(true);

    try {
      const response = await getVideos(pageNumber, user?._id || "");
      const newVideos = response;

      if (newVideos.length === 0) {
        setHasMoreVideos(false); // Se não há mais vídeos, desabilita a busca
        return;
      }

      // Remove duplicatas com base no _id
      const uniqueVideos = newVideos.filter(
        (newVideo) =>
          !videos.some((existingVideo) => existingVideo._id === newVideo._id),
      );

      setVideos((prevVideos) => [...prevVideos, ...uniqueVideos]);
      setPage(pageNumber + 1); // Incrementa a página
    } catch (error) {
      console.error("Erro ao carregar vídeos", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewableItemsChanged = useRef(({ viewableItems }) => {
    console.log("Viewable items:", viewableItems);
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

  return (
    <>
      <FlatList
        data={videos || null}
        renderItem={({ item, index }: any) => (
          <View style={{ height: height - tabBarHeight }}>
            <VideoScreen
              source={item.url}
              isPlaying={currentIndex === index}
              videoId={item.id}
              userId={item?.user_id || null}
            />
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                onPress={() => {
                  console.log("like");
                  sendVideoInteractionData("like", item._id);
                }}
                style={styles.buttons}
              >
                <Ionicons
                  name={"heart-outline"}
                  size={38}
                  color="white"
                  style={styles.icon}
                />
                <Text style={{ color: "white" }}>Likes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  console.log("comments");
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
        )}
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
    top: "70%",
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

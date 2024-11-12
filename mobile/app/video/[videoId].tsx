/* eslint-disable import/no-unresolved */
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Share,
} from "react-native";
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import VideoScreen from "@/components/VideoPlayer";
import { getVideoById } from "@/service/video";
import { IVideo } from "@/types/Video";
import { sendInteractionData } from "@/service/videoInteraction";
import { postLike, deleteLike, getLikes } from "@/service/video";
import CommentsModal from "@/components/VideoComponents/CommentsModal";
import { Colors } from "@/constants/Colors";

export default function VideoPage() {
  const { user } = useContext(AuthContext);
  const { videoId } = useLocalSearchParams();
  const { height } = Dimensions.get("window");
  const [video, setVideo] = useState<IVideo | null>(null);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const router = useRouter();
  const MAX_LENGTH = 100;

  useEffect(() => {
    const fetchVideo = async () => {
      const videoData = await getVideoById(videoId as string);
      setVideo(videoData);
      setLiked(videoData.likes?.some((like: string) => like === user?._id));
    };

    fetchVideo();
  }, [videoId]);

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
      const updatedLikes = Array.isArray(likes.likes) ? likes.likes : likes;

      const updatedVideos = { ...video, likes: updatedLikes } as IVideo;

      setVideo(updatedVideos);
    } catch (error) {
      console.log("error", error);
    }
  };

  const sendVideoInteractionData = async (
    interactionType: string,
    videoId: string,
  ) => {
    try {
      if (!user?._id) return;
      await sendInteractionData(interactionType, user?._id, videoId);
    } catch (error) {
      console.error("Erro ao registrar a interação", error);
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
      <View style={{ height: height }}>
        {!video ? (
          <ActivityIndicator size="large" color="white" style={styles.icon} />
        ) : (
          <View style={{ height: height }}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setIsExpanded(false);
                router.back();
              }}
            >
              <Ionicons
                name="arrow-back"
                size={36}
                color="white"
                style={styles.icon}
              />
            </TouchableOpacity>
            <VideoScreen
              source={video.url}
              isPlaying={true}
              videoId={video._id}
              videoData={video}
              userId={video.user_id}
            />
            <View style={styles.videoInfoContainer}>
              <Text style={[styles.text, styles.title]}>{video.title}</Text>
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
                      ? video.description
                      : video.description.slice(0, MAX_LENGTH)}
                    {video.description.length > MAX_LENGTH && !isExpanded
                      ? "..."
                      : ""}
                  </Text>
                </ScrollView>
                {video.description.length > MAX_LENGTH && (
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
                  setLiked(!liked);
                  likeVideo(video);
                  if (liked) {
                    sendVideoInteractionData("like", video._id);
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
                <Text style={{ color: "white" }}>{video.likes.length}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowCommentsModal(!showCommentsModal);
                  sendVideoInteractionData("comment", video._id);
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
                  shareVideo(video._id);
                  sendVideoInteractionData("share", video._id);
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
        )}
      </View>
      {video && user?._id && showCommentsModal && (
        <CommentsModal
          isVisible={showCommentsModal}
          onClose={() => setShowCommentsModal(!showCommentsModal)}
          userId={user?._id}
          video={video}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    top: 80,
    left: 20,
    zIndex: 1000,
  },
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

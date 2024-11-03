/* eslint-disable import/no-unresolved */
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
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

export default function VideoPage() {
  const { user } = useContext(AuthContext);
  const { videoId } = useLocalSearchParams();
  const { height } = Dimensions.get("window");
  const [video, setVideo] = useState<IVideo | null>(null);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [liked, setLiked] = useState(false);
  const router = useRouter();

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
      if (user?._id) {
        await sendInteractionData(
          interactionType,
          user?._id,
          videoId,
          0,
          false,
        );
      }
    } catch (error) {
      console.error("Erro ao registrar a interação", error);
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
              onPress={() => router.back()}
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
              userId={video.user_id}
            />
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                onPress={() => {
                  setLiked(!liked);
                  likeVideo(video);
                  sendVideoInteractionData("like", video._id);
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
                <Text style={{ color: "white" }}>Comments</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  console.log("Shares");
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
                <Text style={{ color: "white" }}>Share</Text>
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
});

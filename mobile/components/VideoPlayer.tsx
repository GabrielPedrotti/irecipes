import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { sendInteractionData } from "@/service/videoInteraction";

interface VideoProps {
  source: string;
  isPlaying: boolean;
  videoId: string; // ID do vídeo
  userId: string | null; // ID do usuário
}

export default function VideoScreen({
  source,
  isPlaying,
  videoId,
  userId,
}: VideoProps) {
  const ref = useRef(null);
  const [showControls, setShowControls] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const navigation = useNavigation();

  const player = useVideoPlayer(source, (player) => {
    player.loop = true;
  });

  useEffect(() => {
    if (isPlaying) {
      player.play();
    } else {
      player.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    console.log("navigation:", navigation);
    const unsubscribe = navigation.addListener("blur", () => {
      player.pause();
    });

    return unsubscribe;
  }, [navigation]);

  player.addListener("blur", () => {
    console.log("here");
  });

  useEffect(() => {
    console.log("player:", player);
    const subscription = player.addListener("playingChange", (isPlaying) => {
      setIsVideoPlaying(isPlaying);
    });

    const statusSubscription = player.addListener(
      "statusChange",
      (newStatus) => {
        setIsLoading(newStatus === "loading");
      },
    );

    setVideoDuration(player.duration);
    setCurrentTime(player.currentTime);

    return () => {
      subscription.remove();
      statusSubscription.remove();
    };
  }, [player]);

  useEffect(() => {
    if (showControls && isPlaying) {
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 5000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [isPlaying, showControls]);

  // Função para registrar a interação com o vídeo (curtir, comentar, compartilhar)
  // const sendInteractionData = async (interactionType: string) => {
  //   // if (!userId) {
  //   //   navigation.navigate("/login");
  //   //   return;
  //   // }

  //   try {
  //     await axios.post("/api/videoInteraction", {
  //       userId: userId,
  //       videoId: videoId,
  //       watchedTime: currentTime, // O tempo atual de reprodução do vídeo
  //       liked: interactionType === "like",
  //       commented: interactionType === "comment",
  //       shared: interactionType === "share",
  //       watchedComplete: currentTime >= videoDuration, // Se o vídeo foi assistido até o final
  //     });
  //   } catch (error) {
  //     console.error("Erro ao registrar a interação", error);
  //   }
  // };

  const sendVideoInteractionData = async (
    interactionType: string,
    videoId: string,
  ) => {
    // if (!userId) {
    //   router.push("/login");
    //   return;
    // }

    try {
      await sendInteractionData(interactionType, userId, videoId, 0, false);
    } catch (error) {
      console.error("Erro ao registrar a interação", error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => setShowControls(!showControls)}>
      <View style={styles.contentContainer}>
        <VideoView
          ref={ref}
          style={styles.video}
          player={player}
          allowsFullscreen={false}
          allowsPictureInPicture
          contentFit="fill"
          nativeControls={false}
        />
        {isLoading && (
          <View style={styles.contentContainer}>
            <ActivityIndicator color="#f5f5f5" />
          </View>
        )}
        {!isLoading && showControls && (
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              onPress={() => {
                if (isVideoPlaying) {
                  player.pause();
                } else {
                  player.play();
                }
              }}
            >
              <Ionicons
                name={isVideoPlaying ? "pause" : "play"}
                size={54}
                color="white"
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  video: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  controlsContainer: {
    zIndex: 1001,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  icon: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
});

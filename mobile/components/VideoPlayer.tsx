import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef, useState, useContext } from "react";
import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Slider } from "react-native-elements";
import { sendInteractionData } from "@/service/videoInteraction";
import { IVideo } from "@/types/Video";
import { Colors } from "@/constants/Colors";
import { AuthContext } from "@/context/AuthContext";

interface VideoProps {
  source: string;
  isPlaying: boolean;
  videoId: string;
  videoData: IVideo;
  userId: string | null;
}

export default function VideoScreen({
  source,
  isPlaying,
  videoId,
  userId,
  videoData,
}: VideoProps) {
  const { user } = useContext(AuthContext);
  const ref = useRef(null);
  const [showControls, setShowControls] = useState(true);
  const [videoDuration] = useState(videoData?.duration);
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
    const unsubscribe = navigation.addListener("blur", () => {
      player.pause();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (player) {
        const time = player.currentTime;
        setCurrentTime(time);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [player]);

  useEffect(() => {
    const subscription = player.addListener("playingChange", (isPlaying) => {
      setIsVideoPlaying(isPlaying.isPlaying);
    });

    const statusSubscription = player.addListener(
      "statusChange",
      (newStatus) => {
        setIsLoading(newStatus.status === "loading");
        // if (newStatus.status === "readyToPlay") {
        //   setVideoDuration(player.duration);
        // }
      },
    );

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

  const sendVideoInteractionData = async (
    interactionType: string,
    videoId: string,
    watchedComplete?: boolean,
  ) => {
    try {
      if (user) {
        await sendInteractionData(
          "",
          user._id,
          videoId,
          currentTime,
          watchedComplete,
        );
      }
    } catch (error) {
      console.error("Erro ao registrar a interação", error);
    }
  };

  useEffect(() => {
    if (currentTime > 0 && currentTime === videoDuration / 1000) {
      console.log("video watched");
      sendVideoInteractionData("watched", videoId, true);
    }
  }, [currentTime, videoDuration]);

  useEffect(() => {
    if (!isVideoPlaying && currentTime > 0) {
      sendVideoInteractionData("watched", videoId, false);
    }
  }, [isVideoPlaying]);

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        setShowControls(!showControls);
      }}
    >
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
        {!isLoading && showControls && (
          <View style={styles.sliderContainer}>
            <View style={[styles.timeContainer, styles.icon]}>
              <Text style={styles.timeText}>
                {formatTime(currentTime)} /{" "}
                {formatTime(Math.round(videoDuration / 1000))}
              </Text>
            </View>
            <Slider
              value={Math.round(currentTime * 1000)}
              onValueChange={(value) => {
                const timeInSeconds = Math.round(value / 1000);
                setCurrentTime(timeInSeconds);
                player.currentTime = timeInSeconds;
              }}
              maximumValue={Math.round(videoDuration)}
              minimumValue={0}
              step={100}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#000000"
              thumbTintColor={Colors.red.brand}
              thumbStyle={{ height: 10, width: 10 }}
              trackStyle={{ height: 5 }}
            />
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
};

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
  sliderContainer: {
    position: "absolute",
    bottom: 2,
    left: 0,
    right: 0,
    width: "100%",
    paddingHorizontal: 20,
  },
  timeContainer: {
    alignItems: "flex-end",
    marginTop: 5,
  },
  timeText: {
    color: "#FFFFFF",
  },
});

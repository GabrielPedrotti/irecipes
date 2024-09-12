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

interface VideoProps {
  source: string;
  isPlaying: boolean;
}

export default function VideoScreen({ source, isPlaying }: VideoProps) {
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

  // create useEffect to when not focused pause the video
  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      player.pause();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
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
            {/* <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={videoDuration}
              value={currentTime}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#000000"
            /> */}
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
  slider: {
    width: "90%",
    height: 40,
    marginTop: 10,
  },
  icon: {
    shadowColor: "#000", // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow offset
    shadowOpacity: 0.8, // Shadow opacity
    shadowRadius: 4, // Shadow radius
    elevation: 5, // Android shadow
  },
});

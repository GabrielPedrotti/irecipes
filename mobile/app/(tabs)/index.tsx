import React, { useRef, useState } from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import VideoScreen from "@/components/VideoPlayer";
import { useRouter } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

const videos = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
];

export default function Index() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 });
  const { height } = Dimensions.get("window");
  const tabBarHeight = useBottomTabBarHeight();
  const router = useRouter();
  const user = null;
  const isUserLoggedIn = !!user;

  const handleViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      if (index !== null && index !== undefined) {
        setCurrentIndex(index);
      }
    }
  }).current;

  return (
    <FlatList
      data={videos}
      renderItem={({ item, index }) => (
        <View style={{ height: height - tabBarHeight }}>
          <VideoScreen source={item} isPlaying={currentIndex === index} />
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              onPress={() => {
                console.log("like");
                if (!isUserLoggedIn) {
                  router.push("/login");
                }
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
                if (!isUserLoggedIn) {
                  router.push("/login");
                }
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
                if (!isUserLoggedIn) {
                  router.push("/login");
                }
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
      keyExtractor={(item, index) => index.toString()}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={handleViewableItemsChanged}
      viewabilityConfig={viewabilityConfig.current}
    />
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

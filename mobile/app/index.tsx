import React, { useRef } from "react";
import { Text, View } from "react-native";
import VideoPlayer from "@/components/VideoPlayer";

export default function Index() {
  return (
    <View
      style={{
        backgroundColor: "#f5f5f5",
      }}
    >
      <Text>Index</Text>
      {/* create a video background */}
      <VideoPlayer source="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" />
    </View>
  );
}

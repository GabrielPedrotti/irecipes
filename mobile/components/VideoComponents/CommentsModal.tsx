import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Modal,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  PanResponder,
  Animated,
  Keyboard,
} from "react-native";
import { IVideo } from "@/types/Video";
import { postComment, getVideoComments } from "@/service/video";
import ErrorModal from "../ErrorModal";
import { Colors } from "@/constants/Colors";

interface CommentsModalProps {
  isVisible: boolean;
  onClose: () => void;
  userId: string;
  video: IVideo;
}

export default function CommentsModal({
  isVisible,
  onClose,
  userId,
  video,
}: CommentsModalProps) {
  const [videoComments, setVideoComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [comment, setComment] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const panY = useRef(new Animated.Value(0)).current;
  const translateY = useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current;

  const screenHeight = Dimensions.get("window").height;
  const modalHeight = screenHeight * 0.65;

  const resetPositionAnim = Animated.timing(translateY, {
    toValue: 0,
    duration: 300,
    useNativeDriver: true,
  });

  useEffect(() => {
    if (isVisible) {
      resetPositionAnim.start();
    } else {
      translateY.setValue(modalHeight);
    }
  }, [isVisible]);

  useEffect(() => {
    translateY.addListener(({ value }) => {
      if (value < 0) {
        translateY.setValue(0);
      }
    });
    return () => {
      translateY.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    setVideoComments([]);
    setComment("");
    fetchComments();
  }, [video._id]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const commentsData = await getVideoComments(video._id);
      setVideoComments(commentsData.comments);
    } catch (error) {
      console.log("Erro ao buscar comentários", error);
      setError("Erro ao buscar comentários");
      setShowErrorModal(true);
      setVideoComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const postCommentHandler = async () => {
    Keyboard.dismiss();
    if (comment.trim() === "") return;
    setIsPosting(true);
    try {
      await postComment(video._id, userId, comment);
      setComment("");
      fetchComments();
    } catch (error) {
      console.error("Erro ao postar o comentário", error);
      setError("Erro ao postar o comentário");
      setShowErrorModal(true);
    } finally {
      setIsPosting(false);
    }
  };

  const renderCommentItem = ({
    item,
  }: {
    item: { _id: string; userName: string; comment: string };
  }) => (
    <View style={styles.commentItem} key={item._id}>
      <Text style={styles.commentUser}>{item.userName}</Text>
      <Text style={styles.commentText}>{item.comment}</Text>
    </View>
  );

  const animatedTranslateY = Animated.add(translateY, panY).interpolate({
    inputRange: [0, modalHeight],
    outputRange: [0, modalHeight],
    extrapolate: "clamp",
  });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return (
        gestureState.dy > 5 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy)
      );
    },
    onPanResponderMove: Animated.event([null, { dy: panY }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 100) {

        translateY.setValue(translateY._value + gestureState.dy);
        panY.setValue(0);

        Animated.timing(translateY, {
          toValue: modalHeight,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onClose();
          translateY.setValue(modalHeight);
        });
      } else {
        Animated.timing(panY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  return (
    <Modal visible={isVisible} animationType="fade" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <Animated.View
          style={[
            styles.container,
            {
              maxHeight: modalHeight,
              transform: [{ translateY: animatedTranslateY }],
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            <View
              style={styles.header}
              onStartShouldSetResponder={() => true}
              {...panResponder.panHandlers}
            >
              <View style={styles.indicator} />
            </View>

            {isLoading ? (
              <ActivityIndicator size="large" color="#999" />
            ) : videoComments.length === 0 ? (
              <View style={styles.noCommentsContainer}>
                <Text style={styles.noCommentsText}>
                  Ainda não há comentários
                </Text>
              </View>
            ) : (
              <FlatList
                data={videoComments}
                renderItem={renderCommentItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.commentsContainer}
                style={{ flex: 1 }}
              />
            )}

            <View style={styles.inputContainer}>
              <TextInput
                value={comment}
                onChangeText={(text) => setComment(text)}
                placeholder="Escreva seu comentário"
                placeholderTextColor={"#aaa"}
                style={styles.input}
              />
              <TouchableOpacity
                onPress={postCommentHandler}
                disabled={isPosting || comment.trim() === ""}
                style={styles.postButton}
              >
                {isPosting ? (
                  <ActivityIndicator size="small" color={Colors.red.brand} />
                ) : (
                  <Text style={styles.postButtonText}>Postar</Text>
                )}
              </TouchableOpacity>
            </View>

            {showErrorModal && (
              <ErrorModal
                isVisible={showErrorModal}
                onClose={() => setShowErrorModal(!showErrorModal)}
                message={error}
              />
            )}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  container: {
    flex: 1,
    maxHeight: Dimensions.get("window").height * 0.65,
    backgroundColor: "#fff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    paddingVertical: 16,
  },
  indicator: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#ccc",
  },
  commentsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  commentItem: {
    marginBottom: 16,
  },
  commentUser: {
    fontWeight: "bold",
    color: "#000",
  },
  commentText: {
    marginTop: 4,
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: "#eee",
    marginBottom: Platform.OS === "ios" ? 18 : 0,
  },
  input: {
    color: "#000",
    flex: 1,
    height: 40,
  },
  postButton: {
    marginLeft: 8,
    borderColor: Colors.red.brand,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  postButtonText: {
    color: Colors.red.brand,
    fontWeight: "bold",
  },
  noCommentsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noCommentsText: {
    color: "#aaa",
    fontSize: 16,
  },
});

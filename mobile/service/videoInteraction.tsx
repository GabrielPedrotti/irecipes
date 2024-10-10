import { api } from "./api";

export const sendInteractionData = async (
  interactionType: string,
  userId: string,
  videoId: string,
  watchedTime: number,
  watchedComplete: boolean,
) => {
  try {
    await api({
      method: "POST",
      url: "interactions/videoInteraction",
      data: {
        userId: userId,
        videoId: videoId,
        watchedTime: 0,
        liked: interactionType === "like",
        commented: interactionType === "comment",
        shared: interactionType === "share",
        watchedComplete: false,
      },
    });
  } catch (error) {
    console.error("Erro ao registrar a interação", error);
  }
};

// export const updateVideo = async (
//   videoId: string,
//   like?: boolean,
//   comment?: string,
//   share?: boolean,
// ) => {
//   try {
//     await api({
//       method: "PUT",
//       url: `/api/videos/${videoId}`,
//       data,
//     });
//     // await api.put(`/api/videos/${videoId}`, data);
//   } catch (error) {
//     console.error("Erro ao atualizar o vídeo", error);
//   }
// };

export const updateVideoLike = async (videoId: string, like: boolean) => {
  try {
    if (like) {
      await api({
        method: "POST",
        url: "/api/postLike",
        data: {
          videoId: videoId,
        },
      });
    } else {
      await api({
        method: "DELETE",
        url: "/api/deleteLike",
        data: {
          videoId: videoId,
        },
      });
    }
    // await api.put(`/api/videos/${videoId}`, { liked: like });
  } catch (error) {
    console.error("Erro ao atualizar o vídeo", error);
  }
};

// @videos.route('/postLike', methods=['POST'])
// def postLike():
//     try:
//         data = request.get_json()
//         video_id = data.get('videoId')
//         user_id = data.get('userId')

//         # needs to sum 1 to the likes field

//         db.videos.find_one_and_update(
//             {"_id": video_id},
//             {"$inc": {"likes": 1}}
//         )

//         return jsonify({"message": "Like posted successfully"}), 200
//     except Exception as e:
//         return jsonify({"error": str(e)}), 500

// @videos.route('/deleteLike', methods=['DELETE'])
// def deleteLike():
//     try:
//         data = request.get_json()
//         video_id = data.get('videoId')
//         user_id = data.get('userId')

import { api } from "./api";

import { IVideo, ListVideoResponse } from "@/types/Video";

interface IVideoData {
  videoUri: string;
  title: string;
  description: string;
  tags: string[];
  duration: number;
  userId: string;
}

interface IUploadResponse {
  uploadUrl: string;
  title: string;
  description: string;
  tags: string[];
  duration: number;
  userId: string;
}

export const getVideos = async (page: number, userId: string) => {
  try {
    const response = await api({
      method: "GET",
      url: `interactions/recommended?userId=${userId}&page=${page}`,
    });

    if (!response.data) {
      throw new Error("Erro ao buscar vídeos");
    }

    console.log("Response videos:", response.data);

    return response.data as ListVideoResponse;
  } catch (error) {
    console.log("Erro ao buscar vídeos:", JSON.stringify(error));
    console.error("Erro ao buscar vídeos:", error);
    throw error;
  }
};

export const getVideoById = async (videoId: string) => {
  try {
    const response = await api({
      method: "GET",
      url: `videos/getVideo?videoId=${videoId}`,
    });

    console.log("Response video:", response.data);

    return response.data as IVideo;
  } catch (error) {
    console.error("Erro ao buscar o vídeo", error);
    throw error;
  }
};

export const getVideoComments = async (videoId: string) => {
  try {
    const response = await api({
      method: "GET",
      url: `videos/getComments/${videoId}`,
    });

    return response.data;
  } catch (error) {
    console.log("Erro ao buscar os comentários", error);
    return [];
  }
};

export const postComment = async (
  videoId: string,
  userId: string,
  comment: string,
) => {
  try {
    console.log("Post comment:", videoId, userId, comment);
    const response = await api({
      method: "POST",
      url: "videos/postComment",
      data: {
        videoId,
        userId,
        comment,
      },
    });

    console.log("Response comment:", response.data);
    return response.data;
  } catch (error) {
    console.error("Erro ao postar o comentário", error);
    throw error;
  }
};

export const uploadVideoToBackend = async ({
  videoUri,
  title,
  description,
  tags,
  duration,
  userId,
}: IVideoData) => {
  try {
    const responseVideo = await fetch(videoUri);
    console.log("Response video:", responseVideo);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = (await responseVideo.blob()) as any;

    const name = blob._data.name;

    const response = await api({
      method: "POST",
      url: "videos/uploadVideo",
      data: {
        filename: name,
        contentType: blob.type,
      },
    });

    const uploadUrl = response.data.uploadUrl;
    const bucketName = "irecipes-videos";

    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": blob.type,
      },
      body: blob,
    });

    if (uploadResponse.ok) {
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${name}`;
      console.log("Public URL:", publicUrl);

      await postUserVideo({
        uploadUrl: publicUrl,
        title,
        description,
        tags,
        duration,
        userId,
      });

      console.log("Upload concluído!");
      return publicUrl;
    }
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    throw error;
  }
};

const postUserVideo = async ({
  uploadUrl,
  title,
  description,
  tags,
  duration,
  userId,
}: IUploadResponse) => {
  try {
    const response = await api({
      method: "POST",
      url: "videos/postVideo",
      data: {
        url: uploadUrl,
        title,
        description,
        tags,
        duration,
        userId,
      },
    });

    console.log("Response post video:", response.data);
    return response.data;
  } catch (error) {
    console.error("Erro ao postar video:", error);
    throw error;
  }
};

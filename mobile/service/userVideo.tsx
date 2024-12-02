import { api } from "./api";
import { IVideo } from "@/types/Video";

export const getUserVideos = async (
  userId: string,
): Promise<{ videos: IVideo[] }> => {
  try {
    const response = await api({
      method: "GET",
      url: `videos/getUserVideos?userId=${userId}`,
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar os vídeos do usuário", error);
    throw error;
  }
};

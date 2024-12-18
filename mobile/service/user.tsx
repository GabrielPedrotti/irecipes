import { api } from "./api";
import { User } from "../types/User";

export const updateProfile = async (userId: string, userData: User) => {
  try {
    const response = await api({
      method: "PUT",
      url: `users/${userId}`,
      data: userData,
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar o perfil", error);
    throw error;
  }
};

export const uploadProfileImage = async (userId: string, image: Blob) => {
  try {
    const formData = new FormData();

    const file = new File([image], "profileImage.jpg", { type: image.type });
    formData.append("file", file);

    const uploadUrl = `${process.env.EXPO_PUBLIC_API_URL}users/${userId}/uploadProfileImage`;

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": image.type || "application/octet-stream",
      },
      body: image,
    });

    return response;
  } catch (error) {
    console.error("Erro ao atualizar a imagem de perfil", error);
    throw error;
  }
};

export const followUser = async (userId: string, followId: string) => {
  try {
    const response = await api({
      method: "POST",
      url: `users/follow`,
      data: {
        userId,
        followId,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao seguir o usuário", error);
    throw error;
  }
};

export const unfollowUser = async (userId: string, followId: string) => {
  try {
    const response = await api({
      method: "POST",
      url: `users/unfollow`,
      data: {
        userId,
        followId,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao deixar de seguir o usuário", error);
    throw error;
  }
};

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

    const uploadUrl = `https://d505-45-163-75-116.ngrok-free.app/api/v1/users/${userId}/uploadProfileImage`;

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

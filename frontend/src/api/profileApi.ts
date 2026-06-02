import { API_BASE_URL } from "../config/api";

export const getProfileByUserId = async (userId: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/api/profile/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener el perfil");
  }

  return response.json();
};

type UpdateProfileRequest = {
  description: string;
  skills: string[];
  career: string;
  semester: number;
  companyName?: string;
  rfc?: string;
  imageFile?: File | null;
  verificationFile?: File | null;
};

export const updateProfile = async (
  userId: string,
  profile: UpdateProfileRequest,
  token: string
) => {
  const formData = new FormData();

  formData.append("description", profile.description);
  formData.append("skills", JSON.stringify(profile.skills));
  formData.append("career", profile.career);
  formData.append("semester", String(profile.semester));

  if (profile.companyName !== undefined) {
    formData.append("companyName", profile.companyName);
  }

  if (profile.rfc !== undefined) {
    formData.append("rfc", profile.rfc);
  }

  if (profile.imageFile) {
    formData.append("imageFile", profile.imageFile);
  }

  if (profile.verificationFile) {
    formData.append("verificationFile", profile.verificationFile);
  }

  const response = await fetch(`${API_BASE_URL}/api/profile/${userId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al actualizar el perfil");
  }

  return data;
};
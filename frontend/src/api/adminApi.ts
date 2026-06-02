import { API_BASE_URL } from "../config/api";

export const getUsers = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/api/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener usuarios");
  }

  return response.json();
};

export const updateUserStatus = async (
  userId: string,
  status: string,
  token: string
) => {
  const response = await fetch(`${API_BASE_URL}/api/user/${userId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al actualizar estado");
  }

  return data;
};

export const getAllJobs = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/api/job`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener trabajos");
  }

  return response.json();
};

export const deleteJob = async (jobId: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/api/job/${jobId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al eliminar trabajo");
  }

  return data;
};

export const getAllApplications = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/api/application`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener postulaciones");
  }

  return response.json();
};

export const getAllRatings = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/api/rating`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener calificaciones");
  }

  return response.json();
};

export const updateUserRole = async (
  userId: string,
  role: string,
  token: string
) => {
  const response = await fetch(`${API_BASE_URL}/api/user/${userId}/role`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al actualizar rol");
  }

  return data;
};
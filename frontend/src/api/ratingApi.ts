const API_BASE_URL = "http://localhost:3000";

export const getRatingsByUser = async (userId: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/api/rating/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener calificaciones");
  }

  return response.json();
};

export const getRatingsGivenByUser = async (userId: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/api/rating/given/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener calificaciones dadas");
  }

  return response.json();
};
const API_BASE_URL = "http://localhost:3000";

type CreateRatingRequest = {
  job: string;
  reviewer: string;
  reviewed: string;
  score: number;
  comment: string;
};

export const createRating = async (
  rating: CreateRatingRequest,
  token: string
) => {
  const response = await fetch(`${API_BASE_URL}/api/rating`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(rating),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al crear calificación");
  }

  return data;
};
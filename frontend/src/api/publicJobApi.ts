import { API_BASE_URL } from "../config/api";

type JobSearchParams = {
  q?: string;
  category?: string;
  modality?: string;
  location?: string;
};

export const getPublicJobs = async (params: JobSearchParams = {}) => {
  const searchParams = new URLSearchParams();
  searchParams.set("board", "true");

  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });

  const response = await fetch(
    `${API_BASE_URL}/api/public/jobs?${searchParams.toString()}`
  );

  if (!response.ok) {
    throw new Error("Error al obtener los empleos");
  }

  return response.json();
};

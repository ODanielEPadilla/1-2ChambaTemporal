import { API_BASE_URL } from "../config/api";

type JobSearchParams = {
  q?: string;
  category?: string;
  modality?: string;
  location?: string;
  board?: string;
};

export const getJobs = async (
  token: string,
  params: JobSearchParams = { board: "true" }
) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });

  const query = searchParams.toString();
  const url = `${API_BASE_URL}/api/job${query ? `?${query}` : ""}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener los trabajos");
  }

  return response.json();
};
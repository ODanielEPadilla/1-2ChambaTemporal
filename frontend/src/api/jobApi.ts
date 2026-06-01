const API_BASE_URL = "http://localhost:3000";

export const getJobs = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/api/job`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener los trabajos");
  }

  return response.json();
};
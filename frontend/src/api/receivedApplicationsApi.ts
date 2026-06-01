const API_BASE_URL = "http://localhost:3000";

export const getApplicationsByJob = async (jobId: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/api/application/job/${jobId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener postulaciones del trabajo");
  }

  return response.json();
};

export const updateApplicationStatus = async (
  applicationId: string,
  status: string,
  token: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/api/application/${applicationId}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al actualizar postulación");
  }

  return data;
};
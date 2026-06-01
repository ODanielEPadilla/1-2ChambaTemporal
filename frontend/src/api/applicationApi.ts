const API_BASE_URL = "http://localhost:3000";

type CreateApplicationRequest = {
  job: string;
  student: string;
  message: string;
};

export const createApplication = async (
  application: CreateApplicationRequest,
  token: string
) => {
  const response = await fetch(`${API_BASE_URL}/api/application`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(application),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al crear la postulación");
  }

  return data;
};

export const getApplicationsByStudent = async (
  studentId: string,
  token: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/api/application/student/${studentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Error al obtener las postulaciones");
  }

  return response.json();
};
const API_BASE_URL = "http://localhost:3000";

type CreateJobRequest = {
  client: string;
  title: string;
  description: string;
  category: string;
  modality: string;
  estimatedDuration: string;
};

export const createJob = async (job: CreateJobRequest, token: string) => {
  const response = await fetch(`${API_BASE_URL}/api/job`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(job),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al crear el trabajo");
  }

  return data;
};

type UpdateJobRequest = {
  title: string;
  description: string;
  category: string;
  modality: string;
  estimatedDuration: string;
  status: string;
};

export const updateJob = async (
  jobId: string,
  job: UpdateJobRequest,
  token: string
) => {
  const response = await fetch(`${API_BASE_URL}/api/job/${jobId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(job),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al actualizar trabajo");
  }

  return data;
};

export const getJobsByClient = async (clientId: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/api/job/client/${clientId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener los trabajos del cliente");
  }

  return response.json();
};

export const finishJob = async (jobId: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/api/job/${jobId}/finalize`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al finalizar trabajo");
  }

  return data;
};
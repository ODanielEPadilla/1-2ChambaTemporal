const API_BASE_URL = "http://localhost:3000";

type CreateUserRequest = {
  auth0Id: string;
  email: string;
  name: string;
  role: string;
};

export const createCurrentUser = async (user: CreateUserRequest) => {
  const response = await fetch(`${API_BASE_URL}/api/user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al crear usuario");
  }

  return data;
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
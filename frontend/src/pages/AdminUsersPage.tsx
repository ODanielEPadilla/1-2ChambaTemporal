import { useEffect, useState } from "react";
import { getUsers, updateUserStatus, updateUserRole } from "../api/adminApi";
import { getProfileByUserId } from "../api/profileApi";
import { useAuth0 } from "@auth0/auth0-react";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  onboardingCompleted: boolean;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const token = await getAccessTokenSilently();
        const data = await getUsers(token);

        setUsers(data);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [getAccessTokenSilently]);


  const handleViewProfile = async (userId: string) => {
    try {
      setIsProfileLoading(true);

      const token = await getAccessTokenSilently();
      const profile = await getProfileByUserId(userId, token);

      setSelectedProfile(profile);
      setIsProfileLoading(false);
    } catch (error) {
      setIsProfileLoading(false);
      alert(
        error instanceof Error ? error.message : "Error al obtener perfil"
      );
    }
  };

  const handleUpdateStatus = async (userId: string, status: string) => {
    try {
      const token = await getAccessTokenSilently();

      const updatedUser = await updateUserStatus(userId, status, token);

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === userId ? updatedUser : user
        )
      );
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Error al actualizar usuario"
      );
    }
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      const token = await getAccessTokenSilently();

      const updatedUser = await updateUserRole(userId, role, token);

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === userId ? updatedUser : user
        )
      );
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Error al actualizar rol"
      );
    }
  };

  if (isLoading) {
    return <p>Cargando usuarios...</p>;
  }

  if (selectedProfile) {
    return (
      <div>
        <button
          className="back-button"
          onClick={() => setSelectedProfile(null)}
        >
          ← Volver a usuarios
        </button>

        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">👤</div>

            <div>
              <h3>{selectedProfile.user?.name}</h3>
              <p>{selectedProfile.user?.email}</p>
              <span className={`status-badge ${selectedProfile.user?.status}`}>
                {selectedProfile.user?.status}
              </span>
            </div>
          </div>

          <div className="profile-grid">
            <div>
              <strong>Rol</strong>
              <p>{selectedProfile.user?.role}</p>
            </div>

            <div>
              <strong>Carrera</strong>
              <p>{selectedProfile.career || "No aplica"}</p>
            </div>

            <div>
              <strong>Semestre</strong>
              <p>{selectedProfile.semester || "No aplica"}</p>
            </div>

            <div>
              <strong>Calificación</strong>
              <p>{selectedProfile.averageRating || 0} / 5</p>
            </div>
          </div>

          <div className="profile-section">
            <strong>Descripción</strong>
            <p>{selectedProfile.description || "Sin descripción"}</p>
          </div>

          <div className="profile-section">
            <strong>Habilidades</strong>

            <div className="skills-list">
              {selectedProfile.skills?.length > 0 ? (
                selectedProfile.skills.map((skill: string) => (
                  <span key={skill}>{skill}</span>
                ))
              ) : (
                <p>No aplica</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Usuarios</h2>

      {isProfileLoading && <p>Cargando perfil...</p>}

      <div className="cards-grid">
        {users.map((user) => (
          <article className="job-card" key={user._id}>
            <h3>{user.name}</h3>

            <p>
              <strong>Correo:</strong> {user.email}
            </p>

            <p>
              <strong>Rol:</strong> {user.role}
            </p>

            <select
              className="form-input"
              value={user.role}
              onChange={(e) => handleUpdateRole(user._id, e.target.value)}
            >
              <option value="estudiante">Estudiante</option>
              <option value="cliente">Cliente</option>
              <option value="administrador">Administrador</option>
            </select>

            <p>
              <strong>Configuración:</strong>{" "}
              {user.onboardingCompleted ? "Completa" : "Pendiente"}
            </p>

            <span className={`status-badge ${user.status}`}>
              {user.status}
            </span>

            <div className="card-actions">
              <button onClick={() => handleViewProfile(user._id)}>
                Ver perfil
              </button>

              {user.status !== "activo" && (
                <button
                  onClick={() => handleUpdateStatus(user._id, "activo")}
                >
                  Activar
                </button>
              )}

              {user.status !== "suspendido" && (
                <button
                  onClick={() =>
                    handleUpdateStatus(user._id, "suspendido")
                  }
                >
                  Suspender
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
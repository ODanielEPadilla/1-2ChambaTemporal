import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { getUsers, updateUserStatus } from "../api/adminApi";
import { getProfileByUserId } from "../api/profileApi";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  onboardingCompleted: boolean;
};

type PendingProfile = {
  companyName?: string;
  verificationDocumentUrl?: string;
};

export default function PendingAccountsPage() {
  const [accounts, setAccounts] = useState<User[]>([]);
  const [profiles, setProfiles] = useState<Record<string, PendingProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const loadPendingAccounts = async () => {
      try {
        const token = await getAccessTokenSilently();
        const data = await getUsers(token);
        const pendingUsers = data.filter(
          (user: User) => user.status === "pendiente"
        );

        const profileEntries = await Promise.all(
          pendingUsers.map(async (user: User) => {
            try {
              const profile = await getProfileByUserId(user._id, token);
              return [user._id, profile] as const;
            } catch {
              return [user._id, {}] as const;
            }
          })
        );

        setProfiles(Object.fromEntries(profileEntries));
        setAccounts(pendingUsers);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    };

    loadPendingAccounts();
  }, [getAccessTokenSilently]);

  const handleUpdateStatus = async (userId: string, status: string) => {
    try {
      const token = await getAccessTokenSilently();
      await updateUserStatus(userId, status, token);

      setAccounts((currentAccounts) =>
        currentAccounts.filter((account) => account._id !== userId)
      );

      alert(
        status === "activo"
          ? "Cuenta aprobada correctamente"
          : "Cuenta rechazada correctamente"
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Error al actualizar cuenta"
      );
    }
  };

  if (isLoading) {
    return <p>Cargando cuentas pendientes...</p>;
  }

  return (
    <div>
      <h2>Cuentas pendientes</h2>

      {accounts.length === 0 && (
        <p>No hay cuentas pendientes por revisar.</p>
      )}

      <div className="cards-grid">
        {accounts.map((account) => {
          const profile = profiles[account._id];

          return (
            <article className="job-card" key={account._id}>
              <h3>{account.name}</h3>

              <p>
                <strong>Correo:</strong> {account.email}
              </p>

              <p>
                <strong>Rol:</strong> {account.role}
              </p>

              {profile?.companyName && (
                <p>
                  <strong>Empresa:</strong> {profile.companyName}
                </p>
              )}

              <p>
                <strong>Configuración:</strong>{" "}
                {account.onboardingCompleted ? "Completa" : "Pendiente"}
              </p>

              <span className={`status-badge ${account.status}`}>
                {account.status}
              </span>

              <div className="card-actions">
                {profile?.verificationDocumentUrl ? (
                  <a
                    href={profile.verificationDocumentUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <button type="button">Ver documento</button>
                  </a>
                ) : (
                  <button type="button" disabled>
                    Sin documento
                  </button>
                )}

                <button
                  onClick={() => handleUpdateStatus(account._id, "activo")}
                >
                  Aprobar
                </button>

                <button
                  onClick={() =>
                    handleUpdateStatus(account._id, "rechazado")
                  }
                >
                  Rechazar
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

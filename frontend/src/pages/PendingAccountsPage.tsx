import { useEffect, useState } from "react";
import { getUsers, updateUserStatus } from "../api/adminApi";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  onboardingCompleted: boolean;
};

export default function PendingAccountsPage() {
  const [accounts, setAccounts] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getUsers()
      .then((data) => {
        const pendingUsers = data.filter(
          (user: User) => user.status === "pendiente"
        );

        setAccounts(pendingUsers);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  }, []);

  const handleUpdateStatus = async (userId: string, status: string) => {
    try {
      await updateUserStatus(userId, status);

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
        {accounts.map((account) => (
          <article className="job-card" key={account._id}>
            <h3>{account.name}</h3>

            <p>
              <strong>Correo:</strong> {account.email}
            </p>

            <p>
              <strong>Rol:</strong> {account.role}
            </p>

            <p>
              <strong>Configuración:</strong>{" "}
              {account.onboardingCompleted ? "Completa" : "Pendiente"}
            </p>

            <span className={`status-badge ${account.status}`}>
              {account.status}
            </span>

            <div className="card-actions">
              <button onClick={() => alert("Documento no cargado todavía")}>
                Ver documento
              </button>

              <button
                onClick={() => handleUpdateStatus(account._id, "activo")}
              >
                Aprobar
              </button>

              <button
                onClick={() => handleUpdateStatus(account._id, "rechazado")}
              >
                Rechazar
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
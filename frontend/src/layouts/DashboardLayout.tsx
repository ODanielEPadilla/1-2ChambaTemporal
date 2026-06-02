import MyApplicationsPage from "../pages/MyApplicationsPage";
import RatingsPage from "../pages/RatingsPage";
import ProfilePage from "../pages/ProfilePage";
import MyJobsPage from "../pages/MyJobsPage";
import ReceivedApplicationsPage from "../pages/ReceivedApplicationsPage";
import AdminUsersPage from "../pages/AdminUsersPage";
import PendingAccountsPage from "../pages/PendingAccountsPage";
import AdminJobsPage from "../pages/AdminJobsPage";
import AdminApplicationsPage from "../pages/AdminApplicationsPage";
import AdminRatingsPage from "../pages/AdminRatingsPage";
import LogoutButton from "../components/LogoutButton";
import BrandLogo from "../components/BrandLogo";
import AvatarPlaceholder from "../components/AvatarPlaceholder";
import type { CurrentUser } from "../App";
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { getProfileByUserId } from "../api/profileApi";
import { formatRoleLabel } from "../utils/formatLabels";

type Props = {
  selectedView: string;
  setSelectedView: (view: string) => void;
  currentUser: CurrentUser | null;
  openPublishForm?: boolean;
  onPublishFormOpened?: () => void;
  onOpenJobBoard: () => void;
  onExitDashboard?: () => void;
};

export default function DashboardLayout({
  selectedView,
  setSelectedView,
  currentUser,
  openPublishForm = false,
  onPublishFormOpened,
  onOpenJobBoard,
  onExitDashboard,
}: Props) {
  const rol = currentUser?.role || "estudiante";
  const [averageRating, setAverageRating] = useState(0);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const { getAccessTokenSilently, user: auth0User } = useAuth0();

  useEffect(() => {
    if (!currentUser?._id) return;

    const loadProfileSummary = async () => {
      try {
        const token = await getAccessTokenSilently();
        const profile = await getProfileByUserId(currentUser._id, token);

        setAverageRating(profile.averageRating ?? 0);
        setProfileImageUrl(profile.imageUrl || auth0User?.picture || "");
        setCompanyName(profile.companyName || "");
      } catch (error) {
        console.log(error);
        setProfileImageUrl(auth0User?.picture || "");
      }
    };

    loadProfileSummary();
  }, [currentUser, getAccessTokenSilently, auth0User?.picture]);

  const avatarSrc = profileImageUrl || auth0User?.picture || "";

  return (
    <div className="app">
      <header className="topbar">
        <button
          type="button"
          className="brand brand-btn"
          onClick={() => onExitDashboard?.()}
        >
          <BrandLogo size="sm" />
        </button>

        <div className="topbar-user">
          <div className="topbar-avatar">
            <AvatarPlaceholder
              name={currentUser?.name}
              imageUrl={avatarSrc}
              alt="Foto de perfil"
            />
          </div>

          <div>
            <h1>
              {rol === "cliente" && companyName
                ? companyName
                : currentUser?.name || "Usuario"}
            </h1>
            <p>{formatRoleLabel(rol)}</p>
          </div>
        </div>

        {rol === "estudiante" && (
          <div className="rating">
            <span>Calificación promedio</span>
            {averageRating > 0
              ? `${averageRating} / 5`
              : "Sin calificaciones"}
          </div>
        )}
      </header>

      <main className="dashboard">
        <aside className="sidebar">
          <h2>Menú</h2>

          <button onClick={() => setSelectedView("perfil")}>
            Mi perfil
          </button>

          {rol === "estudiante" && (
            <>
              <button onClick={onOpenJobBoard}>Bolsa de empleo</button>

              <button onClick={() => setSelectedView("postulaciones")}>
                Mis postulaciones
              </button>

              <button onClick={() => setSelectedView("calificaciones")}>
                Calificaciones
              </button>
            </>
          )}

          {rol === "cliente" && (
            <>
              <button onClick={() => setSelectedView("misTrabajos")}>
                Mis trabajos
              </button>

              <button onClick={() => setSelectedView("postulacionesRecibidas")}>
                Postulaciones
              </button>

              <button onClick={() => setSelectedView("calificaciones")}>
                Calificaciones
              </button>
            </>
          )}

          {rol === "administrador" && (
            <>
              <button onClick={() => setSelectedView("usuarios")}>
                Usuarios
              </button>

              <button onClick={() => setSelectedView("trabajosAdmin")}>
                Trabajos publicados
              </button>

              <button onClick={() => setSelectedView("postulacionesAdmin")}>
                Postulaciones
              </button>

              <button onClick={() => setSelectedView("cuentasPendientes")}>
                Cuentas pendientes
              </button>

              <button onClick={() => setSelectedView("calificacionesAdmin")}>
                Calificaciones
              </button>
            </>
          )}

          <LogoutButton />
        </aside>

        <section className="content">
          {selectedView === "home" && (
            <>
              <h2>Bienvenida a 1/2Chamba</h2>
              <p>Selecciona una opción del menú para comenzar.</p>
            </>
          )}

          {selectedView === "perfil" && (
            <ProfilePage currentUser={currentUser} />
          )}

          {selectedView === "misTrabajos" && (
            <MyJobsPage
              currentUser={currentUser}
              initialShowForm={openPublishForm}
              onFormOpened={onPublishFormOpened}
            />
          )}

          {selectedView === "postulaciones" && (
            <MyApplicationsPage currentUser={currentUser} />
          )}

          {selectedView === "usuarios" && <AdminUsersPage />}

          {selectedView === "postulacionesRecibidas" && (
            <ReceivedApplicationsPage currentUser={currentUser} />
          )}

          {selectedView === "trabajosAdmin" && <AdminJobsPage />}

          {selectedView === "postulacionesAdmin" && (
            <AdminApplicationsPage />
          )}

          {selectedView === "calificacionesAdmin" && <AdminRatingsPage />}

          {selectedView === "cuentasPendientes" && <PendingAccountsPage />}

          {selectedView === "calificaciones" && (
            <RatingsPage currentUser={currentUser} />
          )}
        </section>
      </main>

      <footer className="footer">
        1/2Chamba © 2026 - Plataforma académica ITZ
      </footer>
    </div>
  );
}

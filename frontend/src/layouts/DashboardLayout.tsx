import JobsPage from "../pages/JobsPage";
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
import type { CurrentUser } from "../App";
import { useEffect, useState } from "react";
import { getProfileByUserId } from "../api/profileApi";

type Props = {
    selectedView: string;
    setSelectedView: (view: string) => void;
    currentUser: CurrentUser | null;
};

export default function DashboardLayout({
    selectedView,
    setSelectedView,
    currentUser,
}: Props) {

    //const rol = "estudiante";
    const rol = currentUser?.role || "estudiante";
    const [averageRating, setAverageRating] = useState(0);

    useEffect(() => {
        if (!currentUser?._id) return;

        getProfileByUserId(currentUser._id)
            .then((profile) => {
                setAverageRating(profile.averageRating || 0);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [currentUser]);

    return (
        <div className="app">
            <header className="topbar">
                <div className="brand">
                    <div className="logo">½</div>
                    <span>1/2Chamba</span>
                </div>

                <h1>{currentUser?.name || "Usuario"}</h1>

                <div className="rating">Calificación: {averageRating} / 5</div>
            </header>

            <main className="dashboard">
                <aside className="sidebar">
                    <h2>Menú</h2>

                    <button onClick={() => setSelectedView("perfil")}>
                        Mi perfil
                    </button>

                    {rol === "estudiante" && (
                        <>
                            <button onClick={() => setSelectedView("trabajos")}>
                                Ver trabajos
                            </button>

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
                                Postulaciones recibidas
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

                    {selectedView === "perfil" && <ProfilePage currentUser={currentUser} />}

                    {selectedView === "trabajos" && <JobsPage currentUser={currentUser} />}

                    {selectedView === "misTrabajos" && <MyJobsPage currentUser={currentUser} />}

                    {selectedView === "postulaciones" && <MyApplicationsPage currentUser={currentUser} />}

                    {selectedView === "usuarios" && <AdminUsersPage />}

                    {selectedView === "postulacionesRecibidas" && <ReceivedApplicationsPage currentUser={currentUser} />}

                    {selectedView === "trabajosAdmin" && <AdminJobsPage />}

                    {selectedView === "postulacionesAdmin" && <AdminApplicationsPage />}

                    {selectedView === "calificacionesAdmin" && <AdminRatingsPage />}

                    {selectedView === "cuentasPendientes" && <PendingAccountsPage />}

                    {selectedView === "calificaciones" && <RatingsPage currentUser={currentUser} />}
                </section>
            </main>

            <footer className="footer">
                1/2Chamba © 2026 - Plataforma académica ITZ
            </footer>
        </div>
    );
}
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import VisitorLayout from "./layouts/VisitorLayout";
import VisitorPortal from "./layouts/VisitorPortal";
import OnboardingPage from "./pages/OnboardingPage";
import AccountBlockedScreen from "./components/AccountBlockedScreen";
import { PENDING_APPLY_KEY } from "./components/JobBoard";
import { createCurrentUser } from "./api/userApi";
import { REGISTER_INTENT_KEY } from "./components/LoginButton";
import BrandLogo from "./components/BrandLogo";
import { bootstrapCompanyAccount } from "./utils/companyBootstrap";

export type CurrentUser = {
  _id: string;
  auth0Id: string;
  email: string;
  name: string;
  role: "estudiante" | "cliente" | "administrador";
  status: string;
  onboardingCompleted: boolean;
};

export type PortalView = "visitor" | "dashboard";

function isDashboardBlocked(user: CurrentUser) {
  return user.status in BLOCKED_MESSAGES;
}

const BLOCKED_MESSAGES: Record<string, { title: string; message: string }> = {
  suspendido: {
    title: "Cuenta suspendida",
    message: "Tu cuenta fue suspendida. No puedes acceder al sistema.",
  },
  rechazado: {
    title: "Cuenta rechazada",
    message: "Tu solicitud de registro fue rechazada.",
  },
};

function App() {
  const { isAuthenticated, isLoading, loginWithRedirect, user, getAccessTokenSilently } =
    useAuth0();
  const navigate = useNavigate();
  const [portalView, setPortalView] = useState<PortalView>("visitor");
  const [selectedView, setSelectedView] = useState("home");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isSyncingUser, setIsSyncingUser] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [pendingApplyJobId, setPendingApplyJobId] = useState<string | null>(
    () => sessionStorage.getItem(PENDING_APPLY_KEY)
  );
  const [openPublishForm, setOpenPublishForm] = useState(false);
  const [isBootstrappingCompany, setIsBootstrappingCompany] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const companyBootstrapStarted = useRef(false);

  const syncUser = useCallback(async () => {
    if (!isAuthenticated || !user?.sub) return;

    const email = user.email;

    if (!email) {
      setSyncError("No se pudo obtener tu correo desde Auth0.");
      return;
    }

    setIsSyncingUser(true);
    setSyncError(null);

    try {
      const mongoUser = await createCurrentUser({
        auth0Id: user.sub,
        email,
        name: user.name || user.nickname || "Usuario",
        role: "estudiante",
      });

      setCurrentUser(mongoUser);

      const registerIntent = sessionStorage.getItem(REGISTER_INTENT_KEY);

      if (registerIntent === "cliente" && !mongoUser.onboardingCompleted) {
        setPortalView("dashboard");
      }

      const pendingJob = sessionStorage.getItem(PENDING_APPLY_KEY);

      if (pendingJob) {
        setPendingApplyJobId(pendingJob);
        setPortalView("visitor");
        navigate("/empleos");
      }
    } catch (error) {
      setSyncError(
        error instanceof Error
          ? error.message
          : "No se pudo conectar con el servidor (puerto 3001)."
      );
      setCurrentUser(null);
    } finally {
      setIsSyncingUser(false);
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentUser(null);
      setSyncError(null);
      setPortalView("visitor");
      return;
    }

    if (user?.sub && !currentUser && !isSyncingUser && !syncError) {
      syncUser();
    }
  }, [isAuthenticated, user, currentUser, isSyncingUser, syncError, syncUser]);

  const publishIntent =
    sessionStorage.getItem(REGISTER_INTENT_KEY) === "cliente";

  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;
    if (currentUser.onboardingCompleted || !publishIntent) return;
    if (companyBootstrapStarted.current) return;

    companyBootstrapStarted.current = true;
    let cancelled = false;

    const runBootstrap = async () => {
      setIsBootstrappingCompany(true);
      setBootstrapError(null);

      try {
        const token = await getAccessTokenSilently();
        const updated = await bootstrapCompanyAccount(currentUser, token);

        if (cancelled) return;

        sessionStorage.removeItem(REGISTER_INTENT_KEY);
        setCurrentUser(updated);
        setPortalView("dashboard");
        setSelectedView("misTrabajos");
        setOpenPublishForm(true);
      } catch (error) {
        if (!cancelled) {
          companyBootstrapStarted.current = false;
          setBootstrapError(
            error instanceof Error
              ? error.message
              : "No se pudo preparar tu cuenta de empresa."
          );
        }
      } finally {
        if (!cancelled) {
          setIsBootstrappingCompany(false);
        }
      }
    };

    runBootstrap();

    return () => {
      cancelled = true;
    };
  }, [
    isAuthenticated,
    currentUser,
    publishIntent,
    getAccessTokenSilently,
  ]);

  const handleRequireLogin = () => {
    loginWithRedirect({
      appState: { returnTo: window.location.pathname },
    });
  };

  const handlePendingApplyHandled = () => {
    sessionStorage.removeItem(PENDING_APPLY_KEY);
    setPendingApplyJobId(null);
  };

  const openDashboard = () => {
    if (!currentUser) {
      handleRequireLogin();
      return;
    }

    if (!currentUser.onboardingCompleted) {
      setPortalView("dashboard");
      if (sessionStorage.getItem(REGISTER_INTENT_KEY) === "cliente") {
        setSelectedView("misTrabajos");
      }
      return;
    }

    if (isDashboardBlocked(currentUser)) {
      setPortalView("dashboard");
      return;
    }

    setPortalView("dashboard");
    setSelectedView(
      currentUser.role === "cliente"
        ? "misTrabajos"
        : currentUser.role === "administrador"
          ? "usuarios"
          : "postulaciones"
    );
  };

  const renderVisitorPortal = () => (
    <VisitorPortal
      currentUser={currentUser}
      pendingApplyJobId={pendingApplyJobId}
      onPendingApplyHandled={handlePendingApplyHandled}
      onRequireLogin={handleRequireLogin}
      onGoToDashboard={openDashboard}
    />
  );

  if (isLoading) {
    return <p className="loading-screen">Cargando...</p>;
  }

  if (!isAuthenticated) {
    return renderVisitorPortal();
  }

  if (isSyncingUser) {
    return <p className="loading-screen">Cargando tu cuenta...</p>;
  }

  if (syncError) {
    return (
      <VisitorLayout>
        <div className="home-card" style={{ margin: "40px auto", maxWidth: 480 }}>
          <BrandLogo size="lg" className="home-logo" />
          <h1>Error de sesión</h1>
          <p>{syncError}</p>
          <button className="primary-button" onClick={syncUser}>
            Reintentar
          </button>
        </div>
      </VisitorLayout>
    );
  }

  if (!currentUser) {
    return <p className="loading-screen">Preparando tu cuenta...</p>;
  }

  if (!currentUser.onboardingCompleted) {
    if (publishIntent || isBootstrappingCompany) {
      if (bootstrapError) {
        return (
          <VisitorLayout>
            <div
              className="home-card"
              style={{ margin: "40px auto", maxWidth: 480 }}
            >
              <BrandLogo size="lg" className="home-logo" />
              <h1>Error al publicar empleo</h1>
              <p>{bootstrapError}</p>
              <button
                className="primary-button"
                onClick={() => {
                  companyBootstrapStarted.current = false;
                  setBootstrapError(null);
                }}
              >
                Reintentar
              </button>
            </div>
          </VisitorLayout>
        );
      }

      return (
        <p className="loading-screen">
          Preparando formulario de publicación...
        </p>
      );
    }

    return (
      <OnboardingPage
        currentUser={currentUser}
        onFinish={(updated) => {
          sessionStorage.removeItem(REGISTER_INTENT_KEY);
          setCurrentUser(updated);

          const pending = sessionStorage.getItem(PENDING_APPLY_KEY);
          setPortalView(pending ? "visitor" : "dashboard");
          setSelectedView("postulaciones");
          if (pending) navigate("/empleos");
        }}
      />
    );
  }

  if (portalView === "visitor") {
    return renderVisitorPortal();
  }

  if (isDashboardBlocked(currentUser)) {
    const blocked = BLOCKED_MESSAGES[currentUser.status];

    return (
      <VisitorLayout currentUser={currentUser} onGoToDashboard={openDashboard}>
        <AccountBlockedScreen title={blocked.title} message={blocked.message} />
      </VisitorLayout>
    );
  }

  return (
    <DashboardLayout
      selectedView={selectedView}
      setSelectedView={setSelectedView}
      currentUser={currentUser}
      openPublishForm={openPublishForm}
      onPublishFormOpened={() => setOpenPublishForm(false)}
      onOpenJobBoard={() => {
        setPortalView("visitor");
        navigate("/empleos");
      }}
      onExitDashboard={() => {
        setPortalView("visitor");
        navigate("/");
      }}
    />
  );
}

export default App;

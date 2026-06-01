import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import DashboardLayout from "./layouts/DashboardLayout";
import HomePage from "./pages/HomePage";
import OnboardingPage from "./pages/OnboardingPage";
import { createCurrentUser } from "./api/userApi";

export type CurrentUser = {
  _id: string;
  auth0Id: string;
  email: string;
  name: string;
  role: "estudiante" | "cliente" | "administrador";
  status: string;
  onboardingCompleted: boolean;
};

function App() {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const [selectedView, setSelectedView] = useState("home");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => { 
    if (isAuthenticated && user?.sub && user?.email) {
      createCurrentUser({
        auth0Id: user.sub,
        email: user.email,
        name: user.name || "Usuario",
        role: "estudiante",
      })
        .then((mongoUser) => {
          setCurrentUser(mongoUser);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [isAuthenticated, user]);

  if (isLoading || (isAuthenticated && !currentUser)) {
    return <p>Cargando...</p>;
  }

  if (!isAuthenticated) {
    return <HomePage />;
  }

  if (currentUser && !currentUser.onboardingCompleted) {
    return (
      <OnboardingPage
        currentUser={currentUser}
        onFinish={setCurrentUser}
      />
    );
  }

  if (currentUser && currentUser.status === "suspendido") {
    return (
      <div className="home-page">
        <div className="home-card">
          <div className="logo home-logo">½</div>

          <h1>Cuenta suspendida</h1>

          <p>
            Tu cuenta fue suspendida por el administrador. No puedes acceder al
            sistema por el momento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      selectedView={selectedView}
      setSelectedView={setSelectedView}
      currentUser={currentUser}
    />
  );
}

export default App;
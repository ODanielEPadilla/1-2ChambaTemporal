import { Link, useLocation, useNavigate } from "react-router-dom";
import type { CurrentUser } from "../App";
import LoginButton from "../components/LoginButton";
import BrandLogo from "../components/BrandLogo";

type Props = {
  children: React.ReactNode;
  currentUser?: CurrentUser | null;
  onGoToDashboard?: () => void;
};

export default function VisitorLayout({
  children,
  currentUser,
  onGoToDashboard,
}: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  const roleLabel =
    currentUser?.role === "cliente"
      ? "Empresa"
      : currentUser?.role === "administrador"
        ? "Administrador"
        : currentUser?.role === "estudiante"
          ? "Estudiante"
          : null;

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: sectionId } });
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="visitor-app">
      <header className="visitor-header">
        <div className="visitor-header-inner">
          <Link to="/" className="visitor-brand">
            <BrandLogo size="sm" />
          </Link>

          <nav className="visitor-nav">
            <Link
              to="/"
              className={`visitor-nav-link ${
                location.pathname === "/" ? "active" : ""
              }`}
            >
              Inicio
            </Link>
            <button
              type="button"
              className="visitor-nav-link"
              onClick={() => scrollToSection("nosotros")}
            >
              Nosotros
            </button>
            <Link
              to="/empleos"
              className={`visitor-nav-link ${
                location.pathname.startsWith("/empleos") ? "active" : ""
              }`}
            >
              Empleos
            </Link>
          </nav>

          <div className="visitor-header-actions">
            {currentUser ? (
              <button
                type="button"
                className="visitor-account-btn"
                onClick={onGoToDashboard}
              >
                <span className="visitor-account-name">{currentUser.name}</span>
                {roleLabel && (
                  <span className="visitor-account-role">{roleLabel}</span>
                )}
              </button>
            ) : (
              <LoginButton label="Ingresar" className="visitor-login-btn" />
            )}

            {currentUser?.role !== "estudiante" && (
              <LoginButton
                label="Empresas / Publicar empleos"
                intent="publish"
                className="visitor-publish-btn"
                onAuthenticatedClick={onGoToDashboard}
              />
            )}
          </div>
        </div>
      </header>

      <main className="visitor-main">{children}</main>

      <footer className="visitor-footer">
        <p>1/2Chamba © 2026 — Plataforma académica ITZ</p>
        <p>Conectando estudiantes de ISC con empresas en Zacatecas</p>
      </footer>
    </div>
  );
}

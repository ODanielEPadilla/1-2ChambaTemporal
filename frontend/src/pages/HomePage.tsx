import LoginButton from "../components/LoginButton";
import BrandLogo from "../components/BrandLogo";

export default function HomePage() {
  return (
    <div className="home-page">
      <div className="home-card">
        <BrandLogo size="lg" className="home-logo" />

        <p>
          Plataforma para conectar estudiantes de ISC del ITZ con empresas
          y clientes que necesitan servicios de tecnología.
        </p>

        <LoginButton label="Ingresar" />
      </div>
    </div>
  );
}

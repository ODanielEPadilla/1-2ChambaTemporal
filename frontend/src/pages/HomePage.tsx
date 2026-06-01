import LoginButton from "../components/LoginButton";

export default function HomePage() {
  return (
    <div className="home-page">
      <div className="home-card">
        <div className="logo home-logo">½</div>

        <h1>1/2Chamba</h1>

        <p>
          Plataforma para conectar estudiantes de ISC del ITZ con empresas
          y clientes que necesitan servicios de tecnología.
        </p>

        <LoginButton />
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoginButton from "../components/LoginButton";
import { useAuth0 } from "@auth0/auth0-react";

type Props = {
  onGoToDashboard?: () => void;
};

export default function VisitorHomePage({ onGoToDashboard }: Props) {
  const { isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  const [heroQuery, setHeroQuery] = useState("");
  const [heroLocation, setHeroLocation] = useState("Zacatecas, Zac.");

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const sectionId =
      (location.state as { scrollTo?: string } | null)?.scrollTo ||
      window.location.hash.replace("#", "");

    if (!sectionId) return;

    setTimeout(() => scrollTo(sectionId), 150);
  }, [location]);

  const goToEmpleos = (query?: string, location?: string) => {
    const params = new URLSearchParams();

    const q = query ?? heroQuery;
    const loc = location ?? heroLocation;

    if (q.trim()) params.set("q", q.trim());
    if (loc.trim()) params.set("location", loc.trim());

    const search = params.toString();
    navigate(search ? `/empleos?${search}` : "/empleos");
  };

  const handleHeroSearch = (event: React.FormEvent) => {
    event.preventDefault();
    goToEmpleos();
  };

  const handleComenzar = () => {
    if (isAuthenticated) {
      onGoToDashboard?.();
      return;
    }
    goToEmpleos();
  };

  return (
    <div className="landing-page">
      <section className="landing-hero" id="inicio">
        <div className="landing-hero-inner">
          <form className="landing-search-bar" onSubmit={handleHeroSearch}>
            <div className="landing-search-field">
              <span className="landing-search-icon" aria-hidden>
                🔍
              </span>
              <input
                type="text"
                placeholder="Título del empleo, palabras clave..."
                value={heroQuery}
                onChange={(e) => setHeroQuery(e.target.value)}
              />
            </div>

            <div className="landing-search-divider" />

            <div className="landing-search-field">
              <span className="landing-search-icon" aria-hidden>
                📍
              </span>
              <input
                type="text"
                placeholder="Zacatecas, Zac."
                value={heroLocation}
                onChange={(e) => setHeroLocation(e.target.value)}
              />
            </div>

            <button type="submit" className="landing-search-submit">
              Buscar empleos
            </button>
          </form>

          <div className="landing-hero-content">
            <div className="landing-hero-logo">½</div>
            <h1>Tu próxima media chamba comienza aquí</h1>
            <p className="landing-hero-lead">
              Conectamos estudiantes de Ingeniería en Sistemas Computacionales
              del ITZ con empresas y clientes que necesitan talento en tecnología.
            </p>
            <p className="landing-hero-sub">
              Explora vacantes sin registrarte. Inicia sesión solo cuando quieras
              postularte o publicar un empleo.
            </p>

            <div className="landing-hero-actions">
              <button
                type="button"
                className="landing-cta-primary"
                onClick={handleComenzar}
              >
                Comenzar →
              </button>
              <button
                type="button"
                className="landing-cta-secondary"
                onClick={() => scrollTo("nosotros")}
              >
                Conocer 1/2Chamba
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-stats">
        <div className="landing-stats-grid">
          <article>
            <strong>ISC · ITZ</strong>
            <span>Enfocado en estudiantes de sistemas</span>
          </article>
          <article>
            <strong>Zacatecas</strong>
            <span>Vacantes locales y remotas</span>
          </article>
          <article>
            <strong>Medio tiempo</strong>
            <span>Compatible con tu escuela</span>
          </article>
          <article>
            <strong>Sin fricción</strong>
            <span>Navega libre, postula con cuenta</span>
          </article>
        </div>
      </section>

      <section className="landing-section" id="nosotros">
        <div className="landing-section-inner">
          <span className="landing-eyebrow">Quiénes somos</span>
          <h2>1/2Chamba: empleos de medio tiempo para el mundo tech</h2>
          <p className="landing-text-block">
            Somos una plataforma académica desarrollada en el Instituto
            Tecnológico de Zacatecas. Nació para resolver una necesidad real:
            muchos estudiantes de ISC buscan ingresos sin sacrificar sus
            estudios, y las empresas locales necesitan apoyo en desarrollo web,
            soporte, bases de datos y diseño de interfaces.
          </p>
          <p className="landing-text-block">
            Actuamos como puente entre ambas partes con un proceso claro,
            perfiles verificados y vacantes publicadas por categoría y
            modalidad, pensadas para la formación que ya llevas en la carrera.
          </p>
        </div>
      </section>

      <section className="landing-section landing-section--muted">
        <div className="landing-section-inner landing-two-col">
          <div>
            <span className="landing-eyebrow">Misión</span>
            <h2>Impulsar el talento joven del ITZ</h2>
            <p>
              Facilitar que estudiantes de Ingeniería en Sistemas Computacionales
              accedan a trabajos reales donde apliquen sus conocimientos, mientras
              empresas y clientes independientes encuentran soluciones
              tecnológicas accesibles y de calidad.
            </p>
          </div>
          <div>
            <span className="landing-eyebrow">Visión</span>
            <h2>Un piloto que puede crecer</h2>
            <p>
              Iniciamos en Zacatecas con la carrera de ISC, con la meta de
              convertirnos en referencia regional para empleos de medio tiempo
              especializados en el área de sistemas computacionales.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-section" id="como-funciona">
        <div className="landing-section-inner">
          <span className="landing-eyebrow">Cómo funciona</span>
          <h2>Tres pasos, sin complicaciones</h2>

          <div className="landing-steps">
            <article className="landing-step-card">
              <span className="landing-step-num">1</span>
              <h3>Explora</h3>
              <p>
                Usa el buscador para encontrar vacantes por palabra clave,
                ubicación, categoría o modalidad. No necesitas cuenta para ver
                ofertas.
              </p>
            </article>
            <article className="landing-step-card">
              <span className="landing-step-num">2</span>
              <h3>Regístrate</h3>
              <p>
                Al postularte o publicar empleos, creas tu perfil: estudiante
                con correo ITZ o empresa con verificación administrativa.
              </p>
            </article>
            <article className="landing-step-card">
              <span className="landing-step-num">3</span>
              <h3>Conecta</h3>
              <p>
                Postula con un mensaje de presentación, gestiona solicitudes y
                califica la experiencia al terminar el trabajo.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-section landing-audience">
        <div className="landing-section-inner landing-two-col">
          <article className="landing-audience-card">
            <h3>Para estudiantes</h3>
            <ul>
              <li>Vacantes en desarrollo web, soporte, BD y UI</li>
              <li>Modalidad remota, presencial o híbrida</li>
              <li>Perfil con habilidades y calificación visible</li>
              <li>Postulación con mensaje personalizado</li>
            </ul>
            {!isAuthenticated && (
              <LoginButton label="Crear cuenta de estudiante" className="primary-button" />
            )}
          </article>

          <article className="landing-audience-card landing-audience-card--accent">
            <h3>Para empresas</h3>
            <ul>
              <li>Publica trabajos con ubicación y compensación</li>
              <li>Recibe y gestiona postulaciones en línea</li>
              <li>Revisa perfiles y habilidades técnicas</li>
              <li>Califica al estudiante al finalizar</li>
            </ul>
            <LoginButton
              label="Publicar un empleo"
              intent="publish"
              className="primary-button"
              onAuthenticatedClick={onGoToDashboard}
            />
          </article>
        </div>
      </section>

      <section className="landing-section landing-section--cta">
        <div className="landing-cta-banner">
          <h2>¿Listo para dar el siguiente paso?</h2>
          <p>
            Miles de oportunidades empiezan con una búsqueda. Encuentra la tuya
            hoy en Zacatecas.
          </p>
          <button
            type="button"
            className="landing-cta-primary"
            onClick={() => goToEmpleos()}
          >
            Ver empleos disponibles
          </button>
        </div>
      </section>
    </div>
  );
}

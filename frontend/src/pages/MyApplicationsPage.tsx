import { useEffect, useState } from "react";
import type { CurrentUser } from "../App";
import { getApplicationsByStudent } from "../api/applicationApi";
import { createRating } from "../api/createRatingApi";
import { useAuth0 } from "@auth0/auth0-react";
import { formatApplicationStatus, getApplicationFeedback } from "../utils/formatLabels";
import { useToast } from "../components/Toast";

type Props = {
  currentUser: CurrentUser | null;
};

type Application = {
  _id: string;
  status: string;
  message: string;
  job: {
    _id: string;
    title: string;
    status: string;
    client: {
      _id: string;
      name: string;
      email: string;
    };
  };
};

export default function MyApplicationsPage({ currentUser }: Props) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getAccessTokenSilently } = useAuth0();
  const { showToast } = useToast();
  const [ratingApplication, setRatingApplication] = useState<Application | null>(null);
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");


  useEffect(() => {
    if (!currentUser?._id) return;

    const loadApplications = async () => {
      try {
        const token = await getAccessTokenSilently();

        const data = await getApplicationsByStudent(
          currentUser._id,
          token
        );

        setApplications(data);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    };

    loadApplications();
  }, [currentUser, getAccessTokenSilently]);

  const handleCreateRating = async () => {
    if (!currentUser?._id || !ratingApplication) return;

    try {
      const token = await getAccessTokenSilently();
      await createRating(
        {
          job: ratingApplication.job._id,
          reviewer: currentUser._id,
          reviewed: ratingApplication.job.client._id,
          score,
          comment,
        },
        token
      );

      showToast("Calificación guardada correctamente", "success");

      setRatingApplication(null);
      setScore(5);
      setComment("");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Error al guardar calificación",
        "error"
      );
    }
  };

  if (isLoading) {
    return <p>Cargando postulaciones...</p>;
  }

  if (ratingApplication) {
    return (
      <div>
        <button
          className="back-button"
          onClick={() => setRatingApplication(null)}
        >
          ← Volver a mis postulaciones
        </button>

        <div className="detail-card">
          <h2>Calificar empresa</h2>

          <p>
            <strong>Trabajo:</strong> {ratingApplication.job?.title}
          </p>

          <p>
            <strong>Empresa:</strong> {ratingApplication.job?.client?.name}
          </p>

          <label className="form-label">Calificación</label>
          <select
            className="form-input"
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={4}>4</option>
            <option value={3}>3</option>
            <option value={2}>2</option>
            <option value={1}>1</option>
          </select>

          <label className="form-label">Comentario</label>
          <textarea
            className="form-textarea"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escribe un comentario sobre la empresa..."
          />

          <button className="primary-button" onClick={handleCreateRating}>
            Guardar calificación
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="applications-page">
      <header className="applications-page-header">
        <span className="profile-eyebrow">Seguimiento</span>
        <h2>Mis postulaciones</h2>
        <p>
          Aquí ves el estatus que asignó cada empresa a tu solicitud.
        </p>
      </header>

      {applications.length === 0 ? (
        <div className="applications-empty">
          <p>Aún no te has postulado a ninguna vacante.</p>
        </div>
      ) : (
        <div className="applications-list">
          {applications.map((application) => {
            const feedback = getApplicationFeedback(application.status);

            return (
            <article className="application-card" key={application._id}>
              <div className="application-card-header">
                <div>
                  <h3>{application.job?.title}</h3>
                  <p>
                    <strong>Empresa:</strong>{" "}
                    {application.job?.client?.name}
                  </p>
                </div>
                <span
                  className={`status-badge status-badge--${application.status}`}
                >
                  {formatApplicationStatus(application.status)}
                </span>
              </div>

              <div className="application-card-message">
                <strong>Tu mensaje</strong>
                <p>{application.message}</p>
              </div>

              {feedback && (
                <p
                  className={`application-feedback application-feedback--${application.status}`}
                >
                  {feedback}
                </p>
              )}

              {application.status === "aceptada" &&
                application.job?.status === "finalizado" && (
                  <div className="card-actions">
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => setRatingApplication(application)}
                    >
                      Calificar empresa
                    </button>
                  </div>
                )}
            </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
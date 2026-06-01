import { useEffect, useState } from "react";
import type { CurrentUser } from "../App";
import { getApplicationsByStudent } from "../api/applicationApi";
import { createRating } from "../api/createRatingApi";
import { useAuth0 } from "@auth0/auth0-react";

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

      alert("Calificación guardada correctamente");

      setRatingApplication(null);
      setScore(5);
      setComment("");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Error al guardar calificación"
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
          <h2>Calificar empresa/cliente</h2>

          <p>
            <strong>Trabajo:</strong> {ratingApplication.job?.title}
          </p>

          <p>
            <strong>Empresa/Cliente:</strong>{" "}
            {ratingApplication.job?.client?.name}
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
            placeholder="Escribe un comentario sobre la empresa o cliente..."
          />

          <button className="primary-button" onClick={handleCreateRating}>
            Guardar calificación
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Mis postulaciones</h2>

      <div className="cards-grid">
        {applications.map((application) => (
          <article className="job-card" key={application._id}>
            <h3>{application.job?.title}</h3>

            <p>
              <strong>Empresa/Cliente:</strong>{" "}
              {application.job?.client?.name}
            </p>

            <p>
              <strong>Mensaje enviado:</strong> {application.message}
            </p>

            <span className={`status-badge ${application.status}`}>
              {application.status}
            </span>

            {application.status === "aceptada" &&
              application.job?.status === "finalizado" && (
                <div className="card-actions">
                  <button onClick={() => setRatingApplication(application)}>
                    Calificar empresa/cliente
                  </button>
                </div>
              )}
          </article>
        ))}
      </div>
    </div>
  );
}
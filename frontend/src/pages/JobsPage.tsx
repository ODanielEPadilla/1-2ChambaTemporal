import { useEffect, useState } from "react";
import type { CurrentUser } from "../App";
import { getJobs } from "../api/jobApi";
import { createApplication } from "../api/applicationApi";
import { useAuth0 } from "@auth0/auth0-react";

type Props = {
  currentUser: CurrentUser | null;
};

type Job = {
  _id: string;
  title: string;
  description: string;
  category: string;
  modality: string;
  estimatedDuration: string;
  client: {
    name: string;
  };
};

export default function JobsPage({ currentUser }: Props) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const token = await getAccessTokenSilently();
        const data = await getJobs(token);

        setJobs(data);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    };

    loadJobs();
  }, [getAccessTokenSilently]);
  const handleCreateApplication = async () => {
    if (!applyingJob || !currentUser?._id) return;

    try {
      const token = await getAccessTokenSilently();

      await createApplication(
        {
          job: applyingJob._id,
          student: currentUser._id,
          message,
        },
        token
      );

      alert("Postulación enviada correctamente");
      setMessage("");
      setApplyingJob(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al postularse");
    }
  };

  if (isLoading) {
    return <p>Cargando trabajos...</p>;
  }

  if (applyingJob) {
    return (
      <div>
        <button className="back-button" onClick={() => setApplyingJob(null)}>
          ← Volver
        </button>

        <div className="detail-card">
          <h2>Postularme a: {applyingJob.title}</h2>

          <p>
            <strong>Empresa/Cliente:</strong> {applyingJob.client?.name}
          </p>

          <label className="form-label">Mensaje de presentación</label>

          <textarea
            className="form-textarea"
            placeholder="Escribe por qué te interesa este trabajo..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className="form-actions">
            <button
              className="secondary-button"
              onClick={() => setApplyingJob(null)}
            >
              Cancelar
            </button>

            <button className="primary-button" onClick={handleCreateApplication}>
              Enviar postulación
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedJob) {
    return (
      <div>
        <button className="back-button" onClick={() => setSelectedJob(null)}>
          ← Volver a trabajos
        </button>

        <div className="detail-card">
          <h2>{selectedJob.title}</h2>

          <div className="job-meta">
            <span>{selectedJob.category}</span>
            <span>{selectedJob.modality}</span>
            <span>{selectedJob.estimatedDuration}</span>
          </div>

          <p>
            <strong>Empresa/Cliente:</strong> {selectedJob.client?.name}
          </p>

          <p>
            <strong>Calificación:</strong> 4.5 / 5
          </p>

          <p>{selectedJob.description}</p>

          <button
            className="primary-button"
            onClick={() => setApplyingJob(selectedJob)}
          >
            Postularme
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Trabajos disponibles</h2>

      <div className="cards-grid">
        {jobs.map((job) => (
          <article className="job-card" key={job._id}>
            <h3>{job.title}</h3>

            <div className="job-meta">
              <span>{job.category}</span>
              <span>{job.modality}</span>
              <span>{job.estimatedDuration}</span>
            </div>

            <p>{job.description}</p>

            <div className="card-actions">
              <button onClick={() => setSelectedJob(job)}>Ver detalles</button>

              <button onClick={() => setApplyingJob(job)}>Postularme</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
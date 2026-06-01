import { useEffect, useState } from "react";
import { getAllJobs, deleteJob } from "../api/adminApi";
import { useAuth0 } from "@auth0/auth0-react";

type Job = {
  _id: string;
  title: string;
  category: string;
  modality: string;
  status: string;
  client: {
    name: string;
    email: string;
  };
};

export default function AdminJobsPage() {
  const { getAccessTokenSilently } = useAuth0();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
  const loadJobs = async () => {
    try {
      const token = await getAccessTokenSilently();
      const data = await getAllJobs(token);

      setJobs(data);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  loadJobs();
}, [getAccessTokenSilently]);

  const handleDeleteJob = async (jobId: string) => {
  try {
    const token = await getAccessTokenSilently();

    await deleteJob(jobId, token);

    setJobs((currentJobs) =>
      currentJobs.filter((job) => job._id !== jobId)
    );

    alert("Trabajo eliminado correctamente");
  } catch (error) {
    alert(
      error instanceof Error ? error.message : "Error al eliminar trabajo"
    );
  }
};

  if (selectedJob) {
    return (
      <div>
        <button
          className="back-button"
          onClick={() => setSelectedJob(null)}
        >
          ← Volver a trabajos
        </button>

        <div className="detail-card">
          <h2>{selectedJob.title}</h2>

          <div className="job-meta">
            <span>{selectedJob.category}</span>
            <span>{selectedJob.modality}</span>
            <span>{selectedJob.status}</span>
          </div>

          <p>
            <strong>Cliente:</strong> {selectedJob.client?.name}
          </p>

          <p>
            <strong>Correo:</strong> {selectedJob.client?.email}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <p>Cargando trabajos...</p>;
  }

  return (
    <div>
      <h2>Trabajos publicados</h2>

      <div className="cards-grid">
        {jobs.map((job) => (
          <article className="job-card" key={job._id}>
            <h3>{job.title}</h3>

            <p>
              <strong>Cliente:</strong> {job.client?.name}
            </p>

            <p>
              <strong>Correo:</strong> {job.client?.email}
            </p>

            <p>
              <strong>Categoría:</strong> {job.category}
            </p>

            <p>
              <strong>Modalidad:</strong> {job.modality}
            </p>

            <span className={`status-badge ${job.status}`}>
              {job.status}
            </span>

            <div className="card-actions">
              <button onClick={() => setSelectedJob(job)}>
                Ver detalle
              </button>

              <button onClick={() => handleDeleteJob(job._id)}>
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
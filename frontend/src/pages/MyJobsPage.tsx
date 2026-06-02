import { useEffect, useState } from "react";
import type { CurrentUser } from "../App";
import { createJob, getJobsByClient, updateJob, finishJob } from "../api/myJobApi";
import { getApplicationsByJob, updateApplicationStatus } from "../api/receivedApplicationsApi";
import { createRating } from "../api/createRatingApi";
import { useAuth0 } from "@auth0/auth0-react";
import { formatApplicationStatus } from "../utils/formatLabels";
import { useToast } from "../components/Toast";

type Props = {
  currentUser: CurrentUser | null;
  initialShowForm?: boolean;
  onFormOpened?: () => void;
};

type Job = {
  _id: string;
  title: string;
  description: string;
  category: string;
  modality: string;
  estimatedDuration: string;
  status: string;
};

export default function MyJobsPage({
  currentUser,
  initialShowForm = false,
  onFormOpened,
}: Props) {
  const [showForm, setShowForm] = useState(initialShowForm);
  const [editingJobId, setEditingJobId] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobApplications, setSelectedJobApplications] = useState<any[]>([]);
  const [selectedJobTitle, setSelectedJobTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("desarrollo web");
  const [modality, setModality] = useState("remoto");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [location, setLocation] = useState("Zacatecas, Zac.");
  const [city, setCity] = useState("Zacatecas");
  const [compensation, setCompensation] = useState("A convenir");
  const [skillsRequired, setSkillsRequired] = useState("");
  const [vacancies, setVacancies] = useState(1);
  const [ratingApplication, setRatingApplication] = useState<any | null>(null);
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");
  const { getAccessTokenSilently } = useAuth0();
  const { showToast } = useToast();

  useEffect(() => {
    if (!initialShowForm) return;
    setShowForm(true);
    onFormOpened?.();
  }, [initialShowForm, onFormOpened]);

  useEffect(() => {
    if (!currentUser?._id) return;

    const loadJobs = async () => {
      try {
        const token = await getAccessTokenSilently();

        const data = await getJobsByClient(currentUser._id, token);

        setJobs(data);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    };

    loadJobs();
  }, [currentUser, getAccessTokenSilently]);

  const handleCreateJob = async () => {
    if (!currentUser?._id) return;

    try {
      const token = await getAccessTokenSilently();

      const newJob = await createJob(
        {
          client: currentUser._id,
          title,
          description,
          category,
          modality,
          estimatedDuration,
          location,
          city,
          compensation,
          skillsRequired: skillsRequired
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
          vacancies,
        },
        token
      );

      setJobs((currentJobs) => [...currentJobs, newJob]);

      showToast("Trabajo publicado correctamente", "success");

      setTitle("");
      setDescription("");
      setCategory("desarrollo web");
      setModality("remoto");
      setEstimatedDuration("");
      setLocation("Zacatecas, Zac.");
      setCity("Zacatecas");
      setCompensation("A convenir");
      setSkillsRequired("");
      setVacancies(1);
      setEditingJobId("");
      setShowForm(false);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Error al publicar trabajo",
        "error"
      );
    }
  };

  const handleEditJob = (job: Job) => {
    setEditingJobId(job._id);

    setTitle(job.title);
    setDescription(job.description || "");
    setCategory(job.category);
    setModality(job.modality);
    setEstimatedDuration(job.estimatedDuration);
    setLocation((job as Job & { location?: string }).location || "Zacatecas, Zac.");
    setCity((job as Job & { city?: string }).city || "Zacatecas");
    setCompensation(
      (job as Job & { compensation?: string }).compensation || "A convenir"
    );
    setSkillsRequired(
      ((job as Job & { skillsRequired?: string[] }).skillsRequired || []).join(
        ", "
      )
    );
    setVacancies((job as Job & { vacancies?: number }).vacancies || 1);

    setShowForm(true);
  };

  const handleUpdateJob = async () => {
    try {
      const token = await getAccessTokenSilently();

      const updatedJob = await updateJob(
        editingJobId,
        {
          title,
          description,
          category,
          modality,
          estimatedDuration,
          status: "abierto",
          location,
          city,
          compensation,
          skillsRequired: skillsRequired
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
          vacancies,
        },
        token
      );

      setJobs((currentJobs) =>
        currentJobs.map((job) =>
          job._id === editingJobId ? updatedJob : job
        )
      );

      showToast("Trabajo actualizado correctamente", "success");

      setEditingJobId("");
      setTitle("");
      setDescription("");
      setCategory("desarrollo web");
      setModality("remoto");
      setEstimatedDuration("");
      setShowForm(false);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Error al actualizar trabajo",
        "error"
      );
    }
  };

  const handleFinishJob = async (jobId: string) => {
    try {
      const token = await getAccessTokenSilently();

      const finishedJob = await finishJob(jobId, token);

      setJobs((currentJobs) =>
        currentJobs.map((job) =>
          job._id === jobId ? finishedJob : job
        )
      );

      showToast("Trabajo finalizado correctamente", "success");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Error al finalizar trabajo",
        "error"
      );
    }
  };

  const handleCreateRating = async () => {
    if (!currentUser?._id || !ratingApplication) return;

    try {
      const token = await getAccessTokenSilently();

      await createRating(
        {
          job: ratingApplication.job,
          reviewer: currentUser._id,
          reviewed: ratingApplication.student._id,
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

  const handleViewApplications = async (jobId: string, jobTitle: string) => {
    try {
      const token = await getAccessTokenSilently();

      const data = await getApplicationsByJob(jobId, token);

      setSelectedJobApplications(data);
      setSelectedJobTitle(jobTitle);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Error al obtener postulaciones",
        "error"
      );
    }
  };

  const handleUpdateApplicationStatus = async (
    applicationId: string,
    status: string
  ) => {
    try {
      const token = await getAccessTokenSilently();

      const updatedApplication = await updateApplicationStatus(
        applicationId,
        status,
        token
      );

      setSelectedJobApplications((currentApplications) =>
        currentApplications.map((application) =>
          application._id === applicationId
            ? {
              ...application,
              status: updatedApplication.status,
            }
            : application
        )
      );
      showToast("Estatus de postulación actualizado", "success");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Error al actualizar postulación",
        "error"
      );
    }
  };

  if (isLoading) {
    return <p>Cargando mis trabajos...</p>;
  }

  if (ratingApplication) {
    return (
      <div>
        <button
          className="back-button"
          onClick={() => setRatingApplication(null)}
        >
          ← Volver
        </button>

        <div className="detail-card">
          <h2>Calificar estudiante</h2>

          <p>
            <strong>Estudiante:</strong> {ratingApplication.student?.name}
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
            placeholder="Escribe un comentario sobre el trabajo del estudiante..."
          />

          <button className="primary-button" onClick={handleCreateRating}>
            Guardar calificación
          </button>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="publish-job-page">
        <button className="back-button" onClick={() => setShowForm(false)}>
          Volver a mis trabajos
        </button>

        <header className="publish-job-header">
          <span className="profile-eyebrow">Bolsa de empleo</span>
          <h2>
            {editingJobId ? "Editar vacante" : "Registrar nueva vacante"}
          </h2>
          <p>
            Completa la información del puesto. Los estudiantes ISC podrán verla
            en la bolsa pública de 1/2Chamba.
          </p>
        </header>

        <div className="publish-job-card">
          <section className="publish-job-section">
            <h3>Información general</h3>
            <div className="publish-job-grid">
              <div className="publish-job-field publish-job-field--full">
                <label className="form-label">Título del puesto</label>
                <input
                  className="form-input"
                  placeholder="Ej. Desarrollador web para PYME"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="publish-job-field publish-job-field--full">
                <label className="form-label">Descripción del trabajo</label>
                <textarea
                  className="form-textarea"
                  placeholder="Actividades, requisitos y entregables esperados..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="publish-job-field">
                <label className="form-label">Categoría</label>
                <select
                  className="form-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="desarrollo web">Desarrollo web</option>
                  <option value="soporte tecnico">Soporte técnico</option>
                  <option value="base de datos">Base de datos</option>
                  <option value="diseño de interfaces">Diseño de interfaces</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div className="publish-job-field">
                <label className="form-label">Modalidad</label>
                <select
                  className="form-input"
                  value={modality}
                  onChange={(e) => setModality(e.target.value)}
                >
                  <option value="remoto">Remoto</option>
                  <option value="presencial">Presencial</option>
                  <option value="hibrido">Híbrido</option>
                </select>
              </div>
            </div>
          </section>

          <section className="publish-job-section">
            <h3>Ubicación y compensación</h3>
            <div className="publish-job-grid">
              <div className="publish-job-field">
                <label className="form-label">Duración estimada</label>
                <input
                  className="form-input"
                  placeholder="Ej. 2 meses, medio tiempo"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                />
              </div>

              <div className="publish-job-field">
                <label className="form-label">Vacantes</label>
                <input
                  className="form-input"
                  type="number"
                  min={1}
                  value={vacancies}
                  onChange={(e) => setVacancies(Number(e.target.value))}
                />
              </div>

              <div className="publish-job-field">
                <label className="form-label">Ubicación</label>
                <input
                  className="form-input"
                  placeholder="Ej. Zacatecas, Zac."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="publish-job-field">
                <label className="form-label">Ciudad</label>
                <input
                  className="form-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div className="publish-job-field publish-job-field--full">
                <label className="form-label">Compensación</label>
                <input
                  className="form-input"
                  placeholder="Ej. $3,500 / mes o A convenir"
                  value={compensation}
                  onChange={(e) => setCompensation(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="publish-job-section">
            <h3>Perfil buscado</h3>
            <div className="publish-job-grid">
              <div className="publish-job-field publish-job-field--full">
                <label className="form-label">
                  Habilidades requeridas (separadas por coma)
                </label>
                <input
                  className="form-input"
                  placeholder="React, Node.js, MongoDB, Git"
                  value={skillsRequired}
                  onChange={(e) => setSkillsRequired(e.target.value)}
                />
              </div>
            </div>
          </section>

          <div className="publish-job-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={editingJobId ? handleUpdateJob : handleCreateJob}
            >
              {editingJobId ? "Guardar cambios" : "Publicar vacante"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedJobApplications.length > 0) {
    return (
      <div>
        <button
          className="back-button"
          onClick={() => setSelectedJobApplications([])}
        >
          ← Volver a mis trabajos
        </button>

        <h2>Postulaciones de: {selectedJobTitle}</h2>

        <div className="cards-grid">
          {selectedJobApplications.map((application) => (
            <article className="job-card" key={application._id}>
              <h3>{application.student?.name}</h3>

              <p>
                <strong>Email:</strong>{" "}
                {application.student?.email}
              </p>

              <p>
                <strong>Mensaje:</strong>{" "}
                {application.message}
              </p>

              <span
                className={`status-badge status-badge--${application.status}`}
              >
                {formatApplicationStatus(application.status)}
              </span>

              <div className="application-status-actions">
                <button
                  type="button"
                  className={
                    application.status === "pendiente"
                      ? "status-action-btn active"
                      : "status-action-btn"
                  }
                  onClick={() =>
                    handleUpdateApplicationStatus(
                      application._id,
                      "pendiente"
                    )
                  }
                >
                  Pendiente
                </button>
                <button
                  type="button"
                  className={
                    application.status === "aceptada"
                      ? "status-action-btn active accepted"
                      : "status-action-btn accepted"
                  }
                  onClick={() =>
                    handleUpdateApplicationStatus(application._id, "aceptada")
                  }
                >
                  Aceptada
                </button>
                <button
                  type="button"
                  className={
                    application.status === "rechazada"
                      ? "status-action-btn active rejected"
                      : "status-action-btn rejected"
                  }
                  onClick={() =>
                    handleUpdateApplicationStatus(application._id, "rechazada")
                  }
                >
                  Rechazada
                </button>
              </div>

              {application.status === "aceptada" && (
                <div className="card-actions">
                  <button onClick={() => setRatingApplication(application)}>
                    Calificar
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header">
        <h2>Mis trabajos</h2>

        <button
          className="primary-button"
          onClick={() => {
            setEditingJobId("");
            setTitle("");
            setDescription("");
            setCategory("desarrollo web");
            setModality("remoto");
            setEstimatedDuration("");
            setShowForm(true);
          }}
        >
          + Publicar nuevo trabajo
        </button>
      </div>

      <div className="cards-grid">
        {jobs.map((job) => (
          <article className="job-card" key={job._id}>
            <h3>{job.title}</h3>

            <div className="job-meta">
              <span>{job.category}</span>
              <span>{job.modality}</span>
              <span>{job.estimatedDuration}</span>
            </div>

            <p>
              <strong>Estado:</strong> {job.status}
            </p>

            <div className="card-actions">
              <button
                onClick={() =>
                  handleViewApplications(job._id, job.title)
                }
              >
                Ver postulaciones
              </button>
              <button onClick={() => handleEditJob(job)}>
                Editar
              </button>

              {job.status === "en_proceso" && (
                <button onClick={() => handleFinishJob(job._id)}>
                  Finalizar trabajo
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
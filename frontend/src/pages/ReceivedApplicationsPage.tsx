import { useEffect, useState } from "react";
import type { CurrentUser } from "../App";
import { getJobsByClient } from "../api/myJobApi";
import {
  getApplicationsByJob,
  updateApplicationStatus,
} from "../api/receivedApplicationsApi";
import { useAuth0 } from "@auth0/auth0-react";
import AvatarPlaceholder from "../components/AvatarPlaceholder";
import { formatApplicationStatus } from "../utils/formatLabels";
import { useToast } from "../components/Toast";

type Props = {
  currentUser: CurrentUser | null;
};

type Application = {
  _id: string;
  status: string;
  message: string;
  student: {
    name: string;
    email: string;
  };
  job: {
    _id: string;
    title: string;
  };
};

type Job = {
  _id: string;
};

export default function ReceivedApplicationsPage({
  currentUser,
}: Props) {
  const { getAccessTokenSilently } = useAuth0();
  const { showToast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState("todas");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?._id) return;

    const loadApplications = async () => {
      try {
        const token = await getAccessTokenSilently();
        const jobs = await getJobsByClient(currentUser._id, token);

        const applicationsByJob = await Promise.all(
          jobs.map((job: Job) => getApplicationsByJob(job._id, token))
        );

        setApplications(applicationsByJob.flat());
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    };

    loadApplications();
  }, [currentUser, getAccessTokenSilently]);

  const filteredApplications =
    activeTab === "todas"
      ? applications
      : applications.filter((application) => application.status === activeTab);

  const handleUpdateStatus = async (
    applicationId: string,
    newStatus: string
  ) => {
    try {
      const token = await getAccessTokenSilently();

      const updatedApplication = await updateApplicationStatus(
        applicationId,
        newStatus,
        token
      );

      setApplications((currentApplications) =>
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
    return <p className="profile-loading">Cargando postulaciones...</p>;
  }

  return (
    <div className="applications-page">
      <header className="applications-page-header">
        <span className="profile-eyebrow">Gestión de talento</span>
        <h2>Postulaciones</h2>
        <p>
          Revisa las solicitudes de estudiantes y define su estatus: pendiente,
          aceptada o rechazada.
        </p>
      </header>

      <div className="tabs">
        <button
          type="button"
          className={activeTab === "todas" ? "active" : ""}
          onClick={() => setActiveTab("todas")}
        >
          Todas ({applications.length})
        </button>
        <button
          type="button"
          className={activeTab === "pendiente" ? "active" : ""}
          onClick={() => setActiveTab("pendiente")}
        >
          Pendientes
        </button>
        <button
          type="button"
          className={activeTab === "aceptada" ? "active" : ""}
          onClick={() => setActiveTab("aceptada")}
        >
          Aceptadas
        </button>
        <button
          type="button"
          className={activeTab === "rechazada" ? "active" : ""}
          onClick={() => setActiveTab("rechazada")}
        >
          Rechazadas
        </button>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="applications-empty">
          <p>No hay postulaciones en esta categoría.</p>
        </div>
      ) : (
        <div className="applications-list">
          {filteredApplications.map((application) => (
            <article className="application-card" key={application._id}>
              <div className="application-card-header">
                <div className="profile-avatar application-card-avatar">
                  <AvatarPlaceholder name={application.student?.name} />
                </div>
                <div>
                  <h3>{application.student?.name}</h3>
                  <p>{application.student?.email}</p>
                  <p className="application-card-job">
                    Vacante: <strong>{application.job?.title}</strong>
                  </p>
                </div>
                <span
                  className={`status-badge status-badge--${application.status}`}
                >
                  {formatApplicationStatus(application.status)}
                </span>
              </div>

              <div className="application-card-message">
                <strong>Mensaje del estudiante</strong>
                <p>{application.message}</p>
              </div>

              <div className="application-status-actions">
                <span className="application-status-label">
                  Cambiar estatus:
                </span>
                <button
                  type="button"
                  className={
                    application.status === "pendiente"
                      ? "status-action-btn active"
                      : "status-action-btn"
                  }
                  onClick={() =>
                    handleUpdateStatus(application._id, "pendiente")
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
                    handleUpdateStatus(application._id, "aceptada")
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
                    handleUpdateStatus(application._id, "rechazada")
                  }
                >
                  Rechazada
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

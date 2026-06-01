import { useEffect, useState } from "react";
import type { CurrentUser } from "../App";
import { getJobsByClient } from "../api/myJobApi";
import {
  getApplicationsByJob,
  updateApplicationStatus,
} from "../api/receivedApplicationsApi";
import { useAuth0 } from "@auth0/auth0-react";

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
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedStudent, setSelectedStudent] =
    useState<Application | null>(null);

  const [activeTab, setActiveTab] = useState("pendiente");
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

  const filteredApplications = applications.filter(
    (application) => application.status === activeTab
  );

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
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Error al actualizar postulación"
      );
    }
  };

  if (isLoading) {
    return <p>Cargando postulaciones...</p>;
  }

  if (selectedStudent) {
    return (
      <div>
        <button
          className="back-button"
          onClick={() => setSelectedStudent(null)}
        >
          ← Volver a postulaciones
        </button>

        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">👩‍💻</div>

            <div>
              <h3>{selectedStudent.student?.name}</h3>
              <p>{selectedStudent.student?.email}</p>

              <p>
                <strong>Calificación:</strong> 4.5 / 5
              </p>
            </div>
          </div>

          <div className="profile-section">
            <strong>Trabajo</strong>
            <p>{selectedStudent.job?.title}</p>
          </div>

          <div className="profile-section">
            <strong>Mensaje de postulación</strong>
            <p>{selectedStudent.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Postulaciones</h2>

      <div className="tabs">
        <button
          className={activeTab === "pendiente" ? "active" : ""}
          onClick={() => setActiveTab("pendiente")}
        >
          Pendientes
        </button>

        <button
          className={activeTab === "aceptada" ? "active" : ""}
          onClick={() => setActiveTab("aceptada")}
        >
          Aceptadas
        </button>

        <button
          className={activeTab === "rechazada" ? "active" : ""}
          onClick={() => setActiveTab("rechazada")}
        >
          Rechazadas
        </button>
      </div>

      <div className="cards-grid">
        {filteredApplications.map((application) => (
          <article className="job-card" key={application._id}>
            <h3>{application.student?.name}</h3>

            <p>
              <strong>Trabajo:</strong> {application.job?.title}
            </p>

            <p>
              <strong>Mensaje:</strong> {application.message}
            </p>

            <span className={`status-badge ${application.status}`}>
              {application.status}
            </span>

            <div className="card-actions">
              <button onClick={() => setSelectedStudent(application)}>
                Ver perfil
              </button>

              {application.status === "pendiente" && (
                <>
                  <button
                    onClick={() =>
                      handleUpdateStatus(application._id, "aceptada")
                    }
                  >
                    Aceptar
                  </button>

                  <button
                    onClick={() =>
                      handleUpdateStatus(application._id, "rechazada")
                    }
                  >
                    Rechazar
                  </button>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { getAllApplications } from "../api/adminApi";
import { useAuth0 } from "@auth0/auth0-react";

type Application = {
  _id: string;
  status: string;
  message: string;
  student: {
    name: string;
    email: string;
  };
  job: {
    title: string;
    client: {
      name: string;
      email: string;
    };
  };
};

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
  const loadApplications = async () => {
    try {
      const token = await getAccessTokenSilently();
      const data = await getAllApplications(token);

      setApplications(data);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  loadApplications();
}, [getAccessTokenSilently]);

  if (isLoading) {
    return <p>Cargando postulaciones...</p>;
  }

  return (
    <div>
      <h2>Postulaciones del sistema</h2>

      <div className="cards-grid">
        {applications.map((application) => (
          <article className="job-card" key={application._id}>
            <h3>{application.job?.title}</h3>

            <p>
              <strong>Estudiante:</strong> {application.student?.name}
            </p>

            <p>
              <strong>Correo estudiante:</strong> {application.student?.email}
            </p>

            <p>
              <strong>Cliente:</strong> {application.job?.client?.name}
            </p>

            <p>
              <strong>Correo cliente:</strong> {application.job?.client?.email}
            </p>

            <p>
              <strong>Mensaje:</strong> {application.message}
            </p>

            <span className={`status-badge ${application.status}`}>
              {application.status}
            </span>
          </article>
        ))}
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import AvatarPlaceholder from "../components/AvatarPlaceholder";
import type { CurrentUser } from "../App";
import { getProfileByUserId, updateProfile } from "../api/profileApi";
import { getJobsByClient } from "../api/myJobApi";
import { formatRoleLabel } from "../utils/formatLabels";
import { useToast } from "../components/Toast";

type Props = {
  currentUser: CurrentUser | null;
};

type Profile = {
  description: string;
  skills: string[];
  career: string;
  semester: number;
  averageRating: number;
  companyName?: string;
  rfc?: string;
  user: {
    name: string;
    email: string;
    role: string;
    status: string;
  };
  imageUrl: string;
};

type CompanyJob = {
  _id: string;
  title: string;
  status: string;
  modality?: string;
  compensation?: string;
};

export default function ProfilePage({ currentUser }: Props) {
  const isCompany = currentUser?.role === "cliente";
  const [profile, setProfile] = useState<Profile | null>(null);
  const [companyJobs, setCompanyJobs] = useState<CompanyJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [career, setCareer] = useState("");
  const [semester, setSemester] = useState(1);
  const [companyName, setCompanyName] = useState("");
  const [rfc, setRfc] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { getAccessTokenSilently } = useAuth0();
  const { showToast } = useToast();

  useEffect(() => {
    if (!currentUser?._id) return;

    const loadProfile = async () => {
      try {
        const token = await getAccessTokenSilently();
        const data = await getProfileByUserId(currentUser._id, token);

        setProfile(data);
        setDescription(data.description || "");
        setSkills(data.skills?.join(", ") || "");
        setCareer(data.career || "");
        setSemester(data.semester || 1);
        setCompanyName(data.companyName || currentUser.name || "");
        setRfc(data.rfc || "");

        if (isCompany) {
          const jobs = await getJobsByClient(currentUser._id, token);
          setCompanyJobs(jobs);
        }

        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [currentUser, getAccessTokenSilently, isCompany]);

  const handleUpdateProfile = async () => {
    if (!currentUser?._id) return;

    try {
      const token = await getAccessTokenSilently();

      const payload = isCompany
        ? {
            description,
            skills: [] as string[],
            career: "",
            semester: 0,
            companyName,
            rfc,
            imageFile,
          }
        : {
            description,
            skills: skills.split(",").map((skill) => skill.trim()),
            career,
            semester,
            imageFile,
          };

      const updatedProfile = await updateProfile(
        currentUser._id,
        payload,
        token
      );

      setProfile(updatedProfile);
      setIsEditing(false);
      showToast("Perfil actualizado correctamente", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Error al actualizar perfil",
        "error"
      );
    }
  };

  if (isLoading) {
    return <p className="profile-loading">Cargando perfil...</p>;
  }

  if (!profile) {
    return <p className="profile-loading">No se encontró el perfil.</p>;
  }

  if (isEditing && isCompany) {
    return (
      <div className="profile-page">
        <button className="back-button" onClick={() => setIsEditing(false)}>
          Volver a mi perfil
        </button>

        <header className="profile-page-header">
          <div>
            <span className="profile-eyebrow">Edición</span>
            <h2>Datos de la empresa</h2>
            <p>Actualiza la información visible en tus vacantes.</p>
          </div>
        </header>

        <div className="profile-form-card">
          <div className="publish-job-grid">
            <div className="publish-job-field publish-job-field--full">
              <label className="form-label">Logo o imagen</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setImageFile(e.target.files[0]);
                  }
                }}
              />
            </div>

            <div className="publish-job-field publish-job-field--full">
              <label className="form-label">Nombre de la empresa</label>
              <input
                className="form-input"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div className="publish-job-field">
              <label className="form-label">RFC (opcional)</label>
              <input
                className="form-input"
                value={rfc}
                onChange={(e) => setRfc(e.target.value)}
              />
            </div>

            <div className="publish-job-field publish-job-field--full">
              <label className="form-label">Descripción de la empresa</label>
              <textarea
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Sector, servicios que ofrece y qué buscan en estudiantes..."
              />
            </div>
          </div>

          <div className="publish-job-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setIsEditing(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={handleUpdateProfile}
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="profile-page">
        <button className="back-button" onClick={() => setIsEditing(false)}>
          Volver a mi perfil
        </button>

        <header className="profile-page-header">
          <div>
            <span className="profile-eyebrow">Edición</span>
            <h2>Actualizar perfil</h2>
            <p>Modifica la información visible para empresas y postulaciones.</p>
          </div>
        </header>

        <div className="profile-form-card">
          <div className="publish-job-grid">
            <div className="publish-job-field publish-job-field--full">
              <label className="form-label">Foto de perfil</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setImageFile(e.target.files[0]);
                  }
                }}
              />
            </div>

            <div className="publish-job-field">
              <label className="form-label">Carrera</label>
              <input
                className="form-input"
                value={career}
                onChange={(e) => setCareer(e.target.value)}
              />
            </div>

            <div className="publish-job-field">
              <label className="form-label">Semestre</label>
              <input
                className="form-input"
                type="number"
                min={1}
                max={12}
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
              />
            </div>

            <div className="publish-job-field publish-job-field--full">
              <label className="form-label">Descripción profesional</label>
              <textarea
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Experiencia, intereses y objetivos académicos..."
              />
            </div>

            <div className="publish-job-field publish-job-field--full">
              <label className="form-label">Habilidades (separadas por coma)</label>
              <input
                className="form-input"
                placeholder="React, Node.js, MongoDB"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>
          </div>

          <div className="publish-job-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setIsEditing(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={handleUpdateProfile}
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isCompany) {
    const displayName =
      profile.companyName?.trim() || profile.user?.name || "Empresa";

    return (
      <div className="profile-page">
        <header className="profile-hero-card">
          <div className="profile-hero-main">
            <div className="profile-avatar profile-avatar--lg">
              <AvatarPlaceholder
                name={displayName}
                imageUrl={profile.imageUrl}
                alt="Logo de empresa"
                className="profile-avatar-image"
              />
            </div>

            <div className="profile-hero-text">
              <span className="profile-eyebrow">Perfil de empresa</span>
              <h2>{displayName}</h2>
              <p className="profile-hero-subtitle">{profile.user?.email}</p>
              <div className="profile-hero-badges">
                <span className="profile-role-chip">
                  {formatRoleLabel(profile.user?.role)}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="primary-button profile-edit-btn"
            onClick={() => setIsEditing(true)}
          >
            Editar empresa
          </button>
        </header>

        <div className="profile-stat-grid profile-stat-grid--company">
          <article className="profile-stat-card">
            <span className="profile-stat-label">Correo de contacto</span>
            <strong>{profile.user?.email}</strong>
          </article>
          <article className="profile-stat-card">
            <span className="profile-stat-label">RFC</span>
            <strong>{profile.rfc?.trim() || "No registrado"}</strong>
          </article>
          <article className="profile-stat-card">
            <span className="profile-stat-label">Vacantes publicadas</span>
            <strong>{companyJobs.length}</strong>
          </article>
        </div>

        <section className="profile-detail-card profile-detail-card--full">
          <h3>Sobre la empresa</h3>
          <p>
            {profile.description?.trim()
              ? profile.description
              : "Agrega una descripción para que los estudiantes conozcan tu empresa."}
          </p>
        </section>

        <section className="profile-vacancies-section">
          <div className="section-header">
            <h3>Vacantes disponibles</h3>
            <span className="profile-vacancies-count">
              {companyJobs.length} publicada{companyJobs.length === 1 ? "" : "s"}
            </span>
          </div>

          {companyJobs.length === 0 ? (
            <p className="profile-empty-hint">
              Aún no tienes vacantes. Ve a Mis trabajos para publicar una.
            </p>
          ) : (
            <div className="profile-vacancies-list">
              {companyJobs.map((job) => (
                <article className="profile-vacancy-card" key={job._id}>
                  <div>
                    <h4>{job.title}</h4>
                    <p>
                      {job.modality || "—"}
                      {job.compensation ? ` · ${job.compensation}` : ""}
                    </p>
                  </div>
                  <span className={`status-badge status-badge--${job.status}`}>
                    {job.status === "activo"
                      ? "Activa"
                      : job.status === "finalizado"
                        ? "Finalizada"
                        : job.status}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  const ratingLabel =
    profile.averageRating > 0
      ? `${profile.averageRating} / 5`
      : "Sin calificaciones aún";

  return (
    <div className="profile-page">
      <header className="profile-hero-card">
        <div className="profile-hero-main">
          <div className="profile-avatar profile-avatar--lg">
            <AvatarPlaceholder
              name={profile.user?.name}
              imageUrl={profile.imageUrl}
              alt="Foto de perfil"
              className="profile-avatar-image"
            />
          </div>

          <div className="profile-hero-text">
            <span className="profile-eyebrow">Perfil académico</span>
            <h2>{profile.user?.name}</h2>
            <p className="profile-hero-subtitle">
              {profile.career || "Ingeniería en Sistemas Computacionales"}
            </p>
            <div className="profile-hero-badges">
              <span className="status-badge status-badge--activo">Activo</span>
              <span className="profile-role-chip">
                {formatRoleLabel(profile.user?.role)}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="primary-button profile-edit-btn"
          onClick={() => setIsEditing(true)}
        >
          Editar perfil
        </button>
      </header>

      <div className="profile-stat-grid">
        <article className="profile-stat-card">
          <span className="profile-stat-label">Correo institucional</span>
          <strong>{profile.user?.email}</strong>
        </article>
        <article className="profile-stat-card">
          <span className="profile-stat-label">Semestre actual</span>
          <strong>{profile.semester || "—"}</strong>
        </article>
        <article className="profile-stat-card">
          <span className="profile-stat-label">Calificación promedio</span>
          <strong>{ratingLabel}</strong>
        </article>
      </div>

      <div className="profile-details-grid">
        <section className="profile-detail-card">
          <h3>Descripción profesional</h3>
          <p>
            {profile.description?.trim()
              ? profile.description
              : "Aún no has agregado una descripción."}
          </p>
        </section>

        <section className="profile-detail-card">
          <h3>Habilidades técnicas</h3>
          {profile.skills.length > 0 ? (
            <div className="skills-list">
              {profile.skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          ) : (
            <p className="profile-empty-hint">
              Agrega habilidades para destacar en las postulaciones.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import type { CurrentUser } from "../App";
import { getJobs } from "../api/jobApi";
import { getPublicJobs } from "../api/publicJobApi";
import { createApplication } from "../api/applicationApi";
import { useAuth0 } from "@auth0/auth0-react";
import {
  formatCategory,
  formatModality,
  formatPostedDate,
} from "../utils/jobLabels";
import { formatRating } from "../utils/formatLabels";
import AvatarPlaceholder from "./AvatarPlaceholder";
import { useToast } from "./Toast";

export const PENDING_APPLY_KEY = "pendingApplyJobId";

type LoadJobsOptions = {
  q?: string;
  location?: string;
  category?: string;
  modality?: string;
  useSidebarFilters?: boolean;
};

type Props = {
  currentUser?: CurrentUser | null;
  pendingApplyJobId?: string | null;
  onPendingApplyHandled?: () => void;
  onRequireLogin?: () => void;
  hideTopSearch?: boolean;
  initialSearchQuery?: string;
  initialLocation?: string;
  searchNonce?: number;
};

type ClientProfile = {
  companyName?: string;
  description?: string;
  averageRating?: number;
  imageUrl?: string;
};

export type JobListing = {
  _id: string;
  title: string;
  description: string;
  category: string;
  modality: string;
  estimatedDuration: string;
  location?: string;
  city?: string;
  compensation?: string;
  skillsRequired?: string[];
  vacancies?: number;
  createdAt?: string;
  client: {
    _id: string;
    name: string;
    email?: string;
  };
  clientProfile?: ClientProfile | null;
};

const CATEGORIES = [
  { value: "", label: "Todas las categorías" },
  { value: "desarrollo web", label: "Desarrollo web" },
  { value: "soporte tecnico", label: "Soporte técnico" },
  { value: "base de datos", label: "Base de datos" },
  { value: "diseño de interfaces", label: "Diseño de interfaces" },
  { value: "otro", label: "Otro" },
];

const MODALITIES = [
  { value: "", label: "Cualquier modalidad" },
  { value: "remoto", label: "Remoto" },
  { value: "presencial", label: "Presencial" },
  { value: "hibrido", label: "Híbrido" },
];

const DURATIONS = [
  { value: "", label: "Cualquier duración" },
  { value: "semana", label: "Menos de 1 semana" },
  { value: "mes", label: "1 a 4 semanas" },
  { value: "largo", label: "Más de 1 mes" },
];

function getCompanyName(job: JobListing) {
  return job.clientProfile?.companyName || job.client?.name || "Empresa";
}

function matchesDuration(job: JobListing, durationFilter: string) {
  if (!durationFilter) return true;

  const text = job.estimatedDuration.toLowerCase();

  if (durationFilter === "semana") {
    return (
      text.includes("día") ||
      text.includes("dia") ||
      text.includes("semana")
    );
  }

  if (durationFilter === "mes") {
    return text.includes("semana") || text.includes("mes");
  }

  return (
    text.includes("mes") ||
    text.includes("meses") ||
    text.includes("largo") ||
    text.includes("semestre")
  );
}

export default function JobBoard({
  currentUser = null,
  pendingApplyJobId = null,
  onPendingApplyHandled,
  onRequireLogin,
  hideTopSearch = false,
  initialSearchQuery = "",
  initialLocation = "Zacatecas",
  searchNonce = 0,
}: Props) {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applyingJob, setApplyingJob] = useState<JobListing | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [locationQuery, setLocationQuery] = useState(initialLocation);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [modalityFilter, setModalityFilter] = useState("");
  const [durationFilter, setDurationFilter] = useState("");
  const [sortBy, setSortBy] = useState("recientes");
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const { showToast } = useToast();

  const loadJobs = useCallback(async (options?: LoadJobsOptions) => {
    setIsLoading(true);

    const useSidebar = options?.useSidebarFilters ?? true;
    const qValue = options?.q ?? searchQuery;
    const locationValue = options?.location ?? locationQuery;
    const q = qValue.trim() || undefined;
    const location = locationValue.trim() || undefined;
    const category =
      options?.category !== undefined
        ? options.category || undefined
        : useSidebar && categoryFilter
          ? categoryFilter
          : undefined;
    const modality =
      options?.modality !== undefined
        ? options.modality || undefined
        : useSidebar && modalityFilter
          ? modalityFilter
          : undefined;

    const searchParams = {
      q,
      category,
      modality,
      location,
    };

    try {
      let data: JobListing[];

      if (isAuthenticated && currentUser) {
        const token = await getAccessTokenSilently();
        data = await getJobs(token, { board: "true", ...searchParams });
      } else {
        data = await getPublicJobs(searchParams);
      }

      let results = data.filter((job) =>
        matchesDuration(
          job,
          options?.useSidebarFilters === false ? "" : durationFilter
        )
      );

      if (sortBy === "titulo") {
        results = [...results].sort((a, b) => a.title.localeCompare(b.title));
      }

      setJobs(results);

      setSelectedJobId((currentId) => {
        if (results.length === 0) return null;
        if (currentId && results.some((job) => job._id === currentId)) {
          return currentId;
        }
        return results[0]._id;
      });
    } catch (error) {
      console.log(error);
      setJobs([]);
      setSelectedJobId(null);
    } finally {
      setIsLoading(false);
    }
  }, [
    isAuthenticated,
    currentUser,
    getAccessTokenSilently,
    searchQuery,
    locationQuery,
    categoryFilter,
    modalityFilter,
    durationFilter,
    sortBy,
  ]);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (searchNonce === 0) return;

    setSearchQuery(initialSearchQuery);
    setLocationQuery(initialLocation);
    loadJobs({
      q: initialSearchQuery,
      location: initialLocation,
      useSidebarFilters: false,
    });
  }, [searchNonce, initialSearchQuery, initialLocation, loadJobs]);

  const selectedJob = jobs.find((job) => job._id === selectedJobId) || null;

  const handleSearch = (event?: React.FormEvent) => {
    event?.preventDefault();
    loadJobs({ useSidebarFilters: false });
  };

  const handleApplyClick = useCallback(
    (job: JobListing) => {
      if (!isAuthenticated || !currentUser) {
        sessionStorage.setItem(PENDING_APPLY_KEY, job._id);
        onRequireLogin?.();
        return;
      }

      if (currentUser.role !== "estudiante") {
        showToast("Solo los estudiantes pueden postularse a las vacantes.", "error");
        return;
      }

      if (currentUser.status !== "activo") {
        showToast(
          "Tu cuenta no está activa. Revisa el estado de tu perfil antes de postularte.",
          "error"
        );
        return;
      }

      setApplyingJob(job);
    },
    [isAuthenticated, currentUser, onRequireLogin, showToast]
  );

  useEffect(() => {
    if (!pendingApplyJobId || jobs.length === 0) return;

    const job = jobs.find((item) => item._id === pendingApplyJobId);

    if (job && currentUser?.role === "estudiante" && currentUser.status === "activo") {
      setApplyingJob(job);
      onPendingApplyHandled?.();
    }
  }, [pendingApplyJobId, jobs, currentUser, onPendingApplyHandled]);

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

      showToast("Postulación enviada correctamente", "success");
      setMessage("");
      setApplyingJob(null);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Error al postularse",
        "error"
      );
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setLocationQuery("Zacatecas");
    setCategoryFilter("");
    setModalityFilter("");
    setDurationFilter("");
    setSortBy("recientes");
    loadJobs({
      q: "",
      location: "Zacatecas",
      category: "",
      modality: "",
      useSidebarFilters: true,
    });
  };

  const applyButtonLabel = !isAuthenticated
    ? "Inicia sesión para postularte"
    : currentUser?.role !== "estudiante"
      ? "Solo para estudiantes"
      : "Postularme ahora";

  if (applyingJob) {
    return (
      <div className="jobs-board">
        <button className="back-button" onClick={() => setApplyingJob(null)}>
          ← Volver a resultados
        </button>

        <div className="detail-card">
          <h2>Postularme a: {applyingJob.title}</h2>
          <p className="jobs-company-line">
            <strong>{getCompanyName(applyingJob)}</strong> ·{" "}
            {applyingJob.location || "Zacatecas, Zac."}
          </p>

          <label className="form-label">Mensaje de presentación</label>
          <textarea
            className="form-textarea"
            placeholder="Cuéntale al empleador por qué eres buen candidato..."
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

  return (
    <div className="jobs-board">
      {!hideTopSearch && (
      <section className="jobs-search-hero jobs-search-hero--light">
        <form className="jobs-search-form jobs-search-form--indeed" onSubmit={handleSearch}>
          <div className="jobs-search-field">
            <input
              className="form-input"
              placeholder="Cargo o empresa"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="jobs-search-field">
            <input
              className="form-input"
              placeholder="Ciudad o estado"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
            />
          </div>

          <button type="submit" className="jobs-search-btn">
            Buscar empleos
          </button>
        </form>

        <div className="jobs-filter-pills">
          <button
            type="button"
            className={modalityFilter === "remoto" ? "active" : ""}
            onClick={() => {
              const next = modalityFilter === "remoto" ? "" : "remoto";
              setModalityFilter(next);
              loadJobs({
                modality: next,
                useSidebarFilters: true,
              });
            }}
          >
            Remoto
          </button>
          <button
            type="button"
            className={modalityFilter === "presencial" ? "active" : ""}
            onClick={() => {
              const next = modalityFilter === "presencial" ? "" : "presencial";
              setModalityFilter(next);
              loadJobs({
                modality: next,
                useSidebarFilters: true,
              });
            }}
          >
            Presencial
          </button>
          <button
            type="button"
            className={categoryFilter === "desarrollo web" ? "active" : ""}
            onClick={() => {
              const next =
                categoryFilter === "desarrollo web" ? "" : "desarrollo web";
              setCategoryFilter(next);
              loadJobs({
                category: next,
                useSidebarFilters: true,
              });
            }}
          >
            Desarrollo web
          </button>
          <button
            type="button"
            onClick={() => loadJobs({ useSidebarFilters: false })}
          >
            Actualizar
          </button>
        </div>
      </section>
      )}

      <div className="jobs-layout">
        <aside className="jobs-filters">
          <div className="jobs-filters-header">
            <h3>Filtros</h3>
            <button type="button" className="jobs-link-btn" onClick={clearFilters}>
              Limpiar
            </button>
          </div>

          <label className="form-label">Categoría</label>
          <select
            className="form-input"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <label className="form-label">Modalidad</label>
          <select
            className="form-input"
            value={modalityFilter}
            onChange={(e) => setModalityFilter(e.target.value)}
          >
            {MODALITIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <label className="form-label">Duración</label>
          <select
            className="form-input"
            value={durationFilter}
            onChange={(e) => setDurationFilter(e.target.value)}
          >
            {DURATIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <label className="form-label">Ordenar</label>
          <select
            className="form-input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recientes">Más recientes</option>
            <option value="titulo">Título (A-Z)</option>
          </select>

          <button
            type="button"
            className="primary-button jobs-apply-filters"
            onClick={() => loadJobs({ useSidebarFilters: true })}
          >
            Aplicar
          </button>
        </aside>

        <div className="jobs-results">
          <div className="jobs-results-header">
            <p>
              <strong>{jobs.length}</strong> empleos
              {locationQuery ? ` en ${locationQuery}` : ""}
            </p>
            {!isAuthenticated && (
              <p className="jobs-visitor-hint">
                Estás navegando como visitante. Inicia sesión para postularte.
              </p>
            )}
          </div>

          {isLoading ? (
            <p className="jobs-empty">Cargando vacantes...</p>
          ) : jobs.length === 0 ? (
            <div className="jobs-empty-card">
              <h3>No hay empleos con esos filtros</h3>
              <button className="secondary-button" onClick={clearFilters}>
                Ver todos
              </button>
            </div>
          ) : (
            <div className="jobs-split">
              <div className="jobs-list-panel">
                {jobs.map((job) => (
                  <article
                    key={job._id}
                    className={`jobs-list-item ${
                      selectedJobId === job._id ? "active" : ""
                    }`}
                    onClick={() => setSelectedJobId(job._id)}
                  >
                    <div className="jobs-list-item-top">
                      <h3>{job.title}</h3>
                      {job.compensation && (
                        <span className="jobs-salary">{job.compensation}</span>
                      )}
                    </div>
                    <p className="jobs-company-line">{getCompanyName(job)}</p>
                    <div className="jobs-list-meta">
                      <span>{job.location || "Zacatecas, Zac."}</span>
                      <span>{formatModality(job.modality)}</span>
                    </div>
                    <p className="jobs-list-snippet">
                      {job.description.slice(0, 100)}...
                    </p>
                    <div className="jobs-list-footer">
                      <span>{formatPostedDate(job.createdAt)}</span>
                    </div>
                  </article>
                ))}
              </div>

              {selectedJob && (
                <div className="jobs-detail-panel">
                  <header className="jobs-detail-header">
                    <div>
                      <h2>{selectedJob.title}</h2>
                      <p className="jobs-company-line">
                        <strong>{getCompanyName(selectedJob)}</strong>
                      </p>
                      <div className="jobs-detail-meta">
                        <span>{selectedJob.location || "Zacatecas, Zac."}</span>
                        <span>{formatModality(selectedJob.modality)}</span>
                        <span>{formatCategory(selectedJob.category)}</span>
                        <span>Duración: {selectedJob.estimatedDuration}</span>
                      </div>
                    </div>
                    <div className="jobs-detail-actions">
                      {selectedJob.compensation && (
                        <p className="jobs-salary-large">
                          {selectedJob.compensation}
                        </p>
                      )}
                      <button
                        className="primary-button jobs-apply-main"
                        onClick={() => handleApplyClick(selectedJob)}
                      >
                        {applyButtonLabel}
                      </button>
                      {!isAuthenticated && (
                        <p className="jobs-login-note">
                          Necesitas una cuenta de estudiante ITZ para postularte.
                        </p>
                      )}
                    </div>
                  </header>

                  <section className="jobs-detail-section">
                    <h4>Información del empleo</h4>
                    <p className="jobs-detail-description">
                      {selectedJob.description}
                    </p>
                  </section>

                  <section className="jobs-detail-section jobs-company-card">
                    <h4>Acerca de la empresa</h4>
                    <div className="jobs-company-profile">
                      <div className="jobs-company-avatar">
                        <AvatarPlaceholder
                          name={getCompanyName(selectedJob)}
                          imageUrl={selectedJob.clientProfile?.imageUrl}
                          alt={getCompanyName(selectedJob)}
                        />
                      </div>
                      <div>
                        <h5>{getCompanyName(selectedJob)}</h5>
                        {selectedJob.clientProfile?.averageRating ? (
                          <p>
                            Calificación:{" "}
                            {formatRating(selectedJob.clientProfile.averageRating)}
                          </p>
                        ) : null}
                        {selectedJob.clientProfile?.description && (
                          <p className="jobs-company-about">
                            {selectedJob.clientProfile.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </section>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

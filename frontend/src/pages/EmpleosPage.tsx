import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { CurrentUser } from "../App";
import JobBoard from "../components/JobBoard";

type Props = {
  currentUser?: CurrentUser | null;
  pendingApplyJobId?: string | null;
  onPendingApplyHandled?: () => void;
  onRequireLogin?: () => void;
};

export default function EmpleosPage({
  currentUser,
  pendingApplyJobId,
  onPendingApplyHandled,
  onRequireLogin,
}: Props) {
  const [searchParams] = useSearchParams();

  const initialSearchQuery = searchParams.get("q") || "";
  const initialLocation = searchParams.get("location") || "Zacatecas";

  const searchNonce = useMemo(() => {
    return initialSearchQuery || initialLocation ? 1 : 0;
  }, [initialSearchQuery, initialLocation]);

  return (
    <div className="empleos-page">
      <div className="empleos-page-header">
        <Link to="/" className="back-button">
          ← Volver al inicio
        </Link>

        <span className="landing-eyebrow">Bolsa de empleo</span>
        <h1>Empleos disponibles</h1>
        <p>Resultados en tiempo real según tu búsqueda y filtros.</p>
      </div>

      <JobBoard
        currentUser={currentUser}
        pendingApplyJobId={pendingApplyJobId}
        onPendingApplyHandled={onPendingApplyHandled}
        onRequireLogin={onRequireLogin}
        initialSearchQuery={initialSearchQuery}
        initialLocation={initialLocation}
        searchNonce={searchNonce}
      />
    </div>
  );
}

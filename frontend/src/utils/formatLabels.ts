export function formatRoleLabel(role?: string) {
  if (role === "estudiante") return "Estudiante";
  if (role === "cliente") return "Empresa";
  if (role === "administrador") return "Administrador";
  return role || "";
}

export function formatApplicationStatus(status?: string) {
  if (status === "pendiente") return "Pendiente";
  if (status === "aceptada") return "Aceptada";
  if (status === "rechazada") return "Rechazada";
  return status || "";
}

export function formatAccountStatus(status?: string) {
  if (status === "activo") return "Activo";
  if (status === "suspendido") return "Suspendido";
  if (status === "rechazado") return "Rechazado";
  return status || "";
}

export function formatRating(rating?: number | null) {
  if (rating == null || rating <= 0) return null;
  return `${Number(rating.toFixed(1))}/5`;
}

export function getApplicationFeedback(status?: string) {
  if (status === "aceptada") {
    return "Haz sido aceptad@, favor de dirigirte a la ubicación registrada para más información.";
  }

  if (status === "rechazada") {
    return "Lo siento mucho, vendrán mejores oportunidades para ti.";
  }

  return null;
}

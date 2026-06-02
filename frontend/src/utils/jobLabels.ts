export const CATEGORY_LABELS: Record<string, string> = {
  "desarrollo web": "Desarrollo web",
  "soporte tecnico": "Soporte técnico",
  "base de datos": "Base de datos",
  "diseño de interfaces": "Diseño de interfaces",
  otro: "Otro",
};

export const MODALITY_LABELS: Record<string, string> = {
  presencial: "Presencial",
  remoto: "Remoto",
  hibrido: "Híbrido",
};

export const formatCategory = (value: string) =>
  CATEGORY_LABELS[value] || value;

export const formatModality = (value: string) =>
  MODALITY_LABELS[value] || value;

export const formatPostedDate = (dateString?: string) => {
  if (!dateString) return "Reciente";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Hoy";
  if (diffDays === 1) return "Hace 1 día";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem.`;

  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

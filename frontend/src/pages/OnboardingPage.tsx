import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import type { CurrentUser } from "../App";
import { updateUserRole } from "../api/userApi";
import { updateProfile } from "../api/profileApi";
import { REGISTER_INTENT_KEY } from "../components/LoginButton";

type Props = {
  currentUser: CurrentUser;
  onFinish: (updatedUser: CurrentUser) => void;
};

export default function OnboardingPage({ currentUser, onFinish }: Props) {
  const initialRole =
    sessionStorage.getItem(REGISTER_INTENT_KEY) === "cliente"
      ? "cliente"
      : "estudiante";

  const [role, setRole] = useState<"estudiante" | "cliente">(initialRole);
  const [career, setCareer] = useState(
    "Ingeniería en Sistemas Computacionales"
  );
  const [semester, setSemester] = useState(1);
  const [controlNumber, setControlNumber] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [rfc, setRfc] = useState("");
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const { getAccessTokenSilently } = useAuth0();

  const handleSave = async () => {
    try {
      const token = await getAccessTokenSilently();

      if (role === "cliente" && !verificationFile) {
        alert("Debes adjuntar un documento oficial de verificación");
        return;
      }

      const updatedUser = await updateUserRole(
        currentUser._id,
        role,
        token,
        role === "estudiante" ? controlNumber : undefined
      );

      await updateProfile(
        currentUser._id,
        {
          career: role === "estudiante" ? career : "",
          semester: role === "estudiante" ? semester : 0,
          description,
          skills:
            role === "estudiante"
              ? skills.split(",").map((skill) => skill.trim())
              : [],
          companyName: role === "cliente" ? companyName : "",
          rfc: role === "cliente" ? rfc : "",
          verificationFile: role === "cliente" ? verificationFile : null,
        },
        token
      );

      onFinish(updatedUser);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Error al configurar cuenta"
      );
    }
  };

  return (
    <div className="home-page">
      <div className="home-card onboarding-card">
        <div className="logo home-logo">½</div>

        <h1>Configura tu cuenta</h1>

        <label className="form-label">Tipo de cuenta</label>
        <select
          className="form-input"
          value={role}
          onChange={(e) =>
            setRole(e.target.value as "estudiante" | "cliente")
          }
        >
          <option value="estudiante">Estudiante ITZ</option>
          <option value="cliente">Empresa / Cliente</option>
        </select>

        {role === "estudiante" && (
          <>
            <label className="form-label">Número de control ITZ</label>
            <input
              className="form-input"
              value={controlNumber}
              onChange={(e) => setControlNumber(e.target.value)}
              placeholder="22450165"
            />

            <label className="form-label">Carrera</label>
            <input
              className="form-input"
              value={career}
              onChange={(e) => setCareer(e.target.value)}
            />

            <label className="form-label">Semestre</label>
            <input
              className="form-input"
              type="number"
              min={1}
              max={12}
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
            />

            <label className="form-label">Habilidades</label>
            <input
              className="form-input"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, Node.js, MongoDB"
            />
          </>
        )}

        {role === "cliente" && (
          <>
            <label className="form-label">Nombre de empresa o negocio</label>
            <input
              className="form-input"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />

            <label className="form-label">RFC (opcional)</label>
            <input
              className="form-input"
              value={rfc}
              onChange={(e) => setRfc(e.target.value)}
            />

            <label className="form-label">
              Documento oficial de verificación
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setVerificationFile(e.target.files[0]);
                }
              }}
            />
          </>
        )}

        <label className="form-label">Descripción breve</label>
        <textarea
          className="form-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Cuéntanos brevemente sobre ti o tu empresa..."
        />

        <button className="primary-button form-submit" onClick={handleSave}>
          Guardar y continuar
        </button>
      </div>
    </div>
  );
}

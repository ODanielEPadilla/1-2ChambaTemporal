import { useState } from "react";
import type { CurrentUser } from "../App";
import { updateUserRole } from "../api/userApi";
import { updateProfile } from "../api/profileApi";

type Props = {
  currentUser: CurrentUser;
  onFinish: (updatedUser: CurrentUser) => void;
};

export default function OnboardingPage({ currentUser, onFinish }: Props) {
  const [role, setRole] = useState<"estudiante" | "cliente">("estudiante");

  const [career, setCareer] = useState("");
  const [semester, setSemester] = useState(1);
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");

  const handleSave = async () => {
    try {
      const updatedUser = await updateUserRole(currentUser._id, role);

      await updateProfile(currentUser._id, {
        career: role === "estudiante" ? career : "",
        semester: role === "estudiante" ? semester : 0,
        description,
        skills:
          role === "estudiante"
            ? skills.split(",").map((skill) => skill.trim())
            : [],
      });

      onFinish(updatedUser);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al configurar cuenta");
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
          <option value="estudiante">Estudiante</option>
          <option value="cliente">Empresa / Cliente</option>
        </select>

        {role === "estudiante" && (
          <>
            <label className="form-label">Carrera</label>
            <input
              className="form-input"
              value={career}
              onChange={(e) => setCareer(e.target.value)}
              placeholder="Ingeniería en Sistemas Computacionales"
            />

            <label className="form-label">Semestre</label>
            <input
              className="form-input"
              type="number"
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
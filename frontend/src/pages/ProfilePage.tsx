import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import type { CurrentUser } from "../App";
import { getProfileByUserId, updateProfile } from "../api/profileApi";

type Props = {
  currentUser: CurrentUser | null;
};

type Profile = {
  description: string;
  skills: string[];
  career: string;
  semester: number;
  averageRating: number;
  user: {
    name: string;
    email: string;
    role: string;
    status: string;
  };
  imageUrl: string;
};

export default function ProfilePage({ currentUser }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [career, setCareer] = useState("");
  const [semester, setSemester] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    if (!currentUser?._id) return;

    const loadProfile = async () => {
      try {
        const token = await getAccessTokenSilently();

        const data = await getProfileByUserId(
          currentUser._id,
          token
        );

        setProfile(data);
        setDescription(data.description || "");
        setSkills(data.skills?.join(", ") || "");
        setCareer(data.career || "");
        setSemester(data.semester || 1);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [currentUser]);

  const handleUpdateProfile = async () => {
    if (!currentUser?._id) return;

    try {
      const token = await getAccessTokenSilently();
      const updatedProfile = await updateProfile(
        currentUser._id,
        {
          description,
          skills: skills.split(",").map((skill) => skill.trim()),
          career,
          semester,
          imageFile,
        },
        token
      );

      setProfile(updatedProfile);
      setIsEditing(false);
      alert("Perfil actualizado correctamente");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al actualizar perfil");
    }
  };

  if (isLoading) {
    return <p>Cargando perfil...</p>;
  }

  if (!profile) {
    return <p>No se encontró el perfil.</p>;
  }

  if (isEditing) {
    return (
      <div>
        <button className="back-button" onClick={() => setIsEditing(false)}>
          ← Volver a mi perfil
        </button>

        <div className="detail-card">
          <h2>Editar perfil</h2>

          <label className="form-label">Foto de perfil</label>

          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setImageFile(e.target.files[0]);
              }
            }}
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
            value={semester}
            onChange={(e) => setSemester(Number(e.target.value))}
          />

          <label className="form-label">Descripción</label>
          <textarea
            className="form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label className="form-label">Habilidades separadas por coma</label>
          <input
            className="form-input"
            placeholder="React, Node.js, MongoDB"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />

          <button
            className="primary-button form-submit"
            onClick={handleUpdateProfile}
          >
            Guardar cambios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Mi perfil</h2>

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.imageUrl ? (
              <img
                src={profile.imageUrl}
                alt="Foto de perfil"
                className="profile-avatar-image"
              />
            ) : (
              "👩‍💻"
            )}
          </div>

          <div>
            <h3>{profile.user?.name}</h3>
            <p>{profile.career}</p>
            <span className="status-badge aceptada">
              {profile.user?.status}
            </span>
          </div>
        </div>

        <div className="profile-grid">
          <div>
            <strong>Correo</strong>
            <p>{profile.user?.email}</p>
          </div>

          <div>
            <strong>Rol</strong>
            <p>{profile.user?.role}</p>
          </div>

          <div>
            <strong>Semestre</strong>
            <p>{profile.semester}</p>
          </div>

          <div>
            <strong>Calificación</strong>
            <p>{profile.averageRating || 4.5} / 5</p>
          </div>
        </div>

        <div className="profile-section">
          <strong>Descripción</strong>
          <p>{profile.description}</p>
        </div>

        <div className="profile-section">
          <strong>Habilidades</strong>

          <div className="skills-list">
            {profile.skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </div>

        <button className="primary-button" onClick={() => setIsEditing(true)}>
          Editar perfil
        </button>
      </div>
    </div>
  );
}
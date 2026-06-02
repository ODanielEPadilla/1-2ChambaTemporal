import { useEffect, useState } from "react";
import { getAllRatings } from "../api/adminApi";
import { useAuth0 } from "@auth0/auth0-react";
import AvatarPlaceholder from "../components/AvatarPlaceholder";

type Rating = {
  _id: string;
  score: number;
  comment: string;
  job: {
    title: string;
  };
  reviewer: {
    name: string;
    email: string;
  };
  reviewed: {
    name: string;
    email: string;
  };
};

export default function AdminRatingsPage() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
  const loadRatings = async () => {
    try {
      const token = await getAccessTokenSilently();
      const data = await getAllRatings(token);

      setRatings(data);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  loadRatings();
}, [getAccessTokenSilently]);

  if (isLoading) {
    return <p>Cargando calificaciones...</p>;
  }

  return (
    <div>
      <h2>Calificaciones del sistema</h2>

      <div className="ratings-list">
        {ratings.map((rating) => (
          <article className="rating-card" key={rating._id}>
            <div className="rating-avatar">
              <AvatarPlaceholder name={rating.reviewer?.name} />
            </div>

            <div>
              <h3>{rating.score} / 5</h3>

              <p>
                <strong>Trabajo:</strong> {rating.job?.title}
              </p>

              <p>
                <strong>Calificó:</strong> {rating.reviewer?.name}
              </p>

              <p>
                <strong>Correo:</strong> {rating.reviewer?.email}
              </p>

              <p>
                <strong>Recibió:</strong> {rating.reviewed?.name}
              </p>

              <p>
                <strong>Correo:</strong> {rating.reviewed?.email}
              </p>

              <p>{rating.comment}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
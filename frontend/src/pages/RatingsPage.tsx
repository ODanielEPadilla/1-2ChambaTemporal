import { useEffect, useState } from "react";
import type { CurrentUser } from "../App";
import {
  getRatingsByUser,
  getRatingsGivenByUser,
} from "../api/ratingApi";
import { useAuth0 } from "@auth0/auth0-react";
import AvatarPlaceholder from "../components/AvatarPlaceholder";

type Props = {
  currentUser: CurrentUser | null;
};

type Rating = {
  _id: string;
  score: number;
  comment: string;
  reviewer: {
    name: string;
  };
  reviewed: {
    name: string;
  };
};

export default function RatingsPage({ currentUser }: Props) {
  const [activeTab, setActiveTab] = useState("received");
  const [receivedRatings, setReceivedRatings] = useState<Rating[]>([]);
  const [givenRatings, setGivenRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    if (!currentUser?._id) return;

    const loadRatings = async () => {
      try {
        const token = await getAccessTokenSilently();

        const [receivedData, givenData] = await Promise.all([
          getRatingsByUser(currentUser._id, token),
          getRatingsGivenByUser(currentUser._id, token),
        ]);

        setReceivedRatings(receivedData);
        setGivenRatings(givenData);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    };

    loadRatings();
  }, [currentUser, getAccessTokenSilently]);

  const ratings =
    activeTab === "received" ? receivedRatings : givenRatings;

  if (isLoading) {
    return <p>Cargando calificaciones...</p>;
  }

  return (
    <div>
      <h2>Calificaciones</h2>

      <div className="tabs">
        <button
          className={activeTab === "received" ? "active" : ""}
          onClick={() => setActiveTab("received")}
        >
          Comentarios recibidos
        </button>

        <button
          className={activeTab === "given" ? "active" : ""}
          onClick={() => setActiveTab("given")}
        >
          Calificaciones dadas
        </button>
      </div>

      <div className="ratings-list">
        {ratings.length === 0 && (
          <p>No hay calificaciones para mostrar.</p>
        )}

        {ratings.map((rating) => (
          <article className="rating-card" key={rating._id}>
            <div className="rating-avatar">
              <AvatarPlaceholder
                name={
                  activeTab === "received"
                    ? rating.reviewer?.name
                    : rating.reviewed?.name
                }
              />
            </div>

            <div>
              <h3>
                {activeTab === "received"
                  ? rating.reviewer?.name
                  : rating.reviewed?.name}
              </h3>

              <p className="rating-score">
                Calificación: {rating.score} / 5
              </p>

              <p>{rating.comment}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
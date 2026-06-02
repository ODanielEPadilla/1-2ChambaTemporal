import Rating from "../models/ratingModel.js";

export const calculateAverageRating = async (userId: string) => {
  const ratings = await Rating.find({ reviewed: userId });

  if (ratings.length === 0) {
    return 0;
  }

  const totalScore = ratings.reduce((sum, rating) => sum + rating.score, 0);

  return Number((totalScore / ratings.length).toFixed(1));
};

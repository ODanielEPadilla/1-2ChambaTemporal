import Profile from "../models/profileModel.js";

export const attachClientProfiles = async <T extends { client?: { _id?: { toString(): string } } }>(
  jobs: T[]
) => {
  const clientIds = [
    ...new Set(
      jobs
        .map((job) => job.client?._id?.toString())
        .filter((id): id is string => Boolean(id))
    ),
  ];

  if (clientIds.length === 0) {
    return jobs.map((job) => ({ ...job, clientProfile: null }));
  }

  const profiles = await Profile.find({ user: { $in: clientIds } });
  const profileMap = new Map(
    profiles.map((profile) => [profile.user.toString(), profile])
  );

  return jobs.map((job) => {
    const clientId = job.client?._id?.toString();
    const clientProfile = clientId ? profileMap.get(clientId) ?? null : null;

    return {
      ...job,
      clientProfile,
    };
  });
};

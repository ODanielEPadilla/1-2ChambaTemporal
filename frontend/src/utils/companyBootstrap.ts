import { updateUserRole } from "../api/userApi";
import { updateProfile } from "../api/profileApi";
import type { CurrentUser } from "../App";

export async function bootstrapCompanyAccount(
  currentUser: CurrentUser,
  token: string
): Promise<CurrentUser> {
  await updateProfile(
    currentUser._id,
    {
      companyName: currentUser.name,
      description: "",
      skills: [],
      career: "",
      semester: 0,
      rfc: "",
    },
    token
  );

  return updateUserRole(currentUser._id, "cliente", token);
}

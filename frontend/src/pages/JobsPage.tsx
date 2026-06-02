import type { CurrentUser } from "../App";
import JobBoard from "../components/JobBoard";

type Props = {
  currentUser: CurrentUser | null;
};

/** @deprecated Usar JobBoard dentro de VisitorLayout */
export default function JobsPage({ currentUser }: Props) {
  return <JobBoard currentUser={currentUser} />;
}

import { Routes, Route } from "react-router-dom";
import VisitorLayout from "./VisitorLayout";
import VisitorHomePage from "../pages/VisitorHomePage";
import EmpleosPage from "../pages/EmpleosPage";
import type { CurrentUser } from "../App";

type Props = {
  currentUser?: CurrentUser | null;
  pendingApplyJobId?: string | null;
  onPendingApplyHandled?: () => void;
  onRequireLogin?: () => void;
  onGoToDashboard?: () => void;
};

export default function VisitorPortal({
  currentUser,
  pendingApplyJobId,
  onPendingApplyHandled,
  onRequireLogin,
  onGoToDashboard,
}: Props) {
  const sharedProps = {
    currentUser,
    pendingApplyJobId,
    onPendingApplyHandled,
    onRequireLogin,
    onGoToDashboard,
  };

  return (
    <VisitorLayout currentUser={currentUser} onGoToDashboard={onGoToDashboard}>
      <Routes>
        <Route path="/" element={<VisitorHomePage {...sharedProps} />} />
        <Route path="/empleos" element={<EmpleosPage {...sharedProps} />} />
      </Routes>
    </VisitorLayout>
  );
}

import { useAuth0 } from "@auth0/auth0-react";

export const REGISTER_INTENT_KEY = "registerIntent";

type Props = {
  label?: string;
  intent?: "login" | "publish";
  className?: string;
  onAuthenticatedClick?: () => void;
};

export default function LoginButton({
  label = "Iniciar sesión",
  intent = "login",
  className = "primary-button",
  onAuthenticatedClick,
}: Props) {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  if (isAuthenticated && intent === "login") {
    return null;
  }

  const handleClick = () => {
    if (isAuthenticated) {
      onAuthenticatedClick?.();
      return;
    }

    if (intent === "publish") {
      sessionStorage.setItem(REGISTER_INTENT_KEY, "cliente");
    }

    loginWithRedirect({
      appState: {
        returnTo: window.location.pathname,
      },
    });
  };

  return (
    <button type="button" className={className} onClick={handleClick}>
      {label}
    </button>
  );
}

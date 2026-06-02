import { Auth0Provider } from "@auth0/auth0-react";

type Props = {
  children: React.ReactNode;
};

export default function Auth0ProviderWithNavigate({ children }: Props) {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  // En desarrollo usa el puerto real de Vite (evita error si 5173 estaba ocupado)
  const redirectUri = import.meta.env.DEV
    ? window.location.origin
    : import.meta.env.VITE_AUTH0_CALLBACK_URL || window.location.origin;

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience,
        scope: "openid profile email",
      }}
    >
      {children}
    </Auth0Provider>
  );
}
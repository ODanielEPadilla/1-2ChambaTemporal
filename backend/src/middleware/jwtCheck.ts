import dotenv from "dotenv";
import { auth } from "express-oauth2-jwt-bearer";

dotenv.config();

const auth0Audience = process.env.AUTH0_AUDIENCE;
const auth0IssuerBaseUrl = process.env.AUTH0_ISSUER_BASE_URL;

if (!auth0Audience || !auth0IssuerBaseUrl) {
  throw new Error(
    "Faltan variables de entorno de Auth0: AUTH0_AUDIENCE o AUTH0_ISSUER_BASE_URL"
  );
}

export const jwtCheck = auth({
  audience: auth0Audience,
  issuerBaseURL: auth0IssuerBaseUrl,
  tokenSigningAlg: "RS256",
});

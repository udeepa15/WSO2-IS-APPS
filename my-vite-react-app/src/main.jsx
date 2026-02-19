import React from "react"
import ReactDOM from "react-dom/client"
import { AuthProvider } from "@asgardeo/auth-react";
import App from "./App.jsx";
import "./index.css";

// Clear stale Asgardeo SDK cache so the SDK re-resolves endpoints fresh.
// During the OAuth callback (?code=...) we keep EVERYTHING — the SDK needs
// temporary_data (PKCE verifier), config_data, and oidc_provider_meta_data
// to complete the token exchange.
const _params = new URLSearchParams(window.location.search);
const _isCallback = _params.has('code') || _params.has('error');
const _clientID = "72rLXxnPqcDV43mkzODwRsfG28Ea";
const removed = [];
if (!_isCallback) {
    for (const key of Object.keys(sessionStorage)) {
        if (key.includes(_clientID)) {
            removed.push(key);
            sessionStorage.removeItem(key);
        }
    }
}
console.log('[Auth] isCallback:', _isCallback);
console.log('[Auth] Cleared SDK sessionStorage keys:', removed.length ? removed : '(none — callback, keeping all)');
console.log('[Auth] Remaining sessionStorage keys:', Object.keys(sessionStorage));

const NGROK = "https://masked-unprofitably-ardith.ngrok-free.dev";

const asgardeoAuthConfig = {
    signInRedirectURL: "http://localhost:5173",
    signOutRedirectURL: "http://localhost:5173",
    clientID: "72rLXxnPqcDV43mkzODwRsfG28Ea",
    baseUrl: NGROK,
    scope: [ "openid", "profile", "email" ],
    enablePKCE: true,
    validateIDToken: false,   // ← TEMPORARY: skip JWKS fetch + issuer check
    resourceServerURLs: [NGROK],
    overrideWellEndpointConfig: true,
    endpoints: {
        // Browser redirects — go to ngrok directly (no CORS, full page nav)
        authorizationEndpoint: `${NGROK}/oauth2/authorize`,
        endSessionEndpoint: `${NGROK}/oidc/logout`,
        // XHR calls — go through Vite proxy (same-origin, no CORS)
        tokenEndpoint: "http://localhost:5173/oauth2/token",
        jwksUri: "http://localhost:5173/oauth2/jwks",
        revocationEndpoint: "http://localhost:5173/oauth2/revoke",
        userinfoEndpoint: "http://localhost:5173/oauth2/userinfo",
        oidcSessionIframeEndpoint: `${NGROK}/oidc/checksession`,
        // Issuer for ID token validation
        issuer: `${NGROK}/oauth2/token`
    }
};

console.log('[Auth] SDK config baseUrl:', asgardeoAuthConfig.baseUrl);
console.log('[Auth] overrideWellEndpointConfig:', asgardeoAuthConfig.overrideWellEndpointConfig);
console.log('[Auth] sessionStorage keys at init:', Object.keys(sessionStorage));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider config={ asgardeoAuthConfig }>
        <App />
    </AuthProvider>
  </React.StrictMode>,
)

import React from "react"
import ReactDOM from "react-dom/client"
import { AuthProvider } from "@asgardeo/auth-react";
import App from "./App.jsx";
import "./index.css";

// NOTE: We intentionally do NOT clear the SDK's sessionStorage keys here.
// With overrideWellEndpointConfig:true all endpoints are statically configured
// so there is no stale discovery-cache problem.
// More importantly, signOut() stores a logout-state nonce in sessionStorage
// BEFORE redirecting to the endSessionEndpoint. Wiping those keys on the
// post-logout redirect prevents the SDK from properly finalising the logout,
// which leaves the WSO2 IS server-side session alive and causes silent
// re-authentication on the next signIn() call.
console.log('[Auth] sessionStorage keys at init:', Object.keys(sessionStorage));

const NGROK = "https://masked-unprofitably-ardith.ngrok-free.dev";

const asgardeoAuthConfig = {
    signInRedirectURL: "http://localhost:5173",
    signOutRedirectURL: "http://localhost:5173",
    clientID: "qjYivYUuj09fA3c2VUf_fcsVR2sa",
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

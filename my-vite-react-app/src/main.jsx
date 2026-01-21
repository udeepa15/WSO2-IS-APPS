import React from "react"
import ReactDOM from "react-dom/client"
import { AuthProvider } from "@asgardeo/auth-react";
import App from "./App.jsx";
import "./index.css";

const asgardeoAuthConfig = {
    signInRedirectURL: "http://localhost:5173",
    signOutRedirectURL: "http://localhost:5173",
    clientID: "pvdjEN1Ee8iF_oVulmIbw5EiBuEa",
    baseUrl: "https://localhost:9443",
    scope: [ "openid", "profile" ],
    enablePKCE: true,
    resourceServerURLs: ["https://localhost:9443"]
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider config={ asgardeoAuthConfig }>
        <App />
    </AuthProvider>
  </React.StrictMode>,
)

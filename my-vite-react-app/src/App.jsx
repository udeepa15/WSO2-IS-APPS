import "./App.css";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { useAuthContext } from "@asgardeo/auth-react";
import { LandingPage } from "./pages/LandingPage";
import { HomePage } from "./pages/HomePage";

const ProtectedRoute = ({ children }) => {
    const { state } = useAuthContext();

    // SDK is still restoring session from storage — don't redirect yet
    if (state?.isLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <p>Loading…</p>
            </div>
        );
    }

    if (!state?.isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};

const routers = createBrowserRouter([
    {
        path: "/",
        element: <LandingPage />,
    },
    {
        path: "/home",
        element: (
            <ProtectedRoute>
                <HomePage />
            </ProtectedRoute>
        ),
    }
]);

function App() {
    return <RouterProvider router={ routers } />;
}

export default App;

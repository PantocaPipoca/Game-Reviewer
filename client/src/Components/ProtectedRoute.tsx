import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../API/Auth";

type ProtectedRouteProps = {
    children: ReactNode;
};

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const [loading, setLoading] = useState(true);
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        async function checkAuth() {
            const authenticated = await isAuthenticated();
            setAllowed(authenticated);
            setLoading(false);
        }

        checkAuth();
    }, []);

    if (loading) {
        return null;
    }

    if (!allowed) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

export default ProtectedRoute;

import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../API/Auth";

type ProtectedRouteProps = {
    children: ReactNode;
};

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const [loading, setLoading] = useState(true);
    const [allowed, setAllowed] = useState(false);
    const location = useLocation();

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
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return <>{children}</>;
}

export default ProtectedRoute;

import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { isAuthenticated } from "../API/Auth";

type ProtectedRouteProps = {
    children: ReactNode;
};

function ProtectedRoute({ children }: ProtectedRouteProps) {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

export default ProtectedRoute;

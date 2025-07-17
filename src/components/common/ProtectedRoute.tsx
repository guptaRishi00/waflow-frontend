import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "customer" | "agent" | "admin";
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user } = useSelector((state: RootState) => state.customerAuth);
  const isLoading = false; // Set to false unless you add loading state to Redux

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="waflow-gradient w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-xl">W</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath =
      user.role === "customer"
        ? "/customer/dashboard"
        : user.role === "agent"
        ? "/agent/dashboard"
        : "/manager/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

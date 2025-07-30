import React, { useEffect, useState } from "react";
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
  const { user, token } = useSelector((state: RootState) => state.customerAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Give time for authentication to be restored from localStorage
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Wait 1 second for auth to be restored

    return () => clearTimeout(timer);
  }, []);

  // Show loading while authentication is being restored
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

  // If no token and no user, redirect to auth
  if (!token && !user) {
    return <Navigate to="/auth" replace />;
  }

  // If we have a token but no user yet, show loading
  if (token && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="waflow-gradient w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-xl">W</span>
          </div>
          <p className="text-muted-foreground">Restoring session...</p>
        </div>
      </div>
    );
  }

  if (requiredRole && user && user.role !== requiredRole) {
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

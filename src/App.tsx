import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { DashboardLayout } from "./components/layout/DashboardLayout";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthPage } from "./pages/auth/AuthPage";
import { StartRegistrationPage } from "./pages/StartRegistrationPage";

// Customer Pages
import { CustomerDashboard } from "./pages/customer/CustomerDashboard";
import { DocumentsPage } from "./pages/customer/DocumentsPage";
import { DigilockerPage } from "./pages/customer/DigilockerPage";
import { VisaPage } from "./pages/customer/VisaPage";
import { ChatPage } from "./pages/customer/ChatPage";
import { CustomerSettings } from "./pages/customer/CustomerSettings";
import { BasicInfoPage } from "./pages/customer/BasicInfoPage";

// Agent Pages
import { AgentDashboard } from "./pages/agent/AgentDashboard";
import { ApplicationsPage } from "./pages/agent/ApplicationsPage";
import { CustomersPage } from "./pages/agent/CustomersPage";
import { DirectoryPage as AgentDirectoryPage } from "./pages/agent/DirectoryPage";
import { AgentChatPage } from "./pages/agent/AgentChatPage";
import { AgentSettings } from "./pages/agent/AgentSettings";

// Manager Pages
import { ManagerDashboard } from "./pages/manager/ManagerDashboard";
import { DirectoryPage as ManagerDirectoryPage } from "./pages/manager/DirectoryPage";
import { AgentsPage } from "./pages/manager/AgentsPage";
import { ManagerApplicationsPage } from "./pages/manager/ManagerApplicationsPage";
import { ManagerCustomersPage } from "./pages/manager/ManagerCustomersPage";
import { ManagerSettings } from "./pages/manager/ManagerSettings";
import { AuthInitializer } from "./lib/AuthInitializer";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user } = useSelector((state: RootState) => state.customerAuth);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route
        path="/auth"
        element={
          user ? (
            <Navigate
              to={
                user.role === "customer"
                  ? "/customer/dashboard"
                  : user.role === "agent"
                  ? "/agent/dashboard"
                  : user.role === "admin"
                  ? "/manager/dashboard"
                  : "/auth"
              }
              replace
            />
          ) : (
            <AuthPage />
          )
        }
      />
      <Route path="/start-registration" element={<StartRegistrationPage />} />

      {/* Customer Routes */}
      <Route
        path="/customer/*"
        element={
          <ProtectedRoute requiredRole="customer">
            <DashboardLayout>
              <Routes>
                <Route path="dashboard" element={<CustomerDashboard />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="digilocker" element={<DigilockerPage />} />
                <Route path="visa" element={<VisaPage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="settings" element={<CustomerSettings />} />
                <Route path="basic-info" element={<BasicInfoPage />} />
                <Route
                  path="*"
                  element={<Navigate to="/customer/dashboard" replace />}
                />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Agent Routes */}
      <Route
        path="/agent/*"
        element={
          <ProtectedRoute requiredRole="agent">
            <DashboardLayout>
              <Routes>
                <Route path="dashboard" element={<AgentDashboard />} />
                <Route path="applications" element={<ApplicationsPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="directory" element={<AgentDirectoryPage />} />
                <Route path="chat" element={<AgentChatPage />} />
                <Route path="settings" element={<AgentSettings />} />
                <Route
                  path="*"
                  element={<Navigate to="/agent/dashboard" replace />}
                />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Manager Routes */}
      <Route
        path="/manager/*"
        element={
          <ProtectedRoute requiredRole="admin">
            <DashboardLayout>
              <Routes>
                <Route path="dashboard" element={<ManagerDashboard />} />
                <Route path="agents" element={<AgentsPage />} />
                <Route
                  path="applications"
                  element={<ManagerApplicationsPage />}
                />
                <Route path="customers" element={<ManagerCustomersPage />} />
                <Route path="directory" element={<ManagerDirectoryPage />} />
                <Route path="settings" element={<ManagerSettings />} />
                <Route
                  path="*"
                  element={<Navigate to="/manager/dashboard" replace />}
                />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthInitializer />
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

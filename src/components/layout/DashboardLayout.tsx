import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { CustomerSidebar } from "./CustomerSidebar";
import { AgentSidebar } from "./AgentSidebar";
import { ManagerSidebar } from "./ManagerSidebar";
import { NotificationBell } from "./NotificationBell";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const { user } = useSelector((state: RootState) => state.customerAuth);

  // console.log('dashboard layout:', user);

  if (!user) return null;

  const getSidebar = () => {
    switch (user.role) {
      case "customer":
        return <CustomerSidebar />;
      case "agent":
        return <AgentSidebar />;
      case "manager":
        return <ManagerSidebar />;
      default:
        return <CustomerSidebar />;
    }
  };

  const getPortalTitle = () => {
    switch (user.role) {
      case "customer":
        return "Customer Portal";
      case "agent":
        return "Agent Portal";
      case "manager":
        return "Manager Portal";
      default:
        return "Portal";
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <div className="min-w-[16rem] max-w-[16rem] h-screen bg-sidebar border-r border-sidebar-border z-20">
          {getSidebar()}
        </div>
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b bg-background flex items-center justify-between px-4">
            <div className="flex items-center">
              <SidebarTrigger />
              <div className="ml-4">
                <h1 className="font-semibold text-lg">{getPortalTitle()}</h1>
              </div>
            </div>
            <NotificationBell />
          </header>
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

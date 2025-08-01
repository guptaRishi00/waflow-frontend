import React from "react";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { CustomerSidebar } from "./CustomerSidebar";
import { AgentSidebar } from "./AgentSidebar";
import { ManagerSidebar } from "./ManagerSidebar";
import { NotificationBell } from "./NotificationBell";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/app/store";
import { logout } from "@/features/customerAuthSlice";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, Settings } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const { user } = useSelector((state: RootState) => state.customerAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // console.log('dashboard layout:', user);

  if (!user) return null;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth");
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getSidebar = () => {
    switch (user.role) {
      case "customer":
        return <CustomerSidebar />;
      case "agent":
        return <AgentSidebar />;
      case "admin":
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
      case "admin":
        return "Manager Portal";
      default:
        return "Portal";
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-gray-50">
        {getSidebar()}
        <SidebarInset>
          <header className="h-14 border-b bg-background flex items-center justify-between px-4">
            <div className="flex items-center">
              <SidebarTrigger />
              <div className="ml-4">
                <h1 className="font-semibold text-lg">{getPortalTitle()}</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getUserInitials(user.name || user.email || "U")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

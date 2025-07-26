import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Shield,
  FileText,
  Users,
  FolderOpen,
  Settings,
  LogOut,
  Home,
  CreditCard,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
// import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { logout } from "@/features/customerAuthSlice";

const managerNavItems = [
  { title: "Dashboard", url: "/manager/dashboard", icon: LayoutDashboard },
  { title: "Agents", url: "/manager/agents", icon: Shield },
  { title: "Applications", url: "/manager/applications", icon: FileText },
  { title: "Customers", url: "/manager/customers", icon: Users },
  { title: "Documents", url: "/manager/directory", icon: FolderOpen },
  {
    title: "Visa Applications",
    url: "/manager/visa-applications",
    icon: CreditCard,
  },
  // { title: "Settings", url: "/manager/settings", icon: Settings },
];

export const ManagerSidebar: React.FC = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const { token, user } = useSelector((state: RootState) => state.customerAuth);
  const isCollapsed = state === "collapsed";

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth");
  };

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <img
              src="/lovable-uploads/845e8623-687f-45d0-b77d-95df3726b023.png"
              alt="Waflow Logo"
              className={`${
                isCollapsed ? "w-8 h-8" : "w-32 h-8"
              } object-contain`}
            />
          </div>
          {!isCollapsed && (
            <div>
              <p className="text-xs text-sidebar-foreground/70">
                Manager Portal
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managerNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                  >
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!isCollapsed && user && (
          <div className="mb-4 p-3 bg-sidebar-accent rounded-lg">
            <p className="text-sm font-medium text-sidebar-accent-foreground">
              {user.name}
            </p>
            <p className="text-xs text-sidebar-accent-foreground/70">
              {user.email}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            <NavLink to="/">
              <Home className="mr-2 h-4 w-4" />
              {!isCollapsed && <span>Home</span>}
            </NavLink>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground hover:bg-red-500/10 hover:text-red-400"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, FileText, MessageSquare } from "lucide-react";
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
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { cn } from "@/lib/utils";

const agentNavItems = [
  { title: "Dashboard", url: "/agent/dashboard", icon: LayoutDashboard },
  { title: "Applications", url: "/agent/applications", icon: FileText },
  { title: "Customers", url: "/agent/customers", icon: Users },
  { title: "Directory", url: "/agent/directory", icon: FileText },
  // { title: "Chat", url: "/agent/chat", icon: MessageSquare },
  {
    title: "Visa Application",
    url: "/agent/visa-applications",
    icon: FileText,
  },
  // { title: "Settings", url: "/agent/settings", icon: Settings },
];

export const AgentSidebar: React.FC = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const { token, user } = useSelector((state: RootState) => state.customerAuth);
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      className="border-r border-sidebar-border bg-sidebar"
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-sidebar-border/30">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <img
              src="/lovable-uploads/logo-1.png"
              alt="Waflow Logo"
              className={`${
                isCollapsed ? "w-16 h-16" : "w-64 h-20"
              } object-contain transition-all duration-300`}
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2 px-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {agentNavItems.map((item) => {
                // Check for exact match first, then check if current path starts with item URL
                const isExactMatch = location.pathname === item.url;
                const isNestedMatch =
                  item.url !== "/agent/dashboard" &&
                  location.pathname.startsWith(item.url + "/");
                const isActive = isExactMatch || isNestedMatch;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive}
                    >
                      <NavLink
                        to={item.url}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
                          isCollapsed && "justify-center px-2"
                        )}
                      >
                        <item.icon
                          className={`h-5 w-5 flex-shrink-0 ${
                            isCollapsed ? "mx-auto" : ""
                          }`}
                        />
                        <span
                          className={`transition-all duration-300 ease-in-out font-medium ${
                            isCollapsed
                              ? "opacity-0 scale-95 w-0 overflow-hidden"
                              : "opacity-100 scale-100"
                          }`}
                        >
                          {!isCollapsed && item.title}
                        </span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              {/* <NavLink
                to="/agent/visa-applications"
                className={({ isActive }) =>
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }
              >
                <FileText className="mr-2 h-4 w-4" />
                {!isCollapsed && <span>Visa Applications</span>}
              </NavLink> */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

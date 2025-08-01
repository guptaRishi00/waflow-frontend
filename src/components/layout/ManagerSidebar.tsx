import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Shield,
  FileText,
  Users,
  FolderOpen,
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
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { cn } from "@/lib/utils";

const managerNavItems = [
  { title: "Dashboard", url: "/manager/dashboard", icon: LayoutDashboard },
  { title: "Agents", url: "/manager/agents", icon: Shield },
  { title: "Applications", url: "/manager/applications", icon: FileText },
  { title: "Customers", url: "/manager/customers", icon: Users },
  { title: "Documents", url: "/manager/directory", icon: FolderOpen },
  // {
  //   title: "Visa Applications",
  //   url: "/manager/visa-applications",
  //   icon: CreditCard,
  // },
  // { title: "Settings", url: "/manager/settings", icon: Settings },
];

export const ManagerSidebar: React.FC = () => {
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
              src="/lovable-uploads/845e8623-687f-45d0-b77d-95df3726b023.png"
              alt="Waflow Logo"
              className={`${
                isCollapsed ? "w-8 h-8" : "w-32 h-8"
              } object-contain transition-all duration-300`}
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {managerNavItems.map((item) => {
                // Check for exact match first, then check if current path starts with item URL
                const isExactMatch = location.pathname === item.url;
                const isNestedMatch =
                  item.url !== "/manager/dashboard" &&
                  location.pathname.startsWith(item.url + "/");
                const isActive = isExactMatch || isNestedMatch;

                // Debug logging
                console.log(`Sidebar Item: ${item.title}`);
                console.log(`  Item URL: ${item.url}`);
                console.log(`  Current Path: ${location.pathname}`);
                console.log(`  Exact Match: ${isExactMatch}`);
                console.log(`  Nested Match: ${isNestedMatch}`);
                console.log(`  Is Active: ${isActive}`);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink
                        to={item.url}
                        className={({ isActive: navIsActive }) => {
                          const active = isActive || navIsActive;
                          console.log(
                            `  NavLink Active: ${navIsActive}, Final Active: ${active}`
                          );
                          return cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
                            isCollapsed && "justify-center px-2",
                            active
                              ? "bg-blue-600 text-white font-semibold shadow-sm mx-1"
                              : "text-white hover:bg-white/20 hover:text-white mx-1"
                          );
                        }}
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

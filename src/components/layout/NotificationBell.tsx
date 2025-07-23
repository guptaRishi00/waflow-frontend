import React, { useState } from "react";
import { Bell, X, FileCheck, CreditCard, UserPlus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { useAuth } from '@/contexts/AuthContext';
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

interface Notification {
  id: string;
  type:
    | "payment"
    | "document"
    | "status"
    | "submission"
    | "agent-creation"
    | "progress";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const mockNotifications: Record<string, Notification[]> = {
  customer: [
    {
      id: "1",
      type: "payment",
      title: "Payment Due",
      message: "Your business license fee of AED 5,000 is due in 3 days",
      timestamp: "2 hours ago",
      read: false,
    },
    {
      id: "2",
      type: "document",
      title: "Document Approved",
      message: "Your passport copy has been verified and approved",
      timestamp: "1 day ago",
      read: false,
    },
    {
      id: "3",
      type: "status",
      title: "Application Status Update",
      message: "Your business registration is now under review",
      timestamp: "2 days ago",
      read: true,
    },
  ],
  agent: [
    {
      id: "4",
      type: "submission",
      title: "New Document Submission",
      message: "John Doe submitted passport documents for review",
      timestamp: "1 hour ago",
      read: false,
    },
    {
      id: "5",
      type: "submission",
      title: "Customer Query",
      message: "Sarah Smith has a question about her application",
      timestamp: "3 hours ago",
      read: false,
    },
    {
      id: "6",
      type: "submission",
      title: "Payment Received",
      message: "Michael Johnson completed payment for business license",
      timestamp: "1 day ago",
      read: true,
    },
  ],
  manager: [
    {
      id: "7",
      type: "agent-creation",
      title: "New Agent Registered",
      message: "Ahmed Hassan has joined as a new agent",
      timestamp: "30 minutes ago",
      read: false,
    },
    {
      id: "8",
      type: "progress",
      title: "Monthly Progress Report",
      message: "Agent performance metrics are ready for review",
      timestamp: "2 hours ago",
      read: false,
    },
    {
      id: "9",
      type: "progress",
      title: "Application Milestone",
      message: "50 applications completed this month",
      timestamp: "1 day ago",
      read: true,
    },
  ],
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "payment":
      return <CreditCard className="h-4 w-4 text-green-600" />;
    case "document":
      return <FileCheck className="h-4 w-4 text-blue-600" />;
    case "status":
      return <Clock className="h-4 w-4 text-orange-600" />;
    case "submission":
      return <FileCheck className="h-4 w-4 text-purple-600" />;
    case "agent-creation":
      return <UserPlus className="h-4 w-4 text-blue-600" />;
    case "progress":
      return <Clock className="h-4 w-4 text-green-600" />;
    default:
      return <Bell className="h-4 w-4 text-gray-600" />;
  }
};

export const NotificationBell: React.FC = () => {
  const { token, user } = useSelector((state: RootState) => state.customerAuth);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(
    mockNotifications[user?.role || "customer"] || []
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="hidden">
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto z-50 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Notifications</CardTitle>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-6 px-2"
                      onClick={markAllAsRead}
                    >
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                        !notification.read
                          ? "bg-blue-50 border-l-4 border-l-blue-500"
                          : ""
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

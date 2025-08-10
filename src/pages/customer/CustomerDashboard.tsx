import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProgressTracker } from "@/components/ui/progress-tracker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  MessageSquare,
  CreditCard,
  Calendar,
  Loader2,
  Bell,
  Filter,
  Settings,
  Archive,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { PageLoader } from "@/components/ui/page-loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  status: "Read" | "Unread";
  createdAt: string;
  updatedAt: string;
  priority?: "low" | "medium" | "high";
  category?: string;
}

interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  categories: string[];
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export const CustomerDashboard: React.FC = () => {
  const { user, token } = useSelector((state: RootState) => state.customerAuth);
  const { toast } = useToast();
  const [application, setApplication] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  // Enhanced notification states
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [previousNotificationCount, setPreviousNotificationCount] = useState(0);
  const [notificationFilter, setNotificationFilter] = useState<
    "all" | "unread" | "read"
  >("all");
  const [notificationCategory, setNotificationCategory] =
    useState<string>("all");
  const [showNotificationHistory, setShowNotificationHistory] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] =
    useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [notificationsPerPage] = useState(5);
  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences>({
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      categories: ["application", "payment", "document", "general"],
      quietHours: {
        enabled: false,
        start: "22:00",
        end: "08:00",
      },
    });

  // Get unique notification categories
  const notificationCategories = [
    "all",
    ...Array.from(new Set(notifications.map((n) => n.category || "general"))),
  ];

  // Filter notifications based on current filters
  const filteredNotifications = notifications.filter((notification) => {
    const matchesStatus =
      notificationFilter === "all" ||
      (notificationFilter === "unread" && notification.status === "Unread") ||
      (notificationFilter === "read" && notification.status === "Read");
    const matchesCategory =
      notificationCategory === "all" ||
      notification.category === notificationCategory;
    return matchesStatus && matchesCategory;
  });

  // Sort notifications by most recent first
  const sortedNotifications = [...filteredNotifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Pagination logic
  const totalPages = Math.ceil(
    sortedNotifications.length / notificationsPerPage
  );
  const startIndex = (currentPage - 1) * notificationsPerPage;
  const endIndex = startIndex + notificationsPerPage;
  const currentNotifications = sortedNotifications.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [notificationFilter, notificationCategory]);

  // Helper function to get unread count
  const getUnreadCount = () =>
    notifications.filter((n) => n.status === "Unread").length;

  // Fetch notifications for customer
  const fetchNotifications = useCallback(async () => {
    if (!token || !user?.userId) return;
    try {
      setLoadingNotifications(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/notification/customer/${
          user.userId
        }`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newNotifications = response.data.data || [];

      // Check if there are new unread notifications
      const currentUnreadCount = newNotifications.filter(
        (n) => n.status === "Unread"
      ).length;
      if (
        currentUnreadCount > previousNotificationCount &&
        previousNotificationCount > 0
      ) {
        toast({
          title: "New Notifications",
          description: `You have ${currentUnreadCount} unread notifications`,
          variant: "default",
        });
      }

      setPreviousNotificationCount(currentUnreadCount);
      setNotifications(newNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  }, [token, user?.userId, previousNotificationCount, toast]);

  // Fetch real application data
  useEffect(() => {
    const fetchApplicationData = async () => {
      if (!token || !user?.userId) return;

      setLoading(true);
      try {
        // Fetch customer's application
        const applicationResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/application/app/${user.userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (applicationResponse.data.data) {
          setApplication(applicationResponse.data.data);
        }

        // Note: Invoice endpoint not available in current backend
      } catch (error: any) {
        console.error("Error fetching application data:", error);
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);
        toast({
          title: "Error",
          description:
            error.response?.data?.message || "Failed to load application data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationData();
    fetchNotifications();
  }, [token, user, toast, fetchNotifications]);

  // Fetch notifications on mount (even without application)
  useEffect(() => {
    if (token && user?.userId) {
      fetchNotifications();
    }
  }, [token, user?.userId, fetchNotifications]);

  // Refresh notifications every 30 seconds
  useEffect(() => {
    if (!token || !user?.userId) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [token, user?.userId, fetchNotifications]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await axios.patch(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/notification/read/${notificationId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update the notification status locally
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, status: "Read" }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark notification as unread (not supported in current backend)
  const markAsUnread = async (notificationId: string) => {
    // Update the notification status locally only
    setNotifications((prev) =>
      prev.map((notification) =>
        notification._id === notificationId
          ? { ...notification, status: "Unread" }
          : notification
      )
    );
  };

  // Archive notification (not supported in current backend)
  const archiveNotification = async (notificationId: string) => {
    // Remove from local state only
    setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    toast({
      title: "Notification archived",
      description: "Notification has been archived locally.",
    });
  };

  // Delete notification (not supported in current backend)
  const deleteNotification = async (notificationId: string) => {
    // Remove from local state only
    setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    toast({
      title: "Notification deleted",
      description: "Notification has been deleted locally.",
    });
  };

  // Clear all notifications by marking each as read individually
  const clearAllNotifications = async () => {
    try {
      // Get all unread notifications
      const unreadNotifications = notifications.filter(
        (n) => n.status === "Unread"
      );

      if (unreadNotifications.length === 0) {
        toast({
          title: "No unread notifications",
          description: "All notifications are already read.",
        });
        return;
      }

      // Mark each unread notification as read using the working endpoint
      const promises = unreadNotifications.map((notification) =>
        axios.patch(
          `${import.meta.env.VITE_BASE_URL}/api/notification/read/${
            notification._id
          }`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );

      await Promise.all(promises);

      // Update local state to mark all as read
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          status: "Read" as const,
        }))
      );

      toast({
        title: "Notifications cleared",
        description: `All ${unreadNotifications.length} notifications have been marked as read.`,
      });
    } catch (error) {
      console.error("Error clearing notifications:", error);
      toast({
        title: "Error",
        description: "Failed to clear some notifications. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update notification preferences (not supported in current backend)
  const updateNotificationPreferences = async () => {
    // Save preferences locally only
    toast({
      title: "Preferences updated",
      description: "Your notification preferences have been saved locally.",
    });
    setShowNotificationSettings(false);
  };

  // Get notification icon based on type/category
  const getNotificationIcon = (notification: Notification) => {
    switch (notification.category) {
      case "payment":
        return <CreditCard className="h-4 w-4 text-green-600" />;
      case "document":
        return <FileText className="h-4 w-4 text-blue-600" />;
      case "application":
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case "urgent":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  // Get priority badge color
  const getPriorityBadgeVariant = (priority?: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  if (loading) {
    return <PageLoader message="Loading your application data..." size="lg" />;
  }

  if (!application) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-primary">Welcome back!</h1>
            {getUnreadCount() > 0 && (
              <Badge variant="secondary" className="text-sm">
                {getUnreadCount()} notifications
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Track your UAE business registration progress
          </p>
        </div>
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-muted-foreground mb-2">
            No Application Found
          </h2>
          <p className="text-muted-foreground mb-4">
            You haven't submitted any business registration applications yet.
          </p>
          <Button asChild>
            <Link to="/customer/basic-info">Start Your Application</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-primary">Welcome back!</h1>
          {getUnreadCount() > 0 && (
            <Badge variant="secondary" className="text-sm">
              {getUnreadCount()} notifications
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          Track your UAE business registration progress
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-800"
                >
                  {application.status?.replace("-", " ") || "Pending"}
                </Badge>
              </div>
              <Calendar className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Business Type</p>
                <p className="text-lg font-semibold capitalize">
                  {application.jurisdiction || "N/A"}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full waflow-gradient flex items-center justify-center">
                <span className="text-xs font-bold text-white">UAE</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Notifications</p>
                <p className="text-lg font-semibold">{getUnreadCount()}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Notifications Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-blue-600" />
            Notifications
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotificationSettings(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotificationHistory(true)}
            >
              <Clock className="h-4 w-4 mr-2" />
              History
            </Button>
          </div>
        </div>

        {/* Notification Filters */}
        <div className="flex items-center gap-4 mb-4">
          <Select
            value={notificationFilter}
            onValueChange={(value: any) => setNotificationFilter(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={notificationCategory}
            onValueChange={(value: any) => setNotificationCategory(value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {notificationCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={clearAllNotifications}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>

        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>
                  Important updates about your application
                </CardDescription>
              </div>
              <div className="text-sm text-muted-foreground">
                {currentNotifications.length} of {sortedNotifications.length}{" "}
                notifications (Page {currentPage} of {totalPages})
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingNotifications ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-gray-100 animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : currentNotifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <div>No notifications found</div>
                <p className="text-sm">
                  {sortedNotifications.length === 0
                    ? "You're all caught up!"
                    : "Try adjusting your filters"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 rounded-lg transition-all hover:shadow-sm border ${
                      notification.status === "Unread"
                        ? "bg-blue-50 border-blue-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-sm truncate">
                            {notification.title}
                          </h5>
                          {notification.priority && (
                            <Badge
                              variant={getPriorityBadgeVariant(
                                notification.priority
                              )}
                            >
                              {notification.priority}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            {new Date(
                              notification.createdAt
                            ).toLocaleDateString()}{" "}
                            •{" "}
                            {new Date(
                              notification.createdAt
                            ).toLocaleTimeString()}
                          </p>
                          <div className="flex items-center gap-1">
                            {notification.status === "Unread" ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(notification._id)}
                                className="h-6 px-2"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsUnread(notification._id)}
                                className="h-6 px-2"
                              >
                                <EyeOff className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                archiveNotification(notification._id)
                              }
                              className="h-6 px-2"
                            >
                              <Archive className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                deleteNotification(notification._id)
                              }
                              className="h-6 px-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      {notification.status === "Unread" && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        )
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notification Tasks */}
      <div className="mb-6">
        <Card className="shadow-lg rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold">Notification Tasks</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      getUnreadCount() > 0 ? "bg-blue-500" : "bg-green-500"
                    }`}
                  ></div>
                  <span className="text-sm">Check Notifications</span>
                </div>
                <Badge variant={getUnreadCount() > 0 ? "secondary" : "default"}>
                  {getUnreadCount() > 0
                    ? `${getUnreadCount()} unread`
                    : "All caught up"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Tracker */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Application Progress</CardTitle>
            <CardDescription>
              Your business registration application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressTracker
              steps={application.steps || []}
              currentStep={application.currentStep || 0}
            />
          </CardContent>
        </Card>
      </div>

      {/* Notification Settings Dialog */}
      <Dialog
        open={showNotificationSettings}
        onOpenChange={setShowNotificationSettings}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Notification Preferences</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <Switch
                id="email-notifications"
                checked={notificationPreferences.emailNotifications}
                onCheckedChange={(checked) =>
                  setNotificationPreferences((prev) => ({
                    ...prev,
                    emailNotifications: checked,
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <Switch
                id="push-notifications"
                checked={notificationPreferences.pushNotifications}
                onCheckedChange={(checked) =>
                  setNotificationPreferences((prev) => ({
                    ...prev,
                    pushNotifications: checked,
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-notifications">SMS Notifications</Label>
              <Switch
                id="sms-notifications"
                checked={notificationPreferences.smsNotifications}
                onCheckedChange={(checked) =>
                  setNotificationPreferences((prev) => ({
                    ...prev,
                    smsNotifications: checked,
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="quiet-hours">Quiet Hours</Label>
              <Switch
                id="quiet-hours"
                checked={notificationPreferences.quietHours.enabled}
                onCheckedChange={(checked) =>
                  setNotificationPreferences((prev) => ({
                    ...prev,
                    quietHours: { ...prev.quietHours, enabled: checked },
                  }))
                }
              />
            </div>
            {notificationPreferences.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="start-time">Start Time</Label>
                  <input
                    id="start-time"
                    type="time"
                    value={notificationPreferences.quietHours.start}
                    onChange={(e) =>
                      setNotificationPreferences((prev) => ({
                        ...prev,
                        quietHours: {
                          ...prev.quietHours,
                          start: e.target.value,
                        },
                      }))
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <Label htmlFor="end-time">End Time</Label>
                  <input
                    id="end-time"
                    type="time"
                    value={notificationPreferences.quietHours.end}
                    onChange={(e) =>
                      setNotificationPreferences((prev) => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, end: e.target.value },
                      }))
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNotificationSettings(false)}
            >
              Cancel
            </Button>
            <Button onClick={updateNotificationPreferences}>
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification History Dialog */}
      <Dialog
        open={showNotificationHistory}
        onOpenChange={setShowNotificationHistory}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Notification History</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {sortedNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <div>No notifications found</div>
              </div>
            ) : (
              sortedNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 rounded-lg border ${
                    notification.status === "Unread"
                      ? "bg-blue-50 border-blue-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium">{notification.title}</h5>
                        {notification.priority && (
                          <Badge
                            variant={getPriorityBadgeVariant(
                              notification.priority
                            )}
                          >
                            {notification.priority}
                          </Badge>
                        )}
                        <Badge
                          variant={
                            notification.status === "Unread"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {notification.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleDateString()}{" "}
                        •{" "}
                        {new Date(notification.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

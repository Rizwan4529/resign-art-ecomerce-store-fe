import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  BellOff,
  Package,
  Phone,
  Check,
  CheckCheck,
  Trash2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from "../store/slices/authSlice";
import {
  Notification,
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} from "../services/api/notificationApi";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { extractErrorMessage } from "../utils/authHelpers";

export const Notifications = () => {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();

  // RTK Query hooks
  const { data: notificationsData, isLoading } = useGetNotificationsQuery(
    { page: 1, limit: 50 },
    { skip: !isAuthenticated },
  );
  const [markAsRead, { isLoading: isMarkingRead }] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAllRead }] =
    useMarkAllAsReadMutation();
  const [deleteNotification, { isLoading: isDeleting }] =
    useDeleteNotificationMutation();

  const notifications = notificationsData?.data || [];
  const unreadCount = notificationsData?.unreadCount || 0;

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "IN_APP":
        return Package;
      case "EMAIL":
        return Bell;
      case "SMS":
        return Phone;
      case "PUSH":
        return Bell;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "IN_APP":
        return "bg-blue-100 text-blue-600";
      case "EMAIL":
        return "bg-purple-100 text-purple-600";
      case "SMS":
        return "bg-green-100 text-green-600";
      case "PUSH":
        return "bg-orange-100 text-orange-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id).unwrap();
    } catch (error) {
      toast.error("Failed to mark as read", {
        description: extractErrorMessage(error),
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read", {
        description: extractErrorMessage(error),
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNotification(id).unwrap();
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification", {
        description: extractErrorMessage(error),
      });
    }
  };

  const handleViewOrder = (notification: Notification) => {
    if (notification.relatedTo?.startsWith("order:")) {
      const orderId = notification.relatedTo.split(":")[1];
      // Mark as read first
      if (!notification.isRead) {
        markAsRead(notification.id);
      }
      // Navigate to order tracking page
      navigate(`/order-tracking/${orderId}`);
    }
  };

  if (!user || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to view notifications
          </h1>
          <Button onClick={() => (window.location.href = "/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-lg h-24 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Notifications
            </h1>
            <p className="text-gray-600">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notifications`
                : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAllRead}
            >
              {isMarkingAllRead ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCheck className="w-4 h-4 mr-2" />
              )}
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <Card className="bg-white/70 backdrop-blur-sm border-white/20">
            <CardContent className="p-12 text-center">
              <BellOff className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-600 mb-6">
                When you receive notifications, they will appear here.
              </p>
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Link to="/shop">Continue Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);

              return (
                <Card
                  key={notification.id}
                  className={`bg-white/70 backdrop-blur-sm border-white/20 hover:shadow-lg transition-all duration-300 ${
                    !notification.isRead ? "border-l-4 border-l-blue-500" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`p-3 rounded-full ${getNotificationColor(notification.type)}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {notification.title}
                              {!notification.isRead && (
                                <Badge className="ml-2 bg-blue-500 text-white text-xs">
                                  New
                                </Badge>
                              )}
                            </h4>
                            <p className="text-gray-600 mt-1">
                              {notification.message}{" "}
                              {notification?.courierCompany &&
                                `via ${notification?.courierCompany}`}
                            </p>
                            <p className="text-sm text-gray-400 mt-2">
                              {formatTimeAgo(notification.sentAt)}
                            </p>
                          </div>

                          {/* Actions */}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination info */}
        {notificationsData?.pagination && (
          <div className="mt-8 text-center text-gray-500 text-sm">
            Showing {notifications.length} of{" "}
            {notificationsData.pagination.totalCount} notifications
          </div>
        )}
      </div>
    </div>
  );
};

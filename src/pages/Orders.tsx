import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from "../store/slices/authSlice";
import {
  Order,
  OrderStatus,
  useGetMyOrdersQuery,
  useCancelOrderMutation,
} from "../services/api/orderApi";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { extractErrorMessage } from "../utils/authHelpers";

export const Orders = () => {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");

  // RTK Query hooks
  const { data: ordersData, isLoading } = useGetMyOrdersQuery(
    { page: 1, limit: 100 },
    { skip: !isAuthenticated },
  );
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const orders = ordersData?.data || [];

  const getStatusIcon = (status: OrderStatus) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "pending":
        return Clock;
      case "confirmed":
        return Package;
      case "processing":
        return Package;
      case "shipped":
        return Truck;
      case "delivered":
        return CheckCircle;
      case "cancelled":
        return XCircle;
      default:
        return Package;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some((item) =>
          item.productName.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      const matchesStatus =
        statusFilter === "ALL" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const ordersByStatus = useMemo(() => {
    return {
      ALL: filteredOrders,
      PENDING: orders.filter((o) => o.status === "PENDING"),
      CONFIRMED: orders.filter((o) => o.status === "CONFIRMED"),
      PROCESSING: orders.filter((o) => o.status === "PROCESSING"),
      SHIPPED: orders.filter((o) => o.status === "SHIPPED"),
      DELIVERED: orders.filter((o) => o.status === "DELIVERED"),
      CANCELLED: orders.filter((o) => o.status === "CANCELLED"),
    };
  }, [orders, filteredOrders]);

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      await cancelOrder({ id: orderId }).unwrap();
      toast.success("Order cancelled successfully!");
    } catch (error) {
      toast.error("Failed to cancel order", {
        description: extractErrorMessage(error),
      });
    }
  };

  if (!user || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to view your orders
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-lg h-32 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {/* Filters */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-48">
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as OrderStatus | "ALL")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Orders</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Tabs */}
        <Tabs defaultValue="ALL" className="space-y-6">
          <TabsList className="grid grid-cols-7 lg:w-full">
            {Object.entries(ordersByStatus).map(([status, statusOrders]) => (
              <TabsTrigger key={status} value={status} className="text-xs">
                {status} ({statusOrders.length})
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(ordersByStatus).map(([status, statusOrders]) => (
            <TabsContent key={status} value={status}>
              {statusOrders.length === 0 ? (
                <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                  <CardContent className="p-12 text-center">
                    <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No {status === "ALL" ? "" : status.toLowerCase()} orders
                      found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {status === "ALL"
                        ? "You haven't placed any orders yet."
                        : `You don't have any ${status.toLowerCase()} orders.`}
                    </p>
                    <Button
                      asChild
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      <Link to="/shop">Start Shopping</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {statusOrders.map((order) => {
                    const StatusIcon = getStatusIcon(order.status);

                    return (
                      <Card
                        key={order.id}
                        className="bg-white/70 backdrop-blur-sm border-white/20 hover:shadow-lg transition-all duration-300"
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="flex items-center space-x-3">
                                <span>Order #{order.orderNumber}</span>
                                <Badge className={getStatusColor(order.status)}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {order.status}
                                </Badge>
                              </CardTitle>
                              <CardDescription>
                                Placed on{" "}
                                {new Date(order.orderedAt).toLocaleDateString()}{" "}
                                • {order.items.length} item
                                {order.items.length > 1 ? "s" : ""}
                              </CardDescription>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">
                                $
                                {typeof order.totalAmount === "string"
                                  ? order.totalAmount
                                  : order.totalAmount.toFixed(2)}
                              </div>
                              {order.delivery?.trackingNumber && (
                                <p className="text-sm text-gray-600">
                                  Tracking: {order.delivery.trackingNumber}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent>
                          {/* Order Items */}
                          <div className="space-y-4 mb-6">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                              >
                                {item.product?.images &&
                                  item.product.images.length > 0 && (
                                    <ImageWithFallback
                                      src={item.product.images[0]}
                                      alt={item.productName}
                                      className="w-16 h-16 object-cover rounded-lg"
                                    />
                                  )}
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">
                                    {item.productName}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Quantity: {item.quantity} • $
                                    {typeof item.unitPrice === "string"
                                      ? item.unitPrice
                                      : item.unitPrice.toFixed(2)}{" "}
                                    each
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">
                                    $
                                    {typeof item.totalPrice === "string"
                                      ? item.totalPrice
                                      : item.totalPrice.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Order Actions */}
                          <div className="flex flex-col sm:flex-row gap-3 sm:justify-between items-start sm:items-center pt-4 border-t border-gray-200">
                            <div className="flex flex-wrap gap-2">
                              {order.status === "DELIVERED" && (
                                <>
                                  <Button variant="outline" size="sm">
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Invoice
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    Reorder Items
                                  </Button>
                                </>
                              )}

                              {(order.status === "PENDING" ||
                                order.status === "CONFIRMED") && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleCancelOrder(order.id)}
                                  disabled={isCancelling}
                                >
                                  {isCancelling
                                    ? "Cancelling..."
                                    : "Cancel Order"}
                                </Button>
                              )}
                            </div>

                            {/* Current Location & Shipping Address */}
                            <div className="text-right text-sm space-y-1">
                              {order.currentLocation && (
                                <div className="text-blue-600 font-medium">
                                  📍 {order.currentLocation}
                                </div>
                              )}
                              <p className="text-gray-600">
                                <span className="font-medium">
                                  Shipping to:
                                </span>
                              </p>
                              <p className="text-gray-600">
                                {order.shippingAddress}
                              </p>
                              <p className="text-gray-600">
                                {order.shippingPhone}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Order Summary Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-white/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {orders.length}
              </div>
              <p className="text-gray-600">Total Orders</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                $
                {orders
                  .reduce((sum, order) => {
                    const total =
                      typeof order.totalAmount === "string"
                        ? parseFloat(order.totalAmount)
                        : order.totalAmount;
                    return sum + total;
                  }, 0)
                  .toFixed(2)}
              </div>
              <p className="text-gray-600">Total Spent</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {orders.filter((o) => o.status === "DELIVERED").length}
              </div>
              <p className="text-gray-600">Completed Orders</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

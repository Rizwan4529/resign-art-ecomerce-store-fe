import React, { useState, useMemo } from "react";
import {
  Package,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  Order,
  OrderStatus,
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
  useUpdateOrderLocationMutation,
} from "../../services/api/orderApi";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { extractErrorMessage } from "../../utils/authHelpers";

export const OrderManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [locationInput, setLocationInput] = useState("");

  // Form state for status update
  const [newStatus, setNewStatus] = useState<OrderStatus>("PENDING");
  const [description, setDescription] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courierCompany, setCourierCompany] = useState("");
  const [trackingLocation, setTrackingLocation] = useState("");

  // RTK Query hooks
  const { data: ordersData, isLoading } = useGetAllOrdersQuery({
    page: 1,
    limit: 100,
  });
  const [updateOrderStatus, { isLoading: isUpdating }] =
    useUpdateOrderStatusMutation();
  const [updateOrderLocation, { isLoading: isUpdatingLocation }] =
    useUpdateOrderLocationMutation();

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
        order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some((item) =>
          item.productName.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      const matchesStatus =
        statusFilter === "ALL" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const orderStats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "PENDING").length,
      confirmed: orders.filter((o) => o.status === "CONFIRMED").length,
      processing: orders.filter((o) => o.status === "PROCESSING").length,
      shipped: orders.filter((o) => o.status === "SHIPPED").length,
      delivered: orders.filter((o) => o.status === "DELIVERED").length,
      cancelled: orders.filter((o) => o.status === "CANCELLED").length,
    };
  }, [orders]);

  const handleOpenUpdateDialog = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setDescription("");
    setTrackingNumber(order.delivery?.trackingNumber || "");
    setCourierCompany(order.delivery?.courierCompany || "");
    setTrackingLocation("");
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder) return;

    try {
      await updateOrderStatus({
        id: selectedOrder.id,
        data: {
          status: newStatus,
          description: description || undefined,
          trackingNumber: trackingNumber || undefined,
          courierCompany: courierCompany || undefined,
          location: trackingLocation || undefined,
        },
      }).unwrap();

      toast.success("Order status updated!", {
        description: `Order #${selectedOrder.orderNumber} is now ${newStatus}`,
      });
      setIsUpdateDialogOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      toast.error("Failed to update order status", {
        description: extractErrorMessage(error),
      });
    }
  };

  const handleOpenLocationDialog = (order: Order) => {
    setSelectedOrder(order);
    setLocationInput("");
    setIsLocationDialogOpen(true);
  };

  const handleUpdateLocation = async () => {
    if (!selectedOrder || !locationInput.trim()) {
      toast.error("Please enter a location");
      return;
    }

    try {
      await updateOrderLocation({
        id: selectedOrder.id,
        location: locationInput.trim(),
      }).unwrap();

      toast.success("Location updated!", {
        description: `Order #${selectedOrder.orderNumber} location updated. Customer notified.`,
      });
      setIsLocationDialogOpen(false);
      setSelectedOrder(null);
      setLocationInput("");
    } catch (error) {
      toast.error("Failed to update location", {
        description: extractErrorMessage(error),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Management
          </h1>
          <p className="text-gray-600">Manage and update order statuses</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {orderStats.total}
              </div>
              <p className="text-xs text-gray-600">Total</p>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {orderStats.pending}
              </div>
              <p className="text-xs text-gray-600">Pending</p>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {orderStats.confirmed}
              </div>
              <p className="text-xs text-gray-600">Confirmed</p>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {orderStats.processing}
              </div>
              <p className="text-xs text-gray-600">Processing</p>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {orderStats.shipped}
              </div>
              <p className="text-xs text-gray-600">Shipped</p>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {orderStats.delivered}
              </div>
              <p className="text-xs text-gray-600">Delivered</p>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {orderStats.cancelled}
              </div>
              <p className="text-xs text-gray-600">Cancelled</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search by order number, customer, or product..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
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

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card className="bg-white/70 backdrop-blur-sm border-white/20">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-600">
                {statusFilter === "ALL"
                  ? "There are no orders yet."
                  : `There are no ${statusFilter.toLowerCase()} orders.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
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
                          {new Date(order.orderedAt).toLocaleDateString()} •{" "}
                          {order.items.length} item
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
                    {/* Customer Info */}
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Customer Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <p>
                          <span className="font-medium">Name:</span>{" "}
                          {order.user?.name || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span>{" "}
                          {order.user?.email || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Phone:</span>{" "}
                          {order.shippingPhone}
                        </p>
                        <p>
                          <span className="font-medium">Address:</span>{" "}
                          {order.shippingAddress}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3 mb-6">
                      <h4 className="font-semibold text-gray-900">
                        Order Items
                      </h4>
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

                    {/* Payment & Delivery Info */}

                    {/* Notes */}
                    {order.notes && (
                      <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                        <h5 className="font-semibold text-gray-900 mb-1">
                          Customer Notes
                        </h5>
                        <p className="text-sm text-gray-700">{order.notes}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                      <Button
                        onClick={() => handleOpenLocationDialog(order)}
                        variant="outline"
                        className="text-blue-600 border-blue-600"
                      >
                        📍 Update Location
                      </Button>
                      <Button
                        onClick={() => handleOpenUpdateDialog(order)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Update Status
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Update Status Dialog */}
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Update Order Status</DialogTitle>
              <DialogDescription>
                Update the status of order #{selectedOrder?.orderNumber}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="status">Order Status</Label>
                <Select
                  value={newStatus}
                  onValueChange={(value) => setNewStatus(value as OrderStatus)}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Status Update Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Add a note about this status update..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trackingLocation">
                  Current Location/Address (Optional)
                </Label>
                <Input
                  id="trackingLocation"
                  placeholder="e.g., In Transit to Islamabad, Warehouse - Karachi, etc."
                  value={trackingLocation}
                  onChange={(e) => setTrackingLocation(e.target.value)}
                />
              </div>

              {newStatus === "SHIPPED" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="trackingNumber">Tracking Number</Label>
                    <Input
                      id="trackingNumber"
                      placeholder="Enter tracking number"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="courierCompany">Courier Company</Label>
                    <Input
                      id="courierCompany"
                      placeholder="e.g., TCS, Leopards, M&P"
                      value={courierCompany}
                      onChange={(e) => setCourierCompany(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsUpdateDialogOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateOrderStatus}
                disabled={isUpdating}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {isUpdating ? "Updating..." : "Update Status"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Location Dialog */}
        <Dialog
          open={isLocationDialogOpen}
          onOpenChange={setIsLocationDialogOpen}
        >
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Update Order Location</DialogTitle>
              <DialogDescription>
                Update the current location of order #
                {selectedOrder?.orderNumber}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="location">Current Location/Address</Label>
                <Input
                  id="location"
                  placeholder="e.g., Warehouse - Karachi, In Transit to Islamabad, Local Facility"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsLocationDialogOpen(false)}
                disabled={isUpdatingLocation}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateLocation}
                disabled={isUpdatingLocation}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {isUpdatingLocation ? "Updating..." : "Update Location"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
// <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
//                       <div>
//                         <h5 className="font-semibold text-gray-900 mb-2">
//                           Payment
//                         </h5>
//                         <p className="text-sm">
//                           <span className="font-medium">Method:</span>{" "}
//                           {order.payment?.method || "N/A"}
//                         </p>
//                         <p className="text-sm">
//                           <span className="font-medium">Status:</span>{" "}
//                           <Badge
//                             className={
//                               order.payment?.status === "COMPLETED"
//                                 ? "bg-green-100 text-green-800"
//                                 : "bg-yellow-100 text-yellow-800"
//                             }
//                           >
//                             {order.payment?.status || "N/A"}
//                           </Badge>
//                         </p>
//                       </div>
//                       <div>
//                         <h5 className="font-semibold text-gray-900 mb-2">
//                           Delivery
//                         </h5>
//                         <p className="text-sm">
//                           <span className="font-medium">Status:</span>{" "}
//                           <Badge>{order.delivery?.status || "N/A"}</Badge>
//                         </p>
//                         {order.delivery?.courierCompany && (
//                           <p className="text-sm">
//                             <span className="font-medium">Courier:</span>{" "}
//                             {order.delivery.courierCompany}
//                           </p>
//                         )}
//                       </div>
//                     </div>

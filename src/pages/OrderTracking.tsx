import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, RefreshCw, MapPin, Phone } from "lucide-react";
import {
  useGetOrderTrackingQuery,
  useGetOrderByIdQuery,
} from "../services/api/orderApi";
import { OrderTracking } from "../services/api/orderApi";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { TrackingTimeline } from "../components/TrackingTimeline";

interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  location: string;
  timestamp: string;
  isCompleted: boolean;
}

export const OrderTracking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orderId = id ? parseInt(id, 10) : 0;

  // Fetch order and tracking data from API
  const { data: orderResponse, isLoading: orderLoading } = useGetOrderByIdQuery(
    orderId,
    {
      skip: !orderId,
    },
  );

  const {
    data: trackingResponse,
    isLoading: trackingLoading,
    refetch: refetchTracking,
  } = useGetOrderTrackingQuery(orderId, {
    skip: !orderId,
  });

  const order = orderResponse?.data;
  const trackingData = trackingResponse?.data;

  // Convert backend OrderTracking[] to TrackingEvent[] format
  const trackingEvents: TrackingEvent[] = trackingData?.trackingHistory
    ? trackingData.trackingHistory.map(
        (tracking: OrderTracking, index: number) => ({
          id: tracking.id?.toString() || `tracking-${index}`,
          status: tracking.status,
          description:
            tracking.description ||
            `Order status updated to ${tracking.status}`,
          location: tracking.location || "Not specified",
          timestamp: tracking.createdAt || "",
          isCompleted: index < (trackingData.trackingHistory?.length || 0),
        }),
      )
    : [];

  const handleRefresh = async () => {
    await refetchTracking();
  };

  const getProgressPercentage = () => {
    return trackingEvents.length > 0
      ? (trackingEvents.filter((e) => e.isCompleted).length /
          trackingEvents.length) *
          100
      : 0;
  };

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("delivered")) return "bg-green-100 text-green-800";
    if (lowerStatus.includes("shipped") || lowerStatus.includes("transit"))
      return "bg-blue-100 text-blue-800";
    if (
      lowerStatus.includes("processing") ||
      lowerStatus.includes("production")
    )
      return "bg-purple-100 text-purple-800";
    if (lowerStatus.includes("confirmed"))
      return "bg-indigo-100 text-indigo-800";
    return "bg-gray-100 text-gray-800";
  };

  if (orderLoading || trackingLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="bg-gray-200 rounded-lg h-32 animate-pulse" />
            <div className="bg-gray-200 rounded-lg h-64 animate-pulse" />
            <div className="bg-gray-200 rounded-lg h-48 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Order not found
          </h1>
          <p className="text-gray-600 mb-6">
            The order you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/orders")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
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
            <Button
              variant="ghost"
              onClick={() => navigate("/orders")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
            <p className="text-gray-600">
              Track your order #{order.orderNumber}
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Order Summary */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <CardTitle className="flex items-center space-x-3">
                  <span>Order #{order.orderNumber}</span>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Placed on{" "}
                  {new Date(
                    order.createdAt || order.orderedAt,
                  ).toLocaleDateString()}
                </CardDescription>
              </div>
              <div className="text-right mt-4 sm:mt-0">
                <div className="text-2xl font-bold text-blue-600">
                  $
                  {typeof order.totalAmount === "string"
                    ? parseFloat(order.totalAmount).toFixed(2)
                    : order.totalAmount?.toFixed(2)}
                </div>
                {trackingData?.delivery?.trackingNumber && (
                  <p className="text-sm text-gray-600">
                    Tracking: {trackingData.delivery.trackingNumber}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Shipping Address
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{order.shippingAddress}</p>
                  {order.shippingPhone && (
                    <p className="flex items-center mt-2">
                      <Phone className="w-3 h-3 mr-2" />
                      {order.shippingPhone}
                    </p>
                  )}
                </div>
              </div>

              {/* Payment & Delivery Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Order Details
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Payment Status:</span>{" "}
                    <Badge variant="outline" className="ml-2 text-xs">
                      {order.payment?.status || "N/A"}
                    </Badge>
                  </p>
                  <p>
                    <span className="font-medium">Items:</span>{" "}
                    {order.items?.length || 0}
                  </p>
                  {trackingData?.delivery?.courierCompany && (
                    <p>
                      <span className="font-medium">Courier:</span>{" "}
                      {trackingData.delivery.courierCompany}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tracking Timeline */}
        {trackingEvents.length > 0 ? (
          <Card className="bg-white/70 backdrop-blur-sm border-white/20 mb-8">
            <CardHeader>
              <CardTitle>Tracking Progress</CardTitle>
              <CardDescription>
                Follow your order's journey from our studio to your door
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Order Progress</span>
                  <span>{Math.round(getProgressPercentage())}% Complete</span>
                </div>
                <Progress value={getProgressPercentage()} className="h-2" />
              </div>
              <TrackingTimeline events={trackingEvents} />
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/70 backdrop-blur-sm border-white/20 mb-8">
            <CardContent className="py-8">
              <p className="text-center text-gray-600">
                No tracking updates available yet. Check back soon!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <Card className="bg-white/70 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                  >
                    {item.product?.images && item.product.images.length > 0 && (
                      <ImageWithFallback
                        src={item.product.images[0]}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {item.productName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} × $
                        {typeof item.unitPrice === "string"
                          ? item.unitPrice
                          : item.unitPrice?.toFixed(2)}
                      </p>
                      <p className="text-sm font-medium text-blue-600 mt-1">
                        $
                        {typeof item.totalPrice === "string"
                          ? item.totalPrice
                          : item.totalPrice?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

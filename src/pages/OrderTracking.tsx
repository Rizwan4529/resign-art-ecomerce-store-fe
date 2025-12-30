import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Package, Truck, CheckCircle, Clock, MapPin, Calendar, 
  ArrowLeft, Download, RefreshCw, Phone, Mail 
} from 'lucide-react';
import { Order } from '../types';
import { api } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Progress } from '../components/ui/progress';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

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
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock tracking events
  const trackingEvents: TrackingEvent[] = [
    {
      id: '1',
      status: 'Order Confirmed',
      description: 'Your order has been confirmed and is being prepared',
      location: 'ResinArt Studio',
      timestamp: '2024-01-20T10:00:00Z',
      isCompleted: true
    },
    {
      id: '2',
      status: 'In Production',
      description: 'Your custom resin art piece is being handcrafted',
      location: 'ResinArt Studio',
      timestamp: '2024-01-21T09:00:00Z',
      isCompleted: true
    },
    {
      id: '3',
      status: 'Quality Check',
      description: 'Your order has passed quality inspection',
      location: 'ResinArt Studio',
      timestamp: '2024-01-22T14:30:00Z',
      isCompleted: true
    },
    {
      id: '4',
      status: 'Shipped',
      description: 'Your package has been picked up by the carrier',
      location: 'Creative City, CC',
      timestamp: '2024-01-23T08:15:00Z',
      isCompleted: true
    },
    {
      id: '5',
      status: 'In Transit',
      description: 'Package is on its way to the destination',
      location: 'Distribution Center',
      timestamp: '2024-01-23T18:00:00Z',
      isCompleted: false
    },
    {
      id: '6',
      status: 'Out for Delivery',
      description: 'Package is out for delivery',
      location: 'Local Facility',
      timestamp: '',
      isCompleted: false
    },
    {
      id: '7',
      status: 'Delivered',
      description: 'Package has been delivered',
      location: 'Destination',
      timestamp: '',
      isCompleted: false
    }
  ];

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) return;
      
      try {
        // For demo, we'll use the first order from the orders list
        const orders = await api.getOrders();
        const foundOrder = orders.find(o => o.id === id);
        setOrder(foundOrder || null);
      } catch (error) {
        console.error('Failed to load order:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getProgressPercentage = () => {
    const completedEvents = trackingEvents.filter(event => event.isCompleted).length;
    return (completedEvents / trackingEvents.length) * 100;
  };

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('delivered')) return 'bg-green-100 text-green-800';
    if (lowerStatus.includes('shipped') || lowerStatus.includes('transit')) return 'bg-blue-100 text-blue-800';
    if (lowerStatus.includes('confirmed') || lowerStatus.includes('production')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
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
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h1>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/orders')}>
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
            <Button variant="ghost" onClick={() => navigate('/orders')} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
            <p className="text-gray-600">Track your order #{order.id}</p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Order Summary */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <CardTitle className="flex items-center space-x-3">
                  <span>Order #{order.id}</span>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </CardDescription>
              </div>
              <div className="text-right mt-4 sm:mt-0">
                <div className="text-2xl font-bold text-blue-600">
                  ${order.total.toFixed(2)}
                </div>
                {order.trackingNumber && (
                  <p className="text-sm text-gray-600">
                    Tracking: {order.trackingNumber}
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
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Order Details
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Payment Method: {order.paymentMethod}</p>
                  <p>Payment Status: 
                    <Badge variant="outline" className="ml-2 text-xs">
                      {order.paymentStatus}
                    </Badge>
                  </p>
                  <p>Items: {order.items.length}</p>
                  {order.shippingProvider && (
                    <p>Carrier: {order.shippingProvider}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tracking Progress */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 mb-8">
          <CardHeader>
            <CardTitle>Tracking Progress</CardTitle>
            <CardDescription>Follow your order's journey from our studio to your door</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Order Progress</span>
                <span>{Math.round(getProgressPercentage())}% Complete</span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>

            <div className="space-y-6">
              {trackingEvents.map((event, index) => (
                <div key={event.id} className="relative flex items-start space-x-4">
                  {/* Timeline Line */}
                  {index < trackingEvents.length - 1 && (
                    <div className="absolute left-4 top-8 w-px h-16 bg-gray-200" />
                  )}
                  
                  {/* Status Icon */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    event.isCompleted 
                      ? 'bg-green-500 text-white' 
                      : index === trackingEvents.findIndex(e => !e.isCompleted)
                        ? 'bg-blue-500 text-white animate-pulse'
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {event.isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : index === trackingEvents.findIndex(e => !e.isCompleted) ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <Package className="w-4 h-4" />
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <div>
                        <h4 className={`font-medium ${
                          event.isCompleted ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {event.status}
                        </h4>
                        <p className={`text-sm ${
                          event.isCompleted ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {event.description}
                        </p>
                        <p className={`text-xs ${
                          event.isCompleted ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {event.location}
                        </p>
                      </div>
                      {event.timestamp && (
                        <div className={`text-sm mt-2 sm:mt-0 ${
                          event.isCompleted ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {new Date(event.timestamp).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 mb-8">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <ImageWithFallback
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">{item.product.category}</p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} • ${item.product.price.toFixed(2)} each
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-lg">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${(order.total - (order.total * 0.08) - (order.total < 150 ? 9.99 : 0)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{order.total < 150 ? '$9.99' : 'Free'}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${(order.total * 0.08).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Need Help?</CardTitle>
            <CardDescription className="text-blue-700">
              Our customer support team is here to help you with any questions about your order.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                <Phone className="w-4 h-4 mr-2" />
                Call Support
              </Button>
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                <Mail className="w-4 h-4 mr-2" />
                Email Support
              </Button>
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                <Download className="w-4 h-4 mr-2" />
                Download Invoice
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
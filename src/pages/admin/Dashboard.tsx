import React from "react";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Bell,
} from "lucide-react";
import { ProductManagement } from "./ProductManagement";
import { OrderManagement } from "./OrderManagement";
import { UserManagement } from "./UserManagement";
import { InventoryManagement } from "./InventoryManagement";
import { ProfitManagement } from "./ProfitManagement";
import { NotificationManagement } from "./NotificationManagement";
import { ContactSubmissions } from "./ContactSubmissions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  useGetDashboardSummaryQuery,
  useGetDetailedProfitReportQuery,
} from "../../services/api/profitApi";
import { useGetProductsQuery } from "../../services/api/productApi";
import { useGetUsersQuery } from "../../services/api/userApi";

export const AdminDashboard = () => {
  // RTK Query hooks for real data
  const { data: dashboardData, isLoading: isDashboardLoading } =
    useGetDashboardSummaryQuery();
  const { data: productsData, isLoading: isProductsLoading } =
    useGetProductsQuery({});
  const { data: usersData, isLoading: isUsersLoading } = useGetUsersQuery({
    page: 1,
    limit: 1,
  });
  const { data: profitData, isLoading: isProfitLoading } =
    useGetDetailedProfitReportQuery({
      year: new Date().getFullYear(),
    });

  const loading =
    isDashboardLoading ||
    isProductsLoading ||
    isUsersLoading ||
    isProfitLoading;

  const dashboard = dashboardData?.data;
  const products = productsData?.data || [];
  const totalProducts = productsData?.pagination?.totalItems || 0;
  const totalUsers = usersData?.pagination?.totalItems || 0;

  // Prepare monthly revenue chart data from profit report
  const monthlyRevenueData =
    profitData?.data?.monthly.map((month) => ({
      month: month.monthName.slice(0, 3),
      revenue: month.income,
    })) || [];

  // Find top products by rating
  const topProducts = [...products]
    .filter(
      (p) => p.averageRating && parseFloat(p.averageRating.toString()) > 0,
    )
    .sort(
      (a, b) =>
        parseFloat(b.averageRating?.toString() || "0") -
        parseFloat(a.averageRating?.toString() || "0"),
    )
    .slice(0, 5);

  // Find low stock products
  const lowStockProducts = products.filter((p) => p.stock <= 10 && p.isActive);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-lg h-32 animate-pulse"
              />
            ))}
          </div>
          <div className="bg-gray-200 rounded-lg h-96 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Failed to load dashboard
          </h1>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage your ResinArt business</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rs.{" "}
                {dashboard.monthlyRevenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                This month's revenue
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboard.totalOrders.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboard.pendingOrders} pending
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalProducts.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboard.lowStockAlerts} low stock alerts
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalUsers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboard.newUsersThisMonth} new this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid grid-cols-8 lg:w-full">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle>Monthly Revenue</CardTitle>
                  <CardDescription>
                    Revenue trends over the last 12 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`Rs. ${value}`, "Revenue"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: "#3b82f6" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Products */}
              <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                  <CardDescription>
                    Best performing products by rating
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topProducts.length > 0 ? (
                      topProducts.map((product, index) => (
                        <div
                          key={product.id}
                          className="flex items-center space-x-4"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                            #{index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-600">
                              {product.discountPrice ? (
                                <>
                                  <span className="text-green-600 font-medium">
                                    Rs.{" "}
                                    {typeof product.discountPrice === "string"
                                      ? product.discountPrice
                                      : product.discountPrice.toFixed(2)}
                                  </span>
                                  <span className="line-through ml-2">
                                    Rs.{" "}
                                    {typeof product.price === "string"
                                      ? product.price
                                      : product.price.toFixed(2)}
                                  </span>
                                </>
                              ) : (
                                <>
                                  Rs.{" "}
                                  {typeof product.price === "string"
                                    ? product.price
                                    : product.price.toFixed(2)}
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {parseFloat(
                                product.averageRating?.toString() || "0",
                              ).toFixed(1)}{" "}
                              ★
                            </div>
                            <div className="text-sm text-gray-600">
                              {product.totalReviews || 0} reviews
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        No rated products yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Low Stock Alert */}
            {lowStockProducts.length > 0 && (
              <Card className="bg-orange-50 border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-800">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Low Stock Alert
                  </CardTitle>
                  <CardDescription className="text-orange-700">
                    Products running low on inventory
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lowStockProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-600">
                            {product.category.replace("_", " ")}
                          </div>
                        </div>
                        <Badge variant="destructive">
                          {product.stock} left
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <OrderManagement />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <InventoryManagement />
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial">
            <ProfitManagement />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <NotificationManagement />
          </TabsContent>

          {/* Contact Submissions Tab */}
          <TabsContent value="contact">
            <ContactSubmissions />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

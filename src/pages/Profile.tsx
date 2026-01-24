import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Eye,
  EyeOff,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCurrentUser,
  updateUser,
  updateToken,
} from "../store/slices/authSlice";
import {
  useChangePasswordMutation,
  useUpdateProfileMutation,
  useUploadProfilePictureMutation,
  useDeleteAccountMutation,
} from "../services/api/authApi";
import { useGetMyOrdersQuery } from "../services/api/orderApi";
import { extractErrorMessage } from "../utils/authHelpers";
import { getImageUrl } from "../utils/imageUtils";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Link, useNavigate } from "react-router-dom";
import { logout as logoutAction } from "../store/slices/authSlice";

export const Profile = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [changePasswordMutation, { isLoading: isChangingPass }] =
    useChangePasswordMutation();
  const [updateProfileMutation, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();
  const [uploadProfilePictureMutation, { isLoading: isUploadingPicture }] =
    useUploadProfilePictureMutation();
  const [deleteAccountMutation, { isLoading: isDeletingAccount }] =
    useDeleteAccountMutation();

  // Fetch user's orders from the server
  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    error: ordersError,
  } = useGetMyOrdersQuery();

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street, Pakistan",
    birthday: "1990-01-01",
  });
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        birthday: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
      });
    }
  }, [user]);

  console.log(profileData);

  const handleInputChange = (field: string, value: string) => {
    // Validate phone number to only allow digits and common phone formatting characters
    if (field === "phone") {
      // Only allow numbers, spaces, +, -, (, )
      const phoneRegex = /^[0-9+\-() ]*$/;
      if (!phoneRegex.test(value)) {
        return; // Don't update if invalid characters are entered
      }
      // Check max 13 digits
      const digitCount = value.replace(/\D/g, "").length;
      if (digitCount > 13) {
        return; // Don't update if more than 13 digits
      }
    }
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const digitCount = profileData.phone.replace(/\D/g, "").length;
      if (digitCount < 7) {
        toast.warning("Phone No cannot be less than 7 digits");
        return;
      }
      const response = await updateProfileMutation({
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
        dateOfBirth: profileData.birthday,
      }).unwrap();

      // Update user in Redux and localStorage (backend returns data, not data.user)
      dispatch(updateUser(response.data));

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile", {
        description: extractErrorMessage(error),
      });
    }
  };

  const handleProfilePictureChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const response = await uploadProfilePictureMutation(formData).unwrap();

      // Update user in Redux and localStorage (backend returns data.user for picture upload)
      dispatch(updateUser(response.data.user));

      toast.success("Profile picture updated successfully!");
    } catch (error) {
      toast.error("Failed to upload profile picture", {
        description: extractErrorMessage(error),
      });
    }
  };

  const handleCancel = () => {
    // Reset form data
    setProfileData({
      name: user?.name || "",
      email: user?.email || "",
      phone: "+1 (555) 123-4567",
      address: "123 Main Street, New York, NY 10001",
      birthday: "1990-01-01",
    });
    setIsEditing(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    // Validation
    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    try {
      const response = await changePasswordMutation({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      }).unwrap();

      // Update token in Redux
      if (response.data.token) {
        dispatch(updateToken(response.data.token));
      }

      // Show success message
      setPasswordSuccess("Password changed successfully!");

      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Close form after 2 seconds
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordSuccess("");
      }, 2000);
    } catch (err: any) {
      setPasswordError(extractErrorMessage(err));
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await deleteAccountMutation().unwrap();

      toast.success(response.message || "Account deleted successfully");

      // Logout and redirect to home
      dispatch(logoutAction());
      navigate("/");
    } catch (error) {
      toast.error("Failed to delete account", {
        description: extractErrorMessage(error),
      });
    } finally {
      setShowDeleteDialog(false);
    }
  };

  // Get orders from server data
  const orders = ordersData?.data || [];

  // Calculate total spent from real orders
  const totalSpent = orders.reduce((sum, order) => {
    const amount =
      typeof order.totalAmount === "string"
        ? parseFloat(order.totalAmount)
        : order.totalAmount;
    return sum + amount;
  }, 0);

  const preferences = [
    { label: "Email Newsletters", enabled: true },
    { label: "SMS Notifications", enabled: false },
    { label: "Order Updates", enabled: true },
    { label: "New Product Alerts", enabled: true },
    { label: "Promotional Offers", enabled: false },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to view your profile
          </h1>
          <Button onClick={() => (window.location.href = "/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-white/70 backdrop-blur-sm border-white/20 sticky top-8">
              <CardContent className="p-6 text-center">
                {/* Avatar */}
                <div className="relative mb-6">
                  {user?.profileImage ? (
                    <div className="w-24 h-24 rounded-full mx-auto overflow-hidden border-4 border-white shadow-lg">
                      <ImageWithFallback
                        src={user.profileImage}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto text-white text-2xl font-bold">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <input
                    type="file"
                    id="profile-picture"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePictureChange}
                    disabled={isUploadingPicture}
                  />
                  <label
                    htmlFor="profile-picture"
                    className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-1/2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                  </label>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {profileData.name}
                </h3>
                <p className="text-gray-600 mb-2">{user.email}</p>
                <Badge
                  variant={user.role === "admin" ? "default" : "secondary"}
                >
                  {user.role}
                </Badge>

                <Separator className="my-6" />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Member since</span>
                    <span className="font-medium">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })
                        : "Jan 2024"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total orders</span>
                    <span className="font-medium">{orders.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total spent</span>
                    <span className="font-medium">
                      ${totalSpent.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid grid-cols-4 lg:w-[500px]">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              {/* Personal Information */}
              <TabsContent value="personal">
                <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                          Update your personal details
                        </CardDescription>
                      </div>
                      {!isEditing ? (
                        <Button
                          onClick={() => setIsEditing(true)}
                          variant="outline"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      ) : (
                        <div className="space-x-2">
                          <Button
                            onClick={handleSave}
                            size="sm"
                            disabled={isUpdatingProfile}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {isUpdatingProfile ? "Saving..." : "Save"}
                          </Button>
                          <Button
                            onClick={handleCancel}
                            variant="outline"
                            size="sm"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        {isEditing ? (
                          <Input
                            id="name"
                            value={profileData.name}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                          />
                        ) : (
                          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                            <User className="w-4 h-4 text-gray-500" />
                            <span>{profileData.name}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        {/* Email is always read-only (cannot be changed) */}
                        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span>{profileData.email}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Email cannot be changed
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        {isEditing ? (
                          <Input
                            id="phone"
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                            placeholder="+1 (555) 123-4567"
                            pattern="[0-9+\-() ]*"
                            title="Phone number can contain up to 13 digits"
                            maxLength={20}
                          />
                        ) : (
                          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span>{profileData.phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="birthday">Birthday</Label>
                        {isEditing ? (
                          <Input
                            id="birthday"
                            type="date"
                            value={profileData.birthday}
                            max={today}
                            onChange={(e) =>
                              handleInputChange("birthday", e.target.value)
                            }
                          />
                        ) : (
                          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>
                              {new Date(
                                profileData.birthday,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      {isEditing ? (
                        <Input
                          id="address"
                          value={profileData.address}
                          onChange={(e) =>
                            handleInputChange("address", e.target.value)
                          }
                        />
                      ) : (
                        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span>{profileData.address}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Order History */}
              <TabsContent value="orders">
                <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>
                      Your recent orders and purchases
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingOrders ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Loading orders...</p>
                      </div>
                    ) : ordersError ? (
                      <div className="text-center py-8">
                        <p className="text-red-500">Failed to load orders</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No orders yet</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4">
                          {orders.map((order) => {
                            const orderTotal =
                              typeof order.totalAmount === "string"
                                ? parseFloat(order.totalAmount)
                                : order.totalAmount;
                            const itemCount = order.items?.length || 0;

                            return (
                              <div
                                key={order.id}
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <div>
                                  <div className="flex items-center space-x-4">
                                    <div>
                                      <p className="font-medium">
                                        Order #{order.orderNumber}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {new Date(
                                          order.createdAt,
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <Badge
                                      variant={
                                        order.status === "DELIVERED"
                                          ? "default"
                                          : "secondary"
                                      }
                                      className={
                                        order.status === "DELIVERED"
                                          ? "bg-green-100 text-green-800"
                                          : order.status === "CANCELLED"
                                            ? "bg-red-100 text-red-800"
                                            : order.status === "SHIPPED"
                                              ? "bg-blue-100 text-blue-800"
                                              : ""
                                      }
                                    >
                                      {order.status}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">
                                    ${orderTotal.toFixed(2)}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {itemCount} item{itemCount !== 1 ? "s" : ""}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {orders.length > 3 && (
                          <div className="mt-6 text-center">
                            <Button variant="outline" asChild>
                              <Link to="/orders">View All Orders</Link>
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preferences */}

              {/* Security */}
              <TabsContent value="security">
                <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage your account security
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      {/* Password Change Section */}
                      {!isChangingPassword ? (
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <h4 className="font-medium">Password</h4>
                            <p className="text-sm text-gray-600">
                              Keep your account secure
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => setIsChangingPassword(true)}
                          >
                            Change Password
                          </Button>
                        </div>
                      ) : (
                        <div className="p-4 border border-gray-200 rounded-lg space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Change Password</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setIsChangingPassword(false);
                                setPasswordError("");
                                setPasswordSuccess("");
                                setPasswordData({
                                  currentPassword: "",
                                  newPassword: "",
                                  confirmPassword: "",
                                });
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>

                          {passwordError && (
                            <Alert variant="destructive">
                              <AlertDescription>
                                {passwordError}
                              </AlertDescription>
                            </Alert>
                          )}

                          {passwordSuccess && (
                            <Alert className="bg-green-50 border-green-200">
                              <AlertDescription className="text-green-800">
                                {passwordSuccess}
                              </AlertDescription>
                            </Alert>
                          )}

                          <form
                            onSubmit={handlePasswordChange}
                            className="space-y-4"
                          >
                            <div className="space-y-2">
                              <Label htmlFor="currentPassword">
                                Current Password
                              </Label>
                              <div className="relative">
                                <Input
                                  id="currentPassword"
                                  type={
                                    showPasswords.current ? "text" : "password"
                                  }
                                  value={passwordData.currentPassword}
                                  onChange={(e) =>
                                    setPasswordData((prev) => ({
                                      ...prev,
                                      currentPassword: e.target.value,
                                    }))
                                  }
                                  placeholder="Enter current password"
                                  required
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3"
                                  onClick={() =>
                                    setShowPasswords((prev) => ({
                                      ...prev,
                                      current: !prev.current,
                                    }))
                                  }
                                >
                                  {showPasswords.current ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="newPassword">New Password</Label>
                              <div className="relative">
                                <Input
                                  id="newPassword"
                                  type={showPasswords.new ? "text" : "password"}
                                  value={passwordData.newPassword}
                                  onChange={(e) =>
                                    setPasswordData((prev) => ({
                                      ...prev,
                                      newPassword: e.target.value,
                                    }))
                                  }
                                  placeholder="Enter new password"
                                  required
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3"
                                  onClick={() =>
                                    setShowPasswords((prev) => ({
                                      ...prev,
                                      new: !prev.new,
                                    }))
                                  }
                                >
                                  {showPasswords.new ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="confirmPassword">
                                Confirm New Password
                              </Label>
                              <div className="relative">
                                <Input
                                  id="confirmPassword"
                                  type={
                                    showPasswords.confirm ? "text" : "password"
                                  }
                                  value={passwordData.confirmPassword}
                                  onChange={(e) =>
                                    setPasswordData((prev) => ({
                                      ...prev,
                                      confirmPassword: e.target.value,
                                    }))
                                  }
                                  placeholder="Confirm new password"
                                  required
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3"
                                  onClick={() =>
                                    setShowPasswords((prev) => ({
                                      ...prev,
                                      confirm: !prev.confirm,
                                    }))
                                  }
                                >
                                  {showPasswords.confirm ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <Button type="submit" disabled={isChangingPass}>
                                {isChangingPass
                                  ? "Changing..."
                                  : "Change Password"}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setIsChangingPassword(false);
                                  setPasswordError("");
                                  setPasswordSuccess("");
                                  setPasswordData({
                                    currentPassword: "",
                                    newPassword: "",
                                    confirmPassword: "",
                                  });
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2">
                        Danger Zone
                      </h4>
                      <p className="text-sm text-red-700 mb-4">
                        Once you delete your account, there is no going back.
                        Please be certain.
                      </p>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Delete Account Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Account</DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete your account? This
                action cannot be undone and will remove all your data including
                orders, reviews, and cart items.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeletingAccount}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
              >
                {isDeletingAccount ? "Deleting..." : "Delete Account"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

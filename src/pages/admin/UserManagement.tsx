import React, { useState } from "react";
import { Key, Ban, Check } from "lucide-react";
import { toast } from "sonner";
import {
  useGetUsersQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
  useResetUserPasswordMutation,
} from "../../services/api/userApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { extractErrorMessage } from "../../utils/authHelpers";

interface ResetPasswordDialog {
  isOpen: boolean;
  userId: number | null;
  userName: string;
}

export const UserManagement = () => {
  const [page, setPage] = useState(1);
  const [resetPasswordDialog, setResetPasswordDialog] =
    useState<ResetPasswordDialog>({
      isOpen: false,
      userId: null,
      userName: "",
    });
  const [newPassword, setNewPassword] = useState("");

  const {
    data: usersData,
    isLoading,
    refetch,
  } = useGetUsersQuery({ page, limit: 10 });
  const [blockUser, { isLoading: isBlocking }] = useBlockUserMutation();
  const [unblockUser, { isLoading: isUnblocking }] = useUnblockUserMutation();
  const [resetPassword, { isLoading: isResetting }] =
    useResetUserPasswordMutation();

  const users = usersData?.data || [];
  const pagination = usersData?.pagination;

  const handleBlockUser = async (userId: number, userName: string) => {
    try {
      await blockUser({ id: userId }).unwrap();
      toast.success(`User "${userName}" has been blocked`);
      refetch();
    } catch (err: any) {
      toast.error("Failed to block user", {
        description: extractErrorMessage(err),
      });
    }
  };

  const handleUnblockUser = async (userId: number, userName: string) => {
    try {
      await unblockUser({ id: userId }).unwrap();
      toast.success(`User "${userName}" has been unblocked`);
      refetch();
    } catch (err: any) {
      toast.error("Failed to unblock user", {
        description: extractErrorMessage(err),
      });
    }
  };

  const openResetPasswordDialog = (userId: number, userName: string) => {
    setResetPasswordDialog({
      isOpen: true,
      userId,
      userName,
    });
    setNewPassword("");
  };

  const closeResetPasswordDialog = () => {
    setResetPasswordDialog({
      isOpen: false,
      userId: null,
      userName: "",
    });
    setNewPassword("");
  };

  const handleResetPassword = async () => {
    if (!resetPasswordDialog.userId) return;

    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      await resetPassword({
        id: resetPasswordDialog.userId,
        newPassword,
      }).unwrap();

      toast.success(
        `Password reset successfully for "${resetPasswordDialog.userName}"`,
      );
      closeResetPasswordDialog();
      refetch();
    } catch (err: any) {
      toast.error("Failed to reset password", {
        description: extractErrorMessage(err),
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-white/20">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading users...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white/70 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage registered users and reset passwords
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-600">No users found</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {user.profileImage ? (
                            <img
                              src={`${import.meta.env.VITE_API_URL}${user.profileImage}`}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="font-medium">{user.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "ADMIN" ? "default" : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === "BLOCKED"
                              ? "destructive"
                              : "default"
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {user.role !== "ADMIN" && (
                          <div className="flex justify-end gap-2">
                            {/* Reset Password Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                openResetPasswordDialog(user.id, user.name)
                              }
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Key className="w-4 h-4" />
                            </Button>

                            {/* Block/Unblock Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                user.status === "BLOCKED"
                                  ? handleUnblockUser(user.id, user.name)
                                  : handleBlockUser(user.id, user.name)
                              }
                              disabled={isBlocking || isUnblocking}
                              className={
                                user.status === "BLOCKED"
                                  ? "text-green-600 hover:text-green-700"
                                  : "text-red-600 hover:text-red-700"
                              }
                            >
                              {user.status === "BLOCKED" ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Ban className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages} (
                    {pagination.totalItems} total users)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.currentPage === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Reset Password Dialog */}
      <Dialog
        open={resetPasswordDialog.isOpen}
        onOpenChange={(open) => !open && closeResetPasswordDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for{" "}
              <span className="font-semibold">
                {resetPasswordDialog.userName}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isResetting}
              />
              <p className="text-sm text-gray-500">
                The user will be able to log in with this password immediately.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeResetPasswordDialog}
              disabled={isResetting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={isResetting || !newPassword}
            >
              {isResetting ? "Resetting..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

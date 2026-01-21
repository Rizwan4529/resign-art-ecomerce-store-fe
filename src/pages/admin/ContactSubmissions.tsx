import React, { useState } from "react";
import { Trash2, Mail, Phone, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
  useGetContactsQuery,
  useDeleteContactMutation,
  ContactSubmission,
} from "../../services/api/contactApi";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { extractErrorMessage } from "../../utils/authHelpers";

export const ContactSubmissions = () => {
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const {
    data: contactsData,
    isLoading,
    refetch,
  } = useGetContactsQuery({ page, limit: 10 });
  const [deleteContact, { isLoading: isDeleting }] = useDeleteContactMutation();

  const contacts = contactsData?.data || [];
  const pagination = contactsData?.pagination;

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteContact(deleteId).unwrap();
      toast.success("Contact submission deleted successfully");
      setDeleteId(null);
      refetch();
    } catch (error: any) {
      toast.error("Failed to delete contact", {
        description: extractErrorMessage(error),
      });
    }
  };

  const getInquiryTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      "General Inquiry": "bg-blue-100 text-blue-800",
      "Custom Order Request": "bg-purple-100 text-purple-800",
      "Product Question": "bg-green-100 text-green-800",
      "Shipping & Returns": "bg-orange-100 text-orange-800",
      "Wholesale Inquiry": "bg-pink-100 text-pink-800",
      "Partnership Opportunity": "bg-indigo-100 text-indigo-800",
      "Press & Media": "bg-red-100 text-red-800",
      Other: "bg-gray-100 text-gray-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-white/20">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading contact submissions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white/70 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle>Contact Form Submissions</CardTitle>
          <CardDescription>
            View and manage all customer contact submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium">No contact submissions yet</p>
              <p className="text-sm">
                Contact form submissions will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact: ContactSubmission) => (
                <div
                  key={contact.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Header row */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {contact.subject}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {contact.name}
                          </p>
                        </div>
                        <Badge
                          className={getInquiryTypeBadgeColor(
                            contact.inquiryType,
                          )}
                        >
                          {contact.inquiryType}
                        </Badge>
                      </div>

                      {/* Contact info */}
                      <div className="flex flex-wrap gap-4 mb-3 text-sm">
                        <a
                          href={`mailto:${contact.email}`}
                          className="flex items-center gap-2 text-blue-600 hover:underline"
                        >
                          <Mail className="w-4 h-4" />
                          {contact.email}
                        </a>
                        {contact.phone && (
                          <a
                            href={`tel:${contact.phone}`}
                            className="flex items-center gap-2 text-blue-600 hover:underline"
                          >
                            <Phone className="w-4 h-4" />
                            {contact.phone}
                          </a>
                        )}
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(contact.createdAt).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </div>
                      </div>

                      {/* Message */}
                      <div className="bg-gray-50 rounded-md p-3 mb-3">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {contact.message}
                        </p>
                      </div>
                    </div>

                    {/* Delete button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(contact.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages} (
                {pagination.totalItems} total submissions)
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
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact Submission?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contact submission? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

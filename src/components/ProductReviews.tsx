import React, { useState } from "react";
import { Star, ThumbsUp, Edit, Trash2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import {
  useGetProductReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  Review,
} from "../services/api/reviewApi";
import { useAppSelector } from "../store/hooks";
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from "../store/slices/authSlice";
import { extractErrorMessage } from "../utils/authHelpers";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface ProductReviewsProps {
  productId: number;
  productName: string;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  productName,
}) => {
  const [page, setPage] = useState(1);
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [isEditReviewOpen, setIsEditReviewOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);

  // Queries and mutations
  const {
    data: reviewsData,
    isLoading,
    refetch,
  } = useGetProductReviewsQuery({
    productId,
    page,
    limit: 10,
  });

  const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

  // Form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });

  // Check if current user has already reviewed
  const userReview = reviewsData?.data?.find(
    (review) => review.userId === currentUser?.id,
  );
  // Reset form
  const resetForm = () => {
    setReviewForm({ rating: 5, comment: "" });
  };

  // Handle create review
  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login to leave a review");
      return;
    }

    if (!reviewForm.comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    try {
      await createReview({
        productId,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      }).unwrap();

      toast.success("Review added successfully!");
      setIsAddReviewOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  // Handle update review
  const handleUpdateReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReview) return;

    try {
      await updateReview({
        reviewId: selectedReview.id,
        data: {
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        },
      }).unwrap();

      toast.success("Review updated successfully!");
      setIsEditReviewOpen(false);
      setSelectedReview(null);
      resetForm();
      refetch();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  // Handle delete review
  const handleDeleteReview = async () => {
    if (!selectedReview) return;

    try {
      await deleteReview(selectedReview.id).unwrap();
      toast.success("Review deleted successfully!");
      setIsDeleteDialogOpen(false);
      setSelectedReview(null);
      refetch();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  // Open edit dialog
  const openEditDialog = (review: Review) => {
    setSelectedReview(review);
    setReviewForm({
      rating: review.rating,
      comment: review.comment || "",
    });
    setIsEditReviewOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (review: Review) => {
    setSelectedReview(review);
    setIsDeleteDialogOpen(true);
  };

  // Render star rating
  const renderStars = (
    rating: number,
    interactive: boolean = false,
    onRatingChange?: (rating: number) => void,
  ) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:fill-yellow-300 hover:text-yellow-300" : ""}`}
            onClick={() =>
              interactive && onRatingChange && onRatingChange(star)
            }
          />
        ))}
      </div>
    );
  };

  // Calculate rating statistics
  const getRatingStats = () => {
    if (!reviewsData?.ratingDistribution) return null;

    const total = Object.values(reviewsData.ratingDistribution).reduce(
      (a, b) => a + b,
      0,
    );
    const average =
      Object.entries(reviewsData.ratingDistribution).reduce(
        (sum, [rating, count]) => sum + parseInt(rating) * count,
        0,
      ) / (total || 1);

    return { total, average: average.toFixed(1) };
  };

  const stats = getRatingStats();

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
          <CardDescription>{productName}</CardDescription>
        </CardHeader>
        <CardContent>
          {stats && (
            <div className="flex flex-col md:flex-row gap-6">
              {/* Average Rating */}
              <div className="flex flex-col items-center justify-center border-r pr-6">
                <div className="text-5xl font-bold">{stats.average}</div>
                <div className="flex mt-2">
                  {renderStars(Math.round(parseFloat(stats.average)))}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Based on {stats.total}{" "}
                  {stats.total === 1 ? "review" : "reviews"}
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count =
                    reviewsData?.ratingDistribution?.[
                      star as keyof typeof reviewsData.ratingDistribution
                    ] || 0;
                  const percentage =
                    stats.total > 0 ? (count / stats.total) * 100 : 0;

                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-sm w-8">{star} ★</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add Review Button */}
          {isAuthenticated && !userReview && (
            <div className="mt-6">
              <Button
                onClick={() => setIsAddReviewOpen(true)}
                className="w-full md:w-auto"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Write a Review
              </Button>
            </div>
          )}

          {/* User's Existing Review */}
          {userReview && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">Your Review</p>
                  {renderStars(userReview.rating)}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(userReview)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(userReview)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-700">{userReview.comment}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Posted on {formatDate(userReview.createdAt)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">Loading reviews...</div>
        ) : reviewsData?.data && reviewsData.data.length > 0 ? (
          <>
            {reviewsData.data.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    {/* User Avatar */}
                    <Avatar>
                      <AvatarImage
                        src={
                          import.meta.env.VITE_API_URL +
                            review.user.profileImage || undefined
                        }
                      />
                      <AvatarFallback>
                        {review.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Review Content */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{review.user.name}</p>
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 mt-2">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {reviewsData.pagination &&
              reviewsData.pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {reviewsData.pagination.currentPage} of{" "}
                    {reviewsData.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= reviewsData.pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">
                No reviews yet. Be the first to review!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Review Dialog */}
      <Dialog open={isAddReviewOpen} onOpenChange={setIsAddReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience with {productName}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateReview}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                {renderStars(reviewForm.rating, true, (rating) =>
                  setReviewForm({ ...reviewForm, rating }),
                )}
              </div>
              <div>
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium mb-2"
                >
                  Your Review
                </label>
                <Textarea
                  id="comment"
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, comment: e.target.value })
                  }
                  placeholder="Share your thoughts about this product..."
                  rows={5}
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddReviewOpen(false);
                  resetForm();
                }}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Submitting..." : "Submit Review"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Review Dialog */}
      <Dialog open={isEditReviewOpen} onOpenChange={setIsEditReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Your Review</DialogTitle>
            <DialogDescription>
              Update your review for {productName}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateReview}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                {renderStars(reviewForm.rating, true, (rating) =>
                  setReviewForm({ ...reviewForm, rating }),
                )}
              </div>
              <div>
                <label
                  htmlFor="edit-comment"
                  className="block text-sm font-medium mb-2"
                >
                  Your Review
                </label>
                <Textarea
                  id="edit-comment"
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, comment: e.target.value })
                  }
                  placeholder="Share your thoughts about this product..."
                  rows={5}
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditReviewOpen(false);
                  setSelectedReview(null);
                  resetForm();
                }}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Review"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your review? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedReview(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteReview}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, X, ShoppingBag, ArrowLeft, Heart } from "lucide-react";
import { toast } from "sonner";
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} from "../services/api/cartApi";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../store/slices/authSlice";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { extractErrorMessage } from "../utils/authHelpers";

export const Cart = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // RTK Query hooks
  const { data: cartData, isLoading } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeCartItem] = useRemoveFromCartMutation();
  const [clearCartMutation] = useClearCartMutation();

  const items = cartData?.data?.items || [];
  console.log("Items", items);
  const subtotal = parseFloat(cartData?.data?.summary?.subtotal || "0");

  // Calculate shipping and tax
  const shippingCost = subtotal >= 5000 ? 0 : 500; // Free shipping for orders >= 5000
  const taxRate = 0.08;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + shippingCost + taxAmount;

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    try {
      await updateCartItem({
        itemId,
        data: { quantity: newQuantity },
      }).unwrap();
    } catch (error) {
      toast.error("Failed to update quantity", {
        description: extractErrorMessage(error),
      });
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeCartItem({ itemId }).unwrap();
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item", {
        description: extractErrorMessage(error),
      });
    }
  };

  const handleClearCart = async () => {
    if (!confirm("Are you sure you want to clear your cart?")) return;

    try {
      await clearCartMutation().unwrap();
      toast.success("Cart cleared successfully");
    } catch (error) {
      toast.error("Failed to clear cart", {
        description: extractErrorMessage(error),
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-12 border border-white/20">
            <ShoppingBag className="w-24 h-24 mx-auto text-gray-400 mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Please log in
            </h1>
            <p className="text-gray-600 mb-8">
              You need to be logged in to view your cart.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Link to="/login">Log In</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-16">
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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-12 border border-white/20">
            <ShoppingBag className="w-24 h-24 mx-auto text-gray-400 mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any resin art pieces to your cart
              yet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Link to="/shop">Continue Shopping</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600">
              {items.length} item{items.length > 1 ? "s" : ""} in your cart
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card className="bg-white/70 backdrop-blur-sm border-white/20">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Items</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearCart}
                    className="text-red-600 hover:text-red-700"
                  >
                    Clear Cart
                  </Button>
                </div>

                <div className="space-y-6">
                  {items.map((item) => {
                    const itemPrice =
                      typeof item.priceAtTime === "string"
                        ? parseFloat(item.priceAtTime)
                        : item.priceAtTime;
                    const currentPrice =
                      typeof item.currentPrice === "string"
                        ? parseFloat(item.currentPrice)
                        : item.currentPrice;
                    const itemTotal =
                      typeof item.itemTotal === "string"
                        ? parseFloat(item.itemTotal)
                        : item.itemTotal;

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 rounded-lg"
                      >
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <Link to={`/product/${item.product.id}`}>
                            <ImageWithFallback
                              src={item.product.images?.[0] || ""}
                              alt={item.product.name}
                              className="w-24 h-24 object-cover rounded-lg hover:scale-105 transition-transform duration-200"
                            />
                          </Link>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row justify-between">
                            <div className="mb-4 sm:mb-0">
                              <Link
                                to={`/product/${item.product.id}`}
                                className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                              >
                                {item.product.name}
                              </Link>
                              <p className="text-gray-600 text-sm mt-1">
                                {item.product.category.replace("_", " ")}
                              </p>

                              {/* Stock Status */}
                              {item.inStock === false && (
                                <Badge variant="destructive" className="mt-2">
                                  Out of Stock
                                </Badge>
                              )}

                              {/* Customizations */}
                              {item.customization &&
                                Object.keys(item.customization).length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-sm text-gray-600">
                                      Customizations:
                                    </p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {Object.entries(item.customization).map(
                                        ([key, value]) => (
                                          <Badge
                                            key={key}
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            {key}: {String(value)}
                                          </Badge>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>

                            <div className="text-right">
                              <div className="text-xl font-bold text-blue-600 mb-2">
                                ${itemTotal.toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-600">
                                ${itemPrice.toFixed(2)} each
                              </div>
                              {currentPrice !== itemPrice && (
                                <div className="text-xs text-orange-600 mt-1">
                                  Price changed to ${currentPrice.toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Quantity Controls and Actions */}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-2">
                              <label className="text-sm font-medium">
                                Qty:
                              </label>
                              <div className="flex items-center border rounded-lg">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateQuantity(
                                      item.id,
                                      item.quantity - 1
                                    )
                                  }
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <span className="px-3 py-2 font-medium min-w-[3rem] text-center">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateQuantity(
                                      item.id,
                                      item.quantity + 1
                                    )
                                  }
                                  disabled={item.quantity >= item.product.stock}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                              {item.quantity >= item.product.stock && (
                                <span className="text-xs text-red-600">
                                  Max quantity reached
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 hover:text-blue-600"
                              >
                                <Heart className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-white/70 backdrop-blur-sm border-white/20 sticky top-8">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>
                      Subtotal ({cartData?.data?.summary?.totalItems || 0}{" "}
                      items)
                    </span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600">
                      {shippingCost === 0
                        ? "Free"
                        : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>

                  {subtotal < 5000 && (
                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                      Add ${(5000 - subtotal).toFixed(2)} more for free
                      shipping!
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Tax (8%)</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-blue-600">${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Link to="/checkout">Proceed to Checkout</Link>
                  </Button>

                  <Button variant="outline" asChild className="w-full">
                    <Link to="/shop">Continue Shopping</Link>
                  </Button>
                </div>

                {/* Security Features */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span>30-day return policy</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span>Expert customer service</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Recently Viewed or Recommended Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            You might also like
          </h2>
          <div className="text-center py-8 text-gray-600 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20">
            Recommended products would appear here based on cart items...
          </div>
        </div>
      </div>
    </div>
  );
};

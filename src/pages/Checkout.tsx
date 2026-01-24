import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Truck,
  Lock,
  ArrowLeft,
  MapPin,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from "../store/slices/authSlice";
import { useGetCartQuery } from "../services/api/cartApi";
import { useCreateOrderMutation } from "../services/api/orderApi";
import { extractErrorMessage } from "../utils/authHelpers";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { getFirstImageUrl } from "../utils/imageUtils";

export const Checkout = () => {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();

  // RTK Query hooks
  const { data: cartData, isLoading: isLoadingCart } = useGetCartQuery(
    undefined,
    {
      skip: !isAuthenticated,
    },
  );
  const [createOrder, { isLoading: isCreatingOrder }] =
    useCreateOrderMutation();

  const [step, setStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [notes, setNotes] = useState("");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  const items = cartData?.data?.items || [];
  const subtotal = parseFloat(cartData?.data?.summary?.subtotal || "0");
  const shippingCost = 500; // Fixed shipping cost of Rs. 200
  const taxRate = 0.08;
  const tax = subtotal * taxRate;
  const grandTotal = subtotal + shippingCost + tax;

  // Helper function to validate phone number (7-13 digits, not counting +)
  const isValidPhone = (phone: string) => {
    const digitCount = phone.replace(/\D/g, "").length;
    return digitCount >= 7 && digitCount <= 13;
  };

  const validateStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return (
          shippingAddress.trim() !== "" &&
          shippingPhone.trim() !== "" &&
          isValidPhone(shippingPhone)
        );
      case 2:
        if (paymentMethod === "CREDIT_CARD" || paymentMethod === "DEBIT_CARD") {
          return (
            cardDetails.number &&
            cardDetails.expiry &&
            cardDetails.cvv &&
            cardDetails.name
          );
        }
        return true;
      default:
        return false;
    }
  };

  // 5.5.1 Confirm Order
  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("Please log in to place an order");
      navigate("/login");
      return;
    }

    try {
      const orderData = await createOrder({
        shippingAddress,
        shippingPhone,
        paymentMethod,
        notes: notes || undefined,
      }).unwrap();

      toast.success("Order placed successfully!", {
        description: `Order #${orderData.data.orderNumber}`,
      });
      navigate(`/orders`);
    } catch (error) {
      toast.error("Failed to place order", {
        description: extractErrorMessage(error),
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Please log in
          </h1>
          <p className="text-gray-600 mb-8">
            You need to be logged in to checkout.
          </p>
          <Button
            asChild
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            <span onClick={() => navigate("/login")}>Log In</span>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoadingCart) {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Your cart is empty
          </h1>
          <p className="text-gray-600 mb-8">
            Add some items to your cart before checking out.
          </p>
          <Button
            asChild
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            <span onClick={() => navigate("/shop")}>Continue Shopping</span>
          </Button>
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
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600">
              Complete your order in a few simple steps
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate("/cart")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[
              { step: 1, title: "Shipping", icon: Truck },
              { step: 2, title: "Payment", icon: CreditCard },
            ].map(({ step: stepNum, title, icon: Icon }, index) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= stepNum
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step > stepNum ? "✓" : <Icon className="w-5 h-5" />}
                </div>
                <span
                  className={`ml-2 font-medium ${
                    step >= stepNum ? "text-blue-600" : "text-gray-600"
                  }`}
                >
                  {title}
                </span>
                {index < 1 && (
                  <div
                    className={`w-16 h-px mx-4 ${
                      step > stepNum ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Details */}
            {step === 1 && (
              <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="shippingAddress">
                      Full Shipping Address *
                    </Label>
                    <Textarea
                      id="shippingAddress"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Enter your complete shipping address (Street, City, State, ZIP Code, Country)"
                      rows={3}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Example: 123 Main St, Apt 4B, New York, NY 10001, USA
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="shippingPhone">
                      Contact Phone Number *
                    </Label>
                    <Input
                      id="shippingPhone"
                      type="tel"
                      value={shippingPhone}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow digits and + character, max 13 digits
                        const phoneRegex = /^[0-9+]*$/;
                        const digitCount = value.replace(/\D/g, "").length;
                        if (phoneRegex.test(value) && digitCount <= 13) {
                          setShippingPhone(value);
                        }
                      }}
                      placeholder="+923001234567"
                      title="Phone number can contain up to 13 digits"
                      maxLength={16}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any special delivery instructions..."
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!validateStep(1)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="COD" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="font-medium">Cash on Delivery</div>
                        <div className="text-sm text-gray-500">
                          Pay when you receive your order
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="CREDIT_CARD" id="credit" />
                      <Label htmlFor="credit" className="flex-1 cursor-pointer">
                        <div className="font-medium">Credit Card</div>
                        <div className="text-sm text-gray-500">
                          Pay securely with your credit card
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="DEBIT_CARD" id="debit" />
                      <Label htmlFor="debit" className="flex-1 cursor-pointer">
                        <div className="font-medium">Debit Card</div>
                        <div className="text-sm text-gray-500">
                          Pay securely with your debit card
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="EASYPAISA" id="easypaisa" />
                      <Label
                        htmlFor="easypaisa"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">Easypaisa</div>
                        <div className="text-sm text-gray-500">
                          Pay through Easypaisa mobile wallet
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="JAZZCASH" id="jazzcash" />
                      <Label
                        htmlFor="jazzcash"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">JazzCash</div>
                        <div className="text-sm text-gray-500">
                          Pay through JazzCash mobile wallet
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="BANK_TRANSFER" id="bank" />
                      <Label htmlFor="bank" className="flex-1 cursor-pointer">
                        <div className="font-medium">Bank Transfer</div>
                        <div className="text-sm text-gray-500">
                          Direct bank transfer
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {(paymentMethod === "CREDIT_CARD" ||
                    paymentMethod === "DEBIT_CARD") && (
                    <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Label htmlFor="cardName" className="mb-2">
                          Cardholder Name
                        </Label>
                        <Input
                          id="cardName"
                          value={cardDetails.name}
                          onChange={(e) =>
                            setCardDetails((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardNumber" className="mb-2">
                          Card Number
                        </Label>
                        <Input
                          id="cardNumber"
                          value={cardDetails.number}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Remove all non-digits
                            const digitsOnly = value.replace(/\D/g, "");
                            // Format with spaces every 4 digits
                            const formatted =
                              digitsOnly.match(/.{1,4}/g)?.join(" ") ||
                              digitsOnly;
                            // Limit to 16 digits (19 characters with spaces)
                            if (digitsOnly.length <= 16) {
                              setCardDetails((prev) => ({
                                ...prev,
                                number: formatted,
                              }));
                            }
                          }}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry" className="mb-2">
                            Expiry Date
                          </Label>
                          <Input
                            id="expiry"
                            value={cardDetails.expiry}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Remove all non-digits
                              const digitsOnly = value.replace(/\D/g, "");

                              // Validate month (01-12)
                              if (digitsOnly.length >= 1) {
                                const firstDigit = parseInt(digitsOnly[0], 10);
                                // First digit can only be 0 or 1
                                if (firstDigit > 1) {
                                  return;
                                }
                              }
                              if (digitsOnly.length >= 2) {
                                const month = parseInt(
                                  digitsOnly.slice(0, 2),
                                  10,
                                );
                                // Month must be between 01 and 12
                                if (month < 1 || month > 12) {
                                  return;
                                }
                              }

                              // Format as MM/YY
                              let formatted = digitsOnly;
                              if (digitsOnly.length >= 2) {
                                formatted =
                                  digitsOnly.slice(0, 2) +
                                  "/" +
                                  digitsOnly.slice(2, 4);
                              }
                              // Limit to 4 digits (5 characters with /)
                              if (digitsOnly.length <= 4) {
                                setCardDetails((prev) => ({
                                  ...prev,
                                  expiry: formatted,
                                }));
                              }
                            }}
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv" className="mb-2">
                            CVV
                          </Label>
                          <Input
                            id="cvv"
                            value={cardDetails.cvv}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Only allow digits
                              const digitsOnly = value.replace(/\D/g, "");
                              // Limit to 3 digits
                              if (digitsOnly.length <= 3) {
                                setCardDetails((prev) => ({
                                  ...prev,
                                  cvv: digitsOnly,
                                }));
                              }
                            }}
                            placeholder="123"
                            maxLength={3}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 text-blue-800">
                      <Lock className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Secure Payment
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 mt-1">
                      Your payment information is encrypted and secure
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={!validateStep(2) || isCreatingOrder}
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      {isCreatingOrder
                        ? "Processing..."
                        : `Place Order - Rs. ${grandTotal.toFixed(2)}`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-white/70 backdrop-blur-sm border-white/20 sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => {
                    const itemPrice =
                      typeof item.priceAtTime === "string"
                        ? parseFloat(item.priceAtTime)
                        : item.priceAtTime;
                    const itemTotal =
                      typeof item.itemTotal === "string"
                        ? parseFloat(item.itemTotal)
                        : item.itemTotal;
                    const fullSrc =
                      import.meta.env.VITE_API_URL + item.product.images?.[0];

                    return (
                      <div
                        key={item.id}
                        className="flex items-center space-x-3"
                      >
                        <ImageWithFallback
                          src={item.product.images?.[0]}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          Rs. {itemTotal.toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rs. {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Rs. {shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%)</span>
                    <span>Rs. {tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-blue-600">
                      Rs. {grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

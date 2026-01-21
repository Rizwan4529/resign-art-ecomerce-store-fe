import React, { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  Star,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Link } from "react-router-dom";
import { useSubmitContactMutation } from "../services/api/contactApi";
import { toast } from "sonner";
import { extractErrorMessage } from "../utils/authHelpers";

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [submitContact, { isLoading: isSubmitting }] =
    useSubmitContactMutation();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await submitContact({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        subject: formData.subject,
        message: formData.message,
        inquiryType: formData.inquiryType || "General Inquiry",
      }).unwrap();

      toast.success("Message sent successfully! We will get back to you soon.");
      setIsSubmitted(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          inquiryType: "",
        });
      }, 3000);
    } catch (error: any) {
      toast.error("Failed to send message", {
        description: extractErrorMessage(error),
      });
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Our Studio",
      details: ["123 Art Street", "Creative City", "Pakistan"],
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Phone,
      title: "Call Us",
      details: ["+92 (555) 123-4567", "+92 (555) 987-6543", "Mon-Fri 9AM-6PM"],
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Mail,
      title: "Email Us",
      details: [
        "hello@resinart.com",
        "support@resinart.com",
        "custom@resinart.com",
      ],
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: [
        "Monday - Friday: 9AM - 6PM",
        "Saturday: 10AM - 4PM",
        "Sunday: Closed",
      ],
      color: "from-orange-500 to-red-500",
    },
  ];

  const inquiryTypes = [
    "General Inquiry",
    "Custom Order Request",
    "Product Question",
    "Shipping & Returns",
    "Wholesale Inquiry",
    "Partnership Opportunity",
    "Press & Media",
    "Other",
  ];

  const faqs = [
    {
      question: "Do you create custom resin art pieces?",
      answer:
        "Yes! We specialize in custom resin art pieces. Contact us with your vision and we'll bring it to life.",
    },
    {
      question: "What is your typical turnaround time?",
      answer:
        "Standard pieces ship within 3-5 business days. Custom orders typically take 2-4 weeks depending on complexity.",
    },
    {
      question: "Do you ship internationally?",
      answer:
        "Currently we ship within the United States and Canada. International shipping is available for select items.",
    },
    {
      question: "What materials do you use?",
      answer:
        "We use only premium epoxy resin, high-quality pigments, and sustainable materials in all our creations.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div
          className="absolute inset-0 opacity-20 animate-pulse"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20px 20px, rgba(255,255,255,0.1) 2px, transparent 2px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Get In Touch
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Have a question, custom request, or just want to chat about resin
            art? We'd love to hear from you!
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 -mt-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <Card
                key={index}
                className="bg-white/80 backdrop-blur-sm border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${info.color} rounded-full flex items-center justify-center mx-auto mb-4`}
                  >
                    <info.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {info.title}
                  </h3>
                  <div className="space-y-1">
                    {info.details.map((detail, detailIndex) => (
                      <p key={detailIndex} className="text-sm text-gray-600">
                        {detail}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Send us a Message
                  </CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you within 24
                    hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <Alert className="bg-green-50 border-green-200">
                      <AlertDescription className="text-green-800">
                        Thank you for your message! We'll get back to you soon.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                            placeholder="Your full name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            placeholder="your.email@example.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Only allow digits and + character, max 13 digits
                              const phoneRegex = /^[0-9+]*$/;
                              const digitCount = value.replace(
                                /\D/g,
                                "",
                              ).length;
                              if (phoneRegex.test(value) && digitCount <= 13) {
                                handleInputChange("phone", value);
                              }
                            }}
                            placeholder="+92 (555) 123-4567"
                            title="Phone number can contain up to 13 digits"
                            maxLength={16}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="inquiryType">Inquiry Type</Label>
                          <Select
                            value={formData.inquiryType}
                            onValueChange={(value) =>
                              handleInputChange("inquiryType", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select inquiry type" />
                            </SelectTrigger>
                            <SelectContent>
                              {inquiryTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) =>
                            handleInputChange("subject", e.target.value)
                          }
                          placeholder="Brief description of your inquiry"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) =>
                            handleInputChange("message", e.target.value)
                          }
                          placeholder="Tell us more about your inquiry..."
                          rows={6}
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* FAQ Section */}
            <div className="space-y-6">
              <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>
                    Quick answers to common questions about our resin art
                    services
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
                    >
                      <h4 className="font-medium text-gray-900 mb-2">
                        {faq.question}
                      </h4>
                      <p className="text-gray-600 text-sm">{faq.answer}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Testimonial */}
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 italic mb-4">
                    "The team at ResinArt created the most beautiful custom
                    piece for our living room. The communication throughout the
                    process was excellent, and the final result exceeded our
                    expectations!"
                  </blockquote>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium mr-3">
                      JD
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Jessica Davis</p>
                      <p className="text-sm text-gray-600">Verified Customer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Response Time */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-green-800 mb-2">
                    Quick Response Guarantee
                  </h4>
                  <p className="text-sm text-green-700">
                    We respond to all inquiries within 24 hours during business
                    days
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Visit Our Studio
            </h2>
            <p className="text-xl text-gray-600">
              Come see our artisans at work and explore our collection in person
            </p>
          </div>

          <Card className="bg-white/70 backdrop-blur-sm border-white/20 overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Interactive Map
                </h3>
                <p className="text-gray-600 mb-4">
                  123 Art Street, Creative City, Pakistan
                </p>
                <Button variant="outline">Get Directions</Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Whether it's a custom piece or questions about our collection, we're
            here to help
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Request Custom Quote
            </Button>
            <Link to="/shop">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Browse Collection
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

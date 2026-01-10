import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Share2, Minus, Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Product, useGetProductByIdQuery, useGetProductsByCategoryQuery } from '../services/api/productApi';
import { useAddToCartMutation } from '../services/api/cartApi';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Product3DViewer } from '../components/Product/Product3DViewer';
import { ProductCard } from '../components/Product/ProductCard';
import { ProductReviews } from '../components/ProductReviews';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { extractErrorMessage } from '../utils/authHelpers';
import { getImageUrl } from '../utils/imageUtils';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // RTK Query hooks
  const { data: productData, isLoading, error } = useGetProductByIdQuery(Number(id), {
    skip: !id,
  });

  const product = productData?.data;

  // Load related products from same category
  const { data: relatedProductsData } = useGetProductsByCategoryQuery(
    {
      category: product?.category || '',
      limit: 5,
    },
    {
      skip: !product?.category,
    }
  );

  const relatedProducts = relatedProductsData?.data.filter((p) => p.id !== Number(id)) || [];

  // Handle error or missing product
  if (error || (!isLoading && !product)) {
    navigate('/shop');
    return null;
  }

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await addToCart({
        productId: product.id,
        quantity,
      }).unwrap();

      toast.success('Added to cart!', {
        description: `${quantity} x ${product.name}`,
      });
    } catch (error) {
      toast.error('Failed to add to cart', {
        description: extractErrorMessage(error),
      });
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    try {
      await addToCart({
        productId: product.id,
        quantity,
      }).unwrap();

      navigate('/checkout');
    } catch (error) {
      toast.error('Failed to add to cart', {
        description: extractErrorMessage(error),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
            <div className="bg-gray-200 rounded-xl h-96" />
            <div className="space-y-4">
              <div className="bg-gray-200 h-8 rounded" />
              <div className="bg-gray-200 h-6 rounded w-3/4" />
              <div className="bg-gray-200 h-20 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            {/* 3D Viewer */}
            <Product3DViewer images={product.images || []} productName={product.name} />

            {/* Thumbnail Images */}
            {product.images && product.images.length > 0 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <ImageWithFallback
                      src={getImageUrl(image)}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="secondary">{product.category}</Badge>
                {product.stock <= 5 && product.stock > 0 && (
                  <Badge variant="destructive">Only {product.stock} left!</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              {/* Rating and Reviews - only show if available */}
              {(product.averageRating && parseFloat(product.averageRating.toString()) > 0) || (product.totalReviews && product.totalReviews > 0) ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(parseFloat(product.averageRating?.toString() || '0'))
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">
                    {parseFloat(product.averageRating?.toString() || '0').toFixed(1)} ({product.totalReviews || 0} reviews)
                  </span>
                </div>
              ) : null}
            </div>

            <div className="text-3xl font-bold text-blue-600">
              ${typeof product.price === 'string' ? product.price : product.price.toFixed(2)}
            </div>

            <p className="text-gray-700 leading-relaxed justify-text">
              {product.description}
            </p>

            {/* Tags - only show if available */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="font-medium">Quantity:</label>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <span className="text-sm text-gray-600">
                  {product.stock} available
                </span>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || isAddingToCart}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0 || isAddingToCart}
                  variant="outline"
                  className="flex-1"
                >
                  {isAddingToCart ? 'Adding...' : 'Buy Now'}
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="details" className="mb-16">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Product Details</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold mb-4">Product Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong>Category:</strong> {product.category.replace('_', ' ')}
                </div>
                <div>
                  <strong>Stock:</strong> {product.stock} available
                </div>
                {product.brand && (
                  <div>
                    <strong>Brand:</strong> {product.brand}
                  </div>
                )}
                {product.averageRating && parseFloat(product.averageRating.toString()) > 0 && (
                  <div>
                    <strong>Rating:</strong> {parseFloat(product.averageRating.toString()).toFixed(1)}/5.0
                  </div>
                )}
                {product.createdAt && (
                  <div>
                    <strong>Created:</strong> {new Date(product.createdAt).toLocaleDateString()}
                  </div>
                )}
                {product.isFeatured && (
                  <div className="col-span-2">
                    <Badge variant="default">Featured Product</Badge>
                  </div>
                )}
                {product.isCustomizable && (
                  <div className="col-span-2">
                    <Badge variant="secondary">Customizable</Badge>
                  </div>
                )}
              </div>
              <Separator className="my-4" />
              <div>
                <strong>Materials:</strong> High-quality resin, pigments, and protective coating
              </div>
              <div className="mt-2">
                <strong>Care Instructions:</strong> Clean with a soft, damp cloth. Avoid harsh chemicals.
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <ProductReviews productId={product.id} productName={product.name} />
            </div>
          </TabsContent>

          <TabsContent value="shipping">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold mb-4">Shipping & Returns</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Shipping</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Free shipping on orders over $150</li>
                    <li>Standard shipping: 5-7 business days</li>
                    <li>Express shipping: 2-3 business days</li>
                    <li>Carefully packaged to prevent damage</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium">Returns</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>30-day return policy</li>
                    <li>Items must be in original condition</li>
                    <li>Free return shipping for defective items</li>
                    <li>Full refund or exchange available</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Palette, Home, Sofa, Gem, Package, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { api } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ProductCard } from '../components/Product/ProductCard';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  image: string;
  productCount: number;
  featured: boolean;
}

export const Categories = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await api.getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categories: Category[] = [
    {
      id: 'wall-art',
      name: 'Wall Art',
      description: 'Stunning resin art pieces perfect for decorating your walls',
      icon: Palette,
      image: '/src/visuals/images/resinclock.jpg',
      productCount: products.filter(p => p.category === 'Wall Art').length,
      featured: true
    },
    {
      id: 'home-decor',
      name: 'Home Decor',
      description: 'Beautiful decorative pieces to enhance your living space',
      icon: Home,
      image: '/src/visuals/images/resinmirror.png',
      productCount: products.filter(p => p.category === 'Home Decor').length,
      featured: true
    },
    {
      id: 'furniture',
      name: 'Furniture',
      description: 'Functional furniture pieces with stunning resin accents',
      icon: Sofa,
      image: '/src/visuals/images/resintray.jpg',
      productCount: products.filter(p => p.category === 'Furniture').length,
      featured: true
    },
    {
      id: 'jewelry',
      name: 'Jewelry',
      description: 'Elegant resin jewelry pieces for every occasion',
      icon: Gem,
      image: '/src/visuals/images/resinring.jpg',
      productCount: products.filter(p => p.category === 'Jewelry').length,
      featured: false
    },
    {
      id: 'accessories',
      name: 'Accessories',
      description: 'Unique resin accessories to complement your style',
      icon: Package,
      image: '/src/visuals/images/resinkey.png',
      productCount: products.filter(p => p.category === 'Accessories').length,
      featured: false
    }
  ];

  const featuredCategories = categories.filter(c => c.featured);
  const allCategories = categories;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 opacity-20 animate-pulse" style={{
            backgroundImage: 'radial-gradient(circle at 20px 20px, rgba(255,255,255,0.1) 2px, transparent 2px)',
            backgroundSize: '40px 40px'
          }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Explore Our Collections
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Discover unique resin art pieces across different categories, each handcrafted with passion and precision
          </p>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Categories</h2>
            <p className="text-xl text-gray-600">Our most popular collections</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCategories.map((category) => (
              <Link key={category.id} to={`/shop?category=${encodeURIComponent(category.name)}`}>
                <Card className="group bg-white/70 backdrop-blur-sm border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                  <div className="relative aspect-video rounded-t-lg overflow-hidden">
                    <ImageWithFallback
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="flex items-center space-x-2 mb-2">
                        <category.icon className="w-6 h-6" />
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                          {category.productCount} items
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold">{category.name}</h3>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4">{category.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                        Shop Collection
                      </span>
                      <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* All Categories */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">All Categories</h2>
            <p className="text-xl text-gray-600">Complete range of our resin art collections</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {allCategories.map((category) => (
              <Link key={category.id} to={`/shop?category=${encodeURIComponent(category.name)}`}>
                <Card className="group bg-white/70 backdrop-blur-sm border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <category.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                    <Badge variant="secondary" className="text-xs">
                      {category.productCount} items
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Category Highlights */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Products by Category</h2>
            <p className="text-xl text-gray-600">Trending items from each collection</p>
          </div>

          {featuredCategories.map((category) => {
            const categoryProducts = products
              .filter(p => p.category === category.name)
              .slice(0, 4);

            if (categoryProducts.length === 0) return null;

            return (
              <div key={category.id} className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <category.icon className="w-6 h-6 text-blue-600" />
                    <h3 className="text-2xl font-bold text-gray-900">{category.name}</h3>
                  </div>
                  <Link 
                    to={`/shop?category=${encodeURIComponent(category.name)}`}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 transition-colors"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {categoryProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">Can't Find What You're Looking For?</h2>
          <p className="text-xl text-blue-100 mb-8">
            We create custom resin art pieces tailored to your specific needs and preferences
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/contact"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Request Custom Order
            </Link>
            <Link 
              to="/shop"
              className="inline-flex items-center px-6 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-medium"
            >
              Browse All Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
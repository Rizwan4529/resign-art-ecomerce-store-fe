import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Grid, List, SortAsc, X } from 'lucide-react';
import { useGetProductsQuery } from '../services/api/productApi';
import { ProductCard } from '../components/Product/ProductCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';

const CATEGORIES = [
  { value: 'JEWELRY', label: 'Jewelry' },
  { value: 'HOME_DECOR', label: 'Home Decor' },
  { value: 'COASTERS', label: 'Coasters' },
  { value: 'KEYCHAINS', label: 'Keychains' },
  { value: 'WALL_ART', label: 'Wall Art' },
  { value: 'TRAYS', label: 'Trays' },
  { value: 'BOOKMARKS', label: 'Bookmarks' },
  { value: 'PHONE_CASES', label: 'Phone Cases' },
  { value: 'CLOCKS', label: 'Clocks' },
  { value: 'CUSTOM', label: 'Custom' },
];

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-rating', label: 'Highest Rated' },
  { value: 'rating', label: 'Lowest Rated' },
  { value: 'name', label: 'Name A-Z' },
  { value: '-name', label: 'Name Z-A' },
];

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter states
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'ALL');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '-createdAt');
  const [featured, setFeatured] = useState(searchParams.get('featured') === 'true');
  const [inStock, setInStock] = useState(searchParams.get('inStock') === 'true');
  const [showFilters, setShowFilters] = useState(false);

  // RTK Query
  const { data: productsData, isLoading, isFetching } = useGetProductsQuery({
    page,
    limit: 12,
    search: search || undefined,
    category: category !== 'ALL' ? category : undefined,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    sort,
    featured: featured || undefined,
    inStock: inStock || undefined,
  });

  const products = productsData?.data || [];
  const pagination = productsData?.pagination;

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category !== 'ALL') params.set('category', category);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (sort !== '-createdAt') params.set('sort', sort);
    if (featured) params.set('featured', 'true');
    if (inStock) params.set('inStock', 'true');

    setSearchParams(params, { replace: true });
  }, [search, category, minPrice, maxPrice, sort, featured, inStock, setSearchParams]);

  const handleClearFilters = () => {
    setSearch('');
    setCategory('ALL');
    setMinPrice('');
    setMaxPrice('');
    setSort('-createdAt');
    setFeatured(false);
    setInStock(false);
    setPage(1);
  };

  const activeFiltersCount = [search, category !== 'ALL' ? category : '', minPrice, maxPrice, featured, inStock]
    .filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Shop Our Collection</h1>
          <p className="text-gray-600">
            Discover unique resin art pieces handcrafted with love
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block">
            <Card className="sticky top-8 p-6 bg-white/70 backdrop-blur-sm border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Filters</h3>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                    <X className="w-4 h-4 mr-1" />
                    Clear ({activeFiltersCount})
                  </Button>
                )}
              </div>

              <Separator className="my-4" />

              {/* Search */}
              <div className="mb-6">
                <Label className="mb-2 block">Search</Label>
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>

              {/* Category */}
              <div className="mb-6">
                <Label className="mb-2 block">Category</Label>
                <Select value={category} onValueChange={(value) => { setCategory(value); setPage(1); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <Label className="mb-2 block">Price Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                  />
                </div>
              </div>

              {/* Quick Filters */}
              <div className="space-y-3">
                <Label className="mb-2 block">Quick Filters</Label>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inStock"
                    checked={inStock}
                    onCheckedChange={(checked) => { setInStock(!!checked); setPage(1); }}
                  />
                  <Label htmlFor="inStock" className="cursor-pointer">
                    In Stock Only
                  </Label>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Mobile Filters Button */}
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </Button>
            </div>

            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <p className="text-gray-600">
                  {pagination ? `${pagination.totalItems} products` : 'Loading...'}
                </p>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary">{activeFiltersCount} filters applied</Badge>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <Select value={sort} onValueChange={(value) => { setSort(value); setPage(1); }}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="hidden md:flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading || isFetching ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <Card className="p-12 text-center bg-white/70 backdrop-blur-sm">
                <p className="text-xl text-gray-600 mb-4">No products found</p>
                <Button onClick={handleClearFilters}>Clear Filters</Button>
              </Card>
            ) : (
              <>
                <div className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1'
                }`}>
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setPage(page - 1)}
                      disabled={!pagination.hasPrevPage}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-2">
                      {[...Array(pagination.totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        // Show first, last, current, and adjacent pages
                        if (
                          pageNum === 1 ||
                          pageNum === pagination.totalPages ||
                          (pageNum >= page - 1 && pageNum <= page + 1)
                        ) {
                          return (
                            <Button
                              key={pageNum}
                              variant={page === pageNum ? 'default' : 'outline'}
                              onClick={() => setPage(pageNum)}
                              size="sm"
                            >
                              {pageNum}
                            </Button>
                          );
                        } else if (pageNum === page - 2 || pageNum === page + 2) {
                          return <span key={pageNum}>...</span>;
                        }
                        return null;
                      })}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setPage(page + 1)}
                      disabled={!pagination.hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Search,
  Palette,
  Home,
  Package,
  Phone,
  Info,
  Loader2,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCurrentUser,
  logout as logoutAction,
} from "../../store/slices/authSlice";
import { useCart } from "../../context/CartContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useSearchProductsQuery } from "../../services/api/productApi";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch search results when user types (only if query has at least 2 characters)
  const { data: searchResults, isLoading: isSearching } = useSearchProductsQuery(
    { q: debouncedSearchQuery, limit: 5 },
    { skip: debouncedSearchQuery.length < 2 }
  );

  // Handle click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show dropdown when there are results or loading
  useEffect(() => {
    if (debouncedSearchQuery.length >= 2) {
      setShowSearchDropdown(true);
    } else {
      setShowSearchDropdown(false);
    }
  }, [debouncedSearchQuery, searchResults]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setShowSearchDropdown(false);
    }
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
    setSearchQuery("");
    setShowSearchDropdown(false);
  };

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/shop", label: "Shop", icon: Package },
    // { href: '/categories', label: 'Categories', icon: Palette },
    { href: "/about", label: "About", icon: Info },
    { href: "/contact", label: "Contact", icon: Phone },
  ];

  return (
    <nav
      className="sticky top-0 z-50 text-white backdrop-blur-md border-b border-white/20 shadow-sm"
      style={{
        background: "linear-gradient(90deg, #e056b5, #8a6fd6, #00a9f4)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-4 mr-10">
            <img
              src="/src/visuals/images/MH logo.png"
              alt="ResinArt Logo"
              className="w-15 h-12 object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                to={href}
                className="text-white-600 hover:text-blue-600 transition-colors duration-200 hover:scale-105"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-8" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-4 h-4 z-10" />
              <Input
                type="text"
                placeholder="Search resin art..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/50 backdrop-blur-sm border-white/30 focus:border-blue-400"
              />

              {/* Search Dropdown */}
              {showSearchDropdown && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="ml-2 text-gray-600">Searching...</span>
                    </div>
                  ) : searchResults?.data && searchResults.data.length > 0 ? (
                    <div className="py-2">
                      {searchResults.data.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleProductClick(product.id)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          {/* Product Image */}
                          {product.images && product.images.length > 0 ? (
                            <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                              <ImageWithFallback
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                              <Package className="w-6 h-6 text-white" />
                            </div>
                          )}

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm font-semibold text-blue-600">
                                ${product.discountPrice || product.price}
                              </span>
                              {product.discountPrice && (
                                <span className="text-xs text-gray-400 line-through">
                                  ${product.price}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* View all results link */}
                      <div className="border-t border-gray-200 mt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSearch(e);
                          }}
                          className="w-full px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 font-medium text-center transition-colors"
                        >
                          View all results for "{searchQuery}"
                        </button>
                      </div>
                    </div>
                  ) : debouncedSearchQuery.length >= 2 ? (
                    <div className="py-8 text-center text-gray-500">
                      No products found for "{debouncedSearchQuery}"
                    </div>
                  ) : null}
                </div>
              )}
            </form>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-white hover:text-blue-700 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center">
                  {itemCount}
                </Badge>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  {user.profileImage ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm">
                      <ImageWithFallback
                        src={user.profileImage}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:inline">{user.name}</span>
                </Button>
                <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-white/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-2">
                    <Link
                      to="/profile"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md"
                    >
                      My Orders
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link
                        to="/admin"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <hr className="my-2 border-gray-200" />
                    <button
                      onClick={() => dispatch(logoutAction())}
                      className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <div className="space-y-2">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  to={href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            {/* Mobile Search */}
            <div className="mt-4 px-3 relative">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                <Input
                  type="text"
                  placeholder="Search resin art..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/50 backdrop-blur-sm border-white/30"
                />

                {/* Mobile Search Dropdown */}
                {showSearchDropdown && (
                  <div className="absolute top-full mt-2 left-3 right-3 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                    {isSearching ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        <span className="ml-2 text-gray-600">Searching...</span>
                      </div>
                    ) : searchResults?.data && searchResults.data.length > 0 ? (
                      <div className="py-2">
                        {searchResults.data.map((product) => (
                          <div
                            key={product.id}
                            onClick={() => {
                              handleProductClick(product.id);
                              setIsMenuOpen(false);
                            }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            {/* Product Image */}
                            {product.images && product.images.length > 0 ? (
                              <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                                <ImageWithFallback
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                <Package className="w-6 h-6 text-white" />
                              </div>
                            )}

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {product.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-semibold text-blue-600">
                                  ${product.discountPrice || product.price}
                                </span>
                                {product.discountPrice && (
                                  <span className="text-xs text-gray-400 line-through">
                                    ${product.price}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* View all results link */}
                        <div className="border-t border-gray-200 mt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSearch(e);
                              setIsMenuOpen(false);
                            }}
                            className="w-full px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 font-medium text-center transition-colors"
                          >
                            View all results for "{searchQuery}"
                          </button>
                        </div>
                      </div>
                    ) : debouncedSearchQuery.length >= 2 ? (
                      <div className="py-8 text-center text-gray-500">
                        No products found for "{debouncedSearchQuery}"
                      </div>
                    ) : null}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, Palette, Home, Package, Phone, Info } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout as logoutAction } from '../../store/slices/authSlice';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/shop', label: 'Shop', icon: Package },
    { href: '/categories', label: 'Categories', icon: Palette },
    { href: '/about', label: 'About', icon: Info },
    { href: '/contact', label: 'Contact', icon: Phone },
  ];

  return (
    <nav className="sticky top-0 z-50 text-white backdrop-blur-md border-b border-white/20 shadow-sm"
  style={{
    background: "linear-gradient(90deg, #e056b5, #8a6fd6, #00a9f4)"
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
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-4 h-4" />
              <Input
                type="text"
                placeholder="Search resin art..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/50 backdrop-blur-sm border-white/30 focus:border-blue-400"
              />
            </form>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-white hover:text-blue-700 transition-colors">
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
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
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
                    <Link to="/profile" className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md">
                      Profile
                    </Link>
                    <Link to="/orders" className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md">
                      My Orders
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link to="/admin" className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md">
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
                <Button size="sm" asChild className="bg-gradient-to-r from-blue-600 to-purple-600">
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
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
            <div className="mt-4 px-3">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search resin art..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/50 backdrop-blur-sm border-white/30"
                />
              </form>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

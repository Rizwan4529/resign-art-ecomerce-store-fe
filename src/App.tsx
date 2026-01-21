import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './store';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from './store/slices/authSlice';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';
import ScrollToTop from "./components/figma/ScrollToTop";
import { Toaster } from './components/ui/sonner';

// Pages
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { Profile } from './pages/Profile';
import { Orders } from './pages/Orders';
import { OrderTracking } from './pages/OrderTracking';
import { Notifications } from './pages/Notifications';
import { Categories } from './pages/Categories';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { AdminDashboard } from './pages/admin/Dashboard';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({
  children,
  adminOnly = false
}) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  // Debug logging
  console.log('ProtectedRoute Check:', {
    isAuthenticated,
    user,
    adminOnly,
    userRole: user?.role
  });

  if (!isAuthenticated || !user) {
    console.log('❌ Access denied: Not authenticated');
    return <Navigate to="/login" replace />;
  }

  // Case-insensitive role check
  const userRole = user.role?.toUpperCase();
  if (adminOnly && userRole !== 'ADMIN') {
    console.log('❌ Access denied: Not admin. User role:', user.role);
    return <Navigate to="/" replace />;
  }

  console.log('✅ Access granted');
  return <>{children}</>;
};

// App Layout Component
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

// Main App Component
function AppContent() {
  return (
    <Router>
       <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<AppLayout><Home /></AppLayout>} />
        <Route path="/shop" element={<AppLayout><Shop /></AppLayout>} />
        <Route path="/product/:id" element={<AppLayout><ProductDetail /></AppLayout>} />
        <Route path="/cart" element={<AppLayout><Cart /></AppLayout>} />
        <Route path="/categories" element={<AppLayout><Categories /></AppLayout>} />
        <Route path="/about" element={<AppLayout><About /></AppLayout>} />
        <Route path="/contact" element={<AppLayout><Contact /></AppLayout>} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route 
          path="/checkout" 
          element={
            <ProtectedRoute>
              <AppLayout><Checkout /></AppLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <AppLayout><Profile /></AppLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute>
              <AppLayout><Orders /></AppLayout>
            </ProtectedRoute>
          } 
        />
        <Route
          path="/order-tracking/:id"
          element={
            <ProtectedRoute>
              <AppLayout><OrderTracking /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <AppLayout><Notifications /></AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* 404 Route */}
        <Route 
          path="*" 
          element={
            <AppLayout>
              <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
                  <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
                  <a 
                    href="/" 
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                  >
                    Go Home
                  </a>
                </div>
              </div>
            </AppLayout>
          } 
        />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <ReduxProvider store={store}>
      <CartProvider>
        <AppContent />
        <Toaster />
      </CartProvider>
    </ReduxProvider>
  );
}
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthProvider';
import Navbar from './components/Navbar';
import { AuthErrorBanner } from './components/AuthErrorBanner';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
import Cart from './pages/Cart';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, profile, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-black">
      <div className="w-12 h-12 border-4 border-primary-gold border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return <Navigate to="/" />;
  
  if (adminOnly && profile?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <AuthErrorBanner />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
        </Routes>
      </main>
      <footer className="bg-brand-black border-t border-white/5 py-12 px-4 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-serif text-2xl font-bold text-primary-gold mb-4">The African Palate</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Bringing authentic flavors and rich heritage to Cavendish University. Pre-order your meals for a convenient and cultural dining experience.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/menu" className="hover:text-primary-gold transition-colors">Today's Menu</Link></li>
              <li><Link to="/orders" className="hover:text-primary-gold transition-colors">Track Orders</Link></li>
              <li><a href="#" className="hover:text-primary-gold transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Contact Us</h4>
            <p className="text-sm text-slate-400 mb-2">Cavendish University Uganda</p>
            <p className="text-sm text-slate-400 mb-2">Phone: +256 700 000 000</p>
            <p className="text-sm text-slate-400">Email: info@africanpalate.com</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/5 mt-12 pt-8 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} The African Palate. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

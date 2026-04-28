import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Menu as MenuIcon, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { cn } from '../lib/utils';

export default function Navbar() {
  const { user, profile, signIn, signOut } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();

  return (
    <nav className="sticky top-4 z-50 mx-4">
      <div className="max-w-7xl mx-auto bg-white rounded-[2rem] shadow-sm border border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-lg shadow-black/10 group-hover:scale-105 transition-transform">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback to text-based logo if image is not found
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-brand-orange flex items-center justify-center text-white font-black italic text-xl">AP</div>';
              }}
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-sans text-xl font-black tracking-tighter italic text-brand-orange group-hover:opacity-80 transition-opacity">
              AFROBITE
            </span>
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">The African Palate</span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-brand-orange transition-colors">Home</Link>
          <Link to="/menu" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-brand-orange transition-colors">Menu</Link>
          <Link to="/orders" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-brand-orange transition-colors">Orders</Link>
          
          {profile?.role === 'admin' && (
            <Link to="/admin" className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-brand-purple hover:opacity-80 transition-opacity">
              <LayoutDashboard size={14} />
              Admin
            </Link>
          )}

          <div className="flex items-center gap-4 ml-4">
            {user ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate('/cart')}
                  className="p-2.5 rounded-2xl bg-gray-50 text-gray-600 hover:bg-brand-orange hover:text-white transition-all relative"
                >
                  <ShoppingBag size={18} />
                </button>
                <div className="h-6 w-px bg-gray-100" />
                <button 
                  onClick={() => signOut()}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-600 hover:opacity-70 transition-opacity"
                >
                  <LogOut size={16} />
                  Exit
                </button>
              </div>
            ) : (
              <button 
                onClick={() => signIn()}
                className="bg-black text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest italic hover:scale-105 transition-transform"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2 text-gray-400" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full mt-4 bg-white rounded-[2rem] shadow-xl border border-gray-100 py-6 px-6 flex flex-col gap-6 animate-fade-in">
          <Link to="/" className="text-sm font-black uppercase tracking-widest text-gray-500" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/menu" className="text-sm font-black uppercase tracking-widest text-gray-500" onClick={() => setIsOpen(false)}>Menu</Link>
          <Link to="/orders" className="text-sm font-black uppercase tracking-widest text-gray-500" onClick={() => setIsOpen(false)}>My Orders</Link>
          {profile?.role === 'admin' && (
            <Link to="/admin" className="text-sm font-black uppercase tracking-widest text-brand-purple" onClick={() => setIsOpen(false)}>Admin Panel</Link>
          )}
          <hr className="border-gray-50" />
          {user ? (
            <button 
              onClick={() => { setIsOpen(false); signOut(); }}
              className="flex items-center gap-2 text-red-600 text-sm font-black uppercase tracking-widest"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          ) : (
            <button 
              onClick={() => { signIn(); setIsOpen(false); }}
              className="bg-brand-orange text-white w-full py-4 rounded-2xl font-black uppercase tracking-widest italic"
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

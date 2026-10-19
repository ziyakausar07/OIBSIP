import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { 
  ShoppingBag, 
  User, 
  LogOut, 
  Menu as MenuIcon, 
  X, 
  LayoutDashboard, 
  Zap, 
  ChevronDown, 
  ShieldCheck,
  Package
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserDropdownOpen(false);
  }, [location]);

  // Click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setUserDropdownOpen(false);
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Craft Menu' },
    { to: '/custom-pizza', label: 'Pizza Lab' },
    { to: '/about', label: 'Our Story' },
    { to: '/contact', label: 'Contact' },
  ];

  const isActive = (path) => location.pathname === path;

  // Initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-3.5 transition-all duration-300">
      <nav
        className={`max-w-7xl mx-auto rounded-full transition-all duration-300 ${
          scrolled
            ? 'bg-midnight-950/90 backdrop-blur-2xl border border-purple-500/30 shadow-glow-violet shadow-2xl py-2 px-5 sm:px-6'
            : 'bg-midnight-900/80 backdrop-blur-xl border border-purple-500/20 py-2.5 px-5 sm:px-6 shadow-lg shadow-midnight-950/40'
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link to={isAdminRoute ? '/admin' : '/'} className="flex items-center gap-3 group shrink-0" id="nav-logo">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-veloce-700 via-veloce-600 to-nocturne-pink flex items-center justify-center shadow-glow-violet group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-lg tracking-wider text-white leading-tight">
                VELZINO
              </span>
              <span className="text-[9px] tracking-[0.25em] uppercase font-sans font-medium text-nocturne-muted -mt-0.5">
                {isAdminRoute ? 'Admin Central' : 'Bites & Beats'}
              </span>
            </div>
          </Link>

          {/* If Admin Route: Show Admin Central Pill Badge instead of customer links */}
          {isAdminRoute ? (
            <div className="hidden md:flex items-center gap-2 px-4 py-1 rounded-full bg-veloce-600/20 border border-veloce-500/30 text-veloce-300 text-xs font-mono">
              <ShieldCheck size={14} className="text-neon-pink" />
              <span className="tracking-wider uppercase font-semibold">Store Management Portal</span>
            </div>
          ) : (
            /* Desktop Customer Navigation Links */
            <div className="hidden lg:flex items-center gap-1.5">
              {navLinks.map((link) => {
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    id={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 ${
                      active
                        ? 'text-white bg-veloce-600/30 border border-veloce-500/40 shadow-glow-violet'
                        : 'text-nocturne-lavender/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Show Cart Button only for public/customer pages */}
            {!isAdminRoute && (
              <Link
                to="/cart"
                id="nav-cart"
                className="relative p-2.5 rounded-full bg-midnight-850/80 border border-purple-500/25 text-midnight-200 hover:text-white hover:border-purple-400 hover:shadow-glow-violet transition-all"
                aria-label="View Shopping Cart"
              >
                <ShoppingBag size={17} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-gradient-to-r from-nocturne-pink to-veloce-600 text-white text-[9px] font-bold rounded-full animate-scale-in shadow-glow-pink">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Authenticated User Menu with Sleek Dropdown */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border transition-all duration-200 ${
                    userDropdownOpen
                      ? 'bg-midnight-800 border-purple-400/60 shadow-glow-violet'
                      : 'bg-midnight-850/80 border-purple-500/25 hover:border-purple-400/40 hover:bg-midnight-800/80'
                  }`}
                  id="nav-user-profile-btn"
                  aria-expanded={userDropdownOpen}
                >
                  {/* Avatar Circle */}
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-veloce-600 to-nocturne-pink flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                    {getInitials(user?.name)}
                  </div>
                  
                  {/* Name */}
                  <span className="text-xs font-medium text-white max-w-[90px] truncate hidden sm:inline">
                    {user?.name?.split(' ')[0] || 'Account'}
                  </span>

                  {/* Admin Tag */}
                  {isAdmin && (
                    <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-veloce-600/30 text-veloce-200 border border-purple-500/30 hidden md:inline">
                      Admin
                    </span>
                  )}

                  <ChevronDown
                    size={13}
                    className={`text-nocturne-muted transition-transform duration-200 ${
                      userDropdownOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-midnight-900/95 backdrop-blur-2xl border border-purple-500/30 shadow-2xl shadow-purple-950/60 py-2 z-50 animate-scale-in origin-top-right">
                    {/* User Info Header */}
                    <div className="px-4 py-2.5 border-b border-purple-500/15">
                      <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                      <p className="text-[11px] text-nocturne-muted truncate">{user?.email}</p>
                      {isAdmin && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-veloce-300 font-medium">
                          <ShieldCheck size={12} className="text-veloce-400" />
                          <span>Staff Administrator</span>
                        </div>
                      )}
                    </div>

                    {/* Menu Items */}
                    <div className="p-1 space-y-0.5">
                      {isAdmin && (
                        <Link
                          to="/admin"
                          id="nav-dropdown-admin"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-veloce-200 hover:text-white hover:bg-veloce-600/20 transition-all"
                        >
                          <LayoutDashboard size={15} className="text-veloce-400" />
                          <span>Admin Console</span>
                        </Link>
                      )}

                      <Link
                        to="/dashboard"
                        id="nav-dropdown-dashboard"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-nocturne-lavender hover:text-white hover:bg-white/5 transition-all"
                      >
                        <Package size={15} className="text-nocturne-muted" />
                        <span>My Orders</span>
                      </Link>

                      <div className="my-1 border-t border-purple-500/15" />

                      <button
                        onClick={handleLogout}
                        id="nav-dropdown-logout"
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left"
                      >
                        <LogOut size={15} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link to="/login" id="nav-login" className="btn-ghost text-xs tracking-wide !py-2 !px-3.5">
                  Log In
                </Link>
                <Link
                  to="/register"
                  id="nav-register"
                  className="btn-primary text-xs tracking-wide !px-4 !py-2"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Toggle Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-full bg-midnight-850/80 border border-purple-500/25 text-midnight-200 hover:text-white"
              id="nav-mobile-toggle"
              aria-label="Toggle Navigation Menu"
            >
              {mobileOpen ? <X size={17} /> : <MenuIcon size={17} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-purple-500/20 animate-slide-down space-y-1.5 pb-2">
            {!isAdminRoute && (
              navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-4 py-2 rounded-xl text-xs tracking-wide font-medium transition-all ${
                    isActive(link.to)
                      ? 'text-white bg-veloce-600/30 border border-veloce-500/40 shadow-glow-violet'
                      : 'text-nocturne-lavender/80 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))
            )}

            <div className="pt-2 border-t border-purple-500/20 space-y-1.5">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-1.5">
                    <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                    <p className="text-[10px] text-nocturne-muted truncate">{user?.email}</p>
                  </div>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs text-veloce-200 bg-veloce-600/20"
                    >
                      <LayoutDashboard size={15} /> Admin Console
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs text-white hover:bg-white/5"
                  >
                    <Package size={15} className="text-nocturne-muted" /> My Orders & Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 text-left"
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-1">
                  <Link
                    to="/login"
                    className="flex-1 text-center py-2 rounded-full text-xs border border-purple-500/25 text-white"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 text-center py-2 rounded-full text-xs btn-primary !py-2"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

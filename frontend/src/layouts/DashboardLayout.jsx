import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import api from '../api/axios.js';
import { ENDPOINTS } from '../api/endpoints.js';
import { 
  LayoutDashboard, ShoppingCart, Package, Archive, 
  Users, UsersRound, FileBarChart, Tag, Settings, LogOut, Menu, X, Bell, Check, Snowflake, Search, Sun, Moon
} from 'lucide-react';

const SIDEBAR_LINKS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'cashier', 'staff'] },
  { path: '/dashboard/pos', label: 'POS Billing', icon: ShoppingCart, roles: ['admin', 'manager', 'cashier'] },
  { path: '/dashboard/products', label: 'Products', icon: Package, roles: ['admin', 'manager', 'staff'] },
  { path: '/dashboard/inventory', label: 'Inventory', icon: Archive, roles: ['admin', 'manager', 'staff'] },
  { path: '/dashboard/orders', label: 'Orders', icon: FileBarChart, roles: ['admin', 'manager', 'cashier', 'staff'] },
  { path: '/dashboard/customers', label: 'Customers', icon: Users, roles: ['admin', 'manager', 'cashier', 'staff'] },
  { path: '/dashboard/employees', label: 'Employees', icon: UsersRound, roles: ['admin'] },
  { path: '/dashboard/offers', label: 'Offers', icon: Tag, roles: ['admin', 'manager'] },
  { path: '/dashboard/reports', label: 'Reports', icon: FileBarChart, roles: ['admin', 'manager'] },
  { path: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
];

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const filteredLinks = SIDEBAR_LINKS.filter(link => user && link.roles.includes(user.role));

  const fetchNotifications = async () => {
    try {
      const res = await api.get(ENDPOINTS.NOTIFICATIONS.GET + '?limit=20');
      setNotifications(res.data.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // Polling every 60s
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.put(`${ENDPOINTS.NOTIFICATIONS.GET}/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put(ENDPOINTS.NOTIFICATIONS.READ_ALL);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await api.delete(ENDPOINTS.NOTIFICATIONS.CLEAR_ALL);
      setNotifications([]);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Failed to clear notifications', error);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  // Command K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchResults = SIDEBAR_LINKS.filter(link => 
    user && link.roles.includes(user.role) && link.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-transparent">
      
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-chocolate/50 dark:bg-black/50 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/80 dark:bg-espresso/80 backdrop-blur-xl border-r border-white dark:border-cacao/50 dark:border-cacao shadow-medium transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="p-section flex items-center justify-between border-b border-gray-200 dark:border-cacao/50 dark:border-cacao/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-caramel to-chocolate flex items-center justify-center text-white shadow-soft shrink-0">
              <Snowflake size={24} />
            </div>
            <h2 className="text-2xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-caramel to-chocolate dark:from-caramel dark:to-orange-300 truncate">
              {settings?.businessName || 'FrostFlow'}
            </h2>
          </div>
          <button className="md:hidden text-slateGray dark:text-latte shrink-0 ml-2" onClick={() => setMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-default space-y-1">
          {filteredLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path} 
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-default py-3 rounded-xl font-medium transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-caramel to-orange-500 text-white shadow-lg shadow-caramel/50 translate-x-1' : 'text-slateGray dark:text-latte hover:bg-white dark:bg-mocha dark:hover:bg-slate-800 hover:text-chocolate dark:text-crema dark:hover:text-white hover:shadow-soft hover:translate-x-1'}`}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'text-slateGray dark:text-latte'} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-default border-t border-gray-200 dark:border-cacao/50 dark:border-cacao/50">
          <button 
            onClick={logout} 
            className="flex items-center gap-3 w-full px-default py-3 text-softRed font-medium hover:bg-softRed/10 rounded-xl transition-all hover:translate-x-1"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="bg-white/60 dark:bg-espresso/60 backdrop-blur-md shadow-sm border-b border-white dark:border-cacao/50 dark:border-cacao h-16 flex items-center justify-between px-section z-40 relative">
          
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slateGray dark:text-latte hover:text-chocolate dark:text-crema dark:hover:text-white transition-colors" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            
            {/* Global Search Bar (Hidden on mobile) */}
            <div className="hidden md:block relative">
              <div className="flex items-center bg-white/80 dark:bg-mocha/80 border border-gray-200 dark:border-cacao/60 dark:border-cacao rounded-full px-4 py-2 w-64 lg:w-[400px] shadow-soft hover:shadow-md hover:border-caramel/40 transition-all group">
                <Search size={18} className="text-gray-400 group-hover:text-caramel transition-colors" />
                <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="Search pages (⌘K)..." 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value) setIsSearchOpen(true);
                  }}
                  onFocus={() => {
                    if (searchQuery) setIsSearchOpen(true);
                  }}
                  className="bg-transparent border-none outline-none text-sm ml-2 w-full text-chocolate dark:text-crema placeholder:text-gray-400"
                />
                <div className="hidden lg:flex items-center justify-center gap-0.5 bg-gray-100 dark:bg-cacao dark:bg-[#2A1F1D] border border-gray-200 dark:border-cacao px-2 rounded text-gray-500 dark:text-latte shadow-sm opacity-80 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-sans">⌘</span><span className="text-[10px] font-bold">K</span>
                </div>
              </div>

              {/* Search Results Dropdown */}
              {isSearchOpen && searchQuery && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-mocha rounded-xl shadow-xl border border-gray-100 dark:border-cacao overflow-hidden z-50">
                  <div className="p-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Navigation</div>
                  {searchResults.length > 0 ? (
                    <div className="px-2 pb-2">
                      {searchResults.map((result) => {
                        const Icon = result.icon;
                        return (
                          <Link
                            key={result.path}
                            to={result.path}
                            onClick={() => {
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-vanilla/50 dark:hover:bg-slate-700 text-chocolate dark:text-crema transition-colors"
                          >
                            <Icon size={18} className="text-caramel" />
                            <span className="text-sm font-medium">{result.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-latte">No pages found matching "{searchQuery}"</div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="ml-auto flex items-center gap-section">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="text-slateGray dark:text-latte hover:text-chocolate dark:text-crema dark:hover:text-caramel relative p-2 rounded-full hover:bg-vanilla dark:bg-espresso dark:hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            {/* Notification Bell */}
            <div className="relative" ref={dropdownRef}>
              <button 
                className="text-slateGray dark:text-latte hover:text-chocolate dark:text-crema dark:hover:text-white relative p-2 rounded-full hover:bg-vanilla dark:bg-espresso dark:hover:bg-slate-800 transition-colors"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Bell size={24} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-softRed opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-softRed text-white text-[10px] items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-[-60px] sm:right-0 mt-2 w-[300px] sm:w-80 max-w-[calc(100vw-32px)] bg-white dark:bg-mocha rounded-xl shadow-strong border border-gray-100 dark:border-cacao overflow-hidden z-50 animate-scale-in origin-top-right">
                  <div className="p-4 border-b border-gray-100 dark:border-cacao flex justify-between items-center bg-gray-50/50 dark:bg-mocha/50">
                    <h3 className="font-bold text-chocolate dark:text-crema">Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-caramel hover:text-orange-600 dark:hover:text-orange-400 font-semibold"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-[320px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slateGray dark:text-latte text-sm">
                        No notifications right now.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif._id} 
                          className={`p-4 border-b border-gray-50 dark:border-cacao/50 hover:bg-vanilla/30 dark:hover:bg-slate-700/50 transition-colors ${!notif.isRead ? 'bg-vanilla/50 dark:bg-[#2A1F1D]/30' : ''}`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <p className="text-sm text-chocolate dark:text-crema dark:text-latte">{notif.message}</p>
                              <span className="text-xs text-slateGray dark:text-latte mt-1 block">
                                {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                            {!notif.isRead && (
                              <button 
                                onClick={(e) => handleMarkAsRead(notif._id, e)}
                                className="text-caramel hover:text-orange-600 dark:hover:text-orange-400 p-1 rounded-full hover:bg-orange-50 dark:hover:bg-slate-600"
                                title="Mark as read"
                              >
                                <Check size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {notifications.length > 0 && (
                    <div className="p-3 bg-gray-50 dark:bg-[#2A1F1D] dark:bg-mocha/80 border-t border-gray-100 dark:border-cacao text-center">
                      <button 
                        onClick={handleClearAll}
                        className="text-xs font-semibold text-slateGray dark:text-latte hover:text-softRed dark:hover:text-red-400 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-caramel/10 border-2 border-caramel/20 flex items-center justify-center text-caramel font-bold shadow-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-bold text-chocolate dark:text-crema leading-tight">{user?.name}</div>
                <div className="text-xs text-slateGray dark:text-latte font-medium capitalize">{user?.role}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-section scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

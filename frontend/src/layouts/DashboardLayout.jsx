import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useSettings } from '../context/SettingsContext.jsx';
import api from '../api/axios.js';
import { ENDPOINTS } from '../api/endpoints.js';
import { 
  LayoutDashboard, ShoppingCart, Package, Archive, 
  Users, UsersRound, FileBarChart, Tag, Settings, LogOut, Menu, X, Bell, Check, Snowflake
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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-transparent">
      
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-chocolate/50 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-xl border-r border-white/50 shadow-medium transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="p-section flex items-center justify-between border-b border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-caramel to-chocolate flex items-center justify-center text-white shadow-soft shrink-0">
              <Snowflake size={24} />
            </div>
            <h2 className="text-2xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-caramel to-chocolate truncate">
              {settings?.businessName || 'FrostFlow'}
            </h2>
          </div>
          <button className="md:hidden text-slateGray shrink-0 ml-2" onClick={() => setMobileMenuOpen(false)}>
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
                className={`flex items-center gap-3 px-default py-3 rounded-xl font-medium transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-caramel to-orange-500 text-white shadow-lg shadow-caramel/50 translate-x-1' : 'text-slateGray hover:bg-white hover:text-chocolate hover:shadow-soft hover:translate-x-1'}`}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'text-slateGray'} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-default border-t border-gray-200/50">
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
        <header className="bg-white/60 backdrop-blur-md shadow-sm border-b border-white/50 h-16 flex items-center justify-between px-section z-10 relative">
          <button className="md:hidden text-slateGray hover:text-chocolate transition-colors" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
          
          <div className="ml-auto flex items-center gap-section">
            
            {/* Notification Bell */}
            <div className="relative" ref={dropdownRef}>
              <button 
                className="text-slateGray hover:text-chocolate relative p-2 rounded-full hover:bg-vanilla transition-colors"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-softRed text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white shadow-sm">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isDropdownOpen && (
                <div className="fixed sm:absolute top-[70px] sm:top-auto left-4 right-4 sm:left-auto sm:right-0 mt-0 sm:mt-2 sm:w-80 bg-white/95 backdrop-blur-xl rounded-xl shadow-strong border border-white/50 overflow-hidden z-50 animate-fade-in sm:origin-top-right">
                  <div className="p-3 border-b border-gray-100 bg-vanilla/50 flex justify-between items-center">
                    <h3 className="font-bold text-chocolate">Notifications</h3>
                    <div className="flex items-center gap-3">
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllAsRead} className="text-xs font-semibold text-caramel hover:text-chocolate hover:underline">
                          Mark all as read
                        </button>
                      )}
                      <span className="text-xs font-semibold bg-caramel text-white px-2 py-0.5 rounded-full">{unreadCount} New</span>
                    </div>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-slateGray text-sm">No notifications yet.</div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {notifications.slice(0, 4).map(notification => (
                          <div 
                            key={notification._id} 
                            onClick={(e) => {
                              if (!notification.isRead) handleMarkAsRead(notification._id, e);
                            }}
                            className={`p-3 transition-colors hover:bg-gray-50 flex items-start gap-3 cursor-pointer ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                          >
                            <div className={`shrink-0 w-2 h-2 mt-1.5 rounded-full ${!notification.isRead ? 'bg-caramel' : 'bg-transparent'}`}></div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold truncate ${!notification.isRead ? 'text-chocolate' : 'text-slateGray'}`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-slateGray mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-1">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {!notification.isRead && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification._id, e);
                                }}
                                className="shrink-0 text-gray-400 hover:text-caramel p-1"
                                title="Mark as read"
                              >
                                <Check size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 border-l border-gray-200 pl-section">
              <div className="w-8 h-8 rounded-full bg-caramel text-white flex items-center justify-center font-bold">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-chocolate leading-none">{user?.fullName || 'System Admin'}</p>
                <p className="text-xs text-slateGray capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-section md:p-page">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;

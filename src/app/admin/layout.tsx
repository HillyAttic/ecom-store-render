"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  Settings, 
  LogOut, 
  ChevronDown,
  Menu,
  X,
  Bell,
  Search,
  ShoppingBag
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const token = Cookies.get('adminToken');
      const username = Cookies.get('adminUsername');
      
      if (token) {
        try {
          // Verify token with the API
          const response = await fetch('/api/admin/verify-token');
          const data = await response.json();
          
          if (data.authenticated) {
            setIsAuthenticated(true);
            setUserName(username || 'Admin');
          } else {
            // Token is invalid, redirect to login
            Cookies.remove('adminToken');
            Cookies.remove('adminUsername');
            router.push('/admin/login');
          }
        } catch (error) {
          console.error('Error verifying token:', error);
          router.push('/admin/login');
        }
      } else if (pathname && pathname !== '/admin/login' && !pathname.includes('/admin/login')) {
        // Redirect to login if not authenticated and not already on login page
        router.push('/admin/login');
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  const handleLogout = () => {
    // Clear the authentication cookies
    Cookies.remove('adminToken');
    Cookies.remove('adminUsername');
    router.push('/admin/login');
  };

  // Skip layout rendering for login page
  if (pathname === '/admin/login') {
    return children;
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100" suppressHydrationWarning>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900" suppressHydrationWarning></div>
      </div>
    );
  }

  // TEMPORARILY MODIFIED: Always render admin layout for debugging
  // Original code: if (!isAuthenticated) {
  //  return null; // Will redirect to login in useEffect
  // }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Products',
      href: '/admin/products',
      icon: ShoppingBag,
    },
    {
      name: 'Orders',
      href: '/admin/dashboard/orders',
      icon: Package,
    },
    {
      name: 'Customers',
      href: '/admin/customers',
      icon: Users,
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
    },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100" suppressHydrationWarning>
      {/* Sidebar for desktop */}
      <div 
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 flex flex-col flex-shrink-0 w-64 transition-transform duration-300 ease-in-out border-r border-gray-200 bg-white md:relative md:translate-x-0 z-20`}
        suppressHydrationWarning
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200" suppressHydrationWarning>
          <Link href="/admin/dashboard" className="flex items-center space-x-3" suppressHydrationWarning>
            <div className="relative" suppressHydrationWarning>
              <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center shadow-md" suppressHydrationWarning>
                <span className="text-white text-xl font-serif font-bold" suppressHydrationWarning>H</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full shadow-sm border border-white" suppressHydrationWarning></div>
            </div>
            <div className="flex flex-col" suppressHydrationWarning>
              <div className="font-bold text-lg text-blue-900 tracking-wide" suppressHydrationWarning>HANDLOOM</div>
              <div className="text-xs text-gray-600 -mt-1 tracking-wider" suppressHydrationWarning>ADMIN PANEL</div>
            </div>
          </Link>
          <button 
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
            onClick={() => setIsSidebarOpen(false)}
            suppressHydrationWarning
          >
            <X size={24} />
          </button>
        </div>

        {/* Sidebar content */}
        <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4" suppressHydrationWarning>
          <nav className="flex-1 px-2 space-y-1" suppressHydrationWarning>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-900'
                    : 'text-gray-700 hover:bg-gray-50'
                } group flex items-center px-2 py-3 text-sm font-medium rounded-md`}
                suppressHydrationWarning
              >
                <item.icon 
                  className={`mr-3 h-5 w-5 ${
                    pathname === item.href ? 'text-blue-900' : 'text-gray-500'
                  }`} 
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* User profile */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200" suppressHydrationWarning>
          <div className="flex items-center" suppressHydrationWarning>
            <div className="flex-shrink-0" suppressHydrationWarning>
              <div className="h-10 w-10 rounded-full bg-blue-900 flex items-center justify-center text-white font-bold shadow-md" suppressHydrationWarning>
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="ml-3 flex-1" suppressHydrationWarning>
              <p className="text-sm font-medium text-gray-900" suppressHydrationWarning>
                {userName}
              </p>
              <p className="text-xs text-gray-500" suppressHydrationWarning>
                Administrator
              </p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1 rounded-full text-gray-500 hover:text-red-500"
              suppressHydrationWarning
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden" suppressHydrationWarning>
        {/* Top navigation */}
        <div className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200" suppressHydrationWarning>
          <div className="h-16 flex items-center justify-between px-4" suppressHydrationWarning>
            <button
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
              onClick={() => setIsSidebarOpen(true)}
              suppressHydrationWarning
            >
              <Menu size={24} />
            </button>
            
            <div className="flex-1 flex items-center justify-between md:ml-6" suppressHydrationWarning>
              {/* Search bar */}
              <div className="max-w-lg w-full lg:max-w-xs hidden md:block" suppressHydrationWarning>
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative" suppressHydrationWarning>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" suppressHydrationWarning>
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    placeholder="Search"
                    type="search"
                    suppressHydrationWarning
                  />
                </div>
              </div>
              
              {/* Notifications */}
              <div className="ml-4 flex items-center md:ml-6" suppressHydrationWarning>
                <button className="p-2 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none" suppressHydrationWarning>
                  <Bell size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50" suppressHydrationWarning>
          {children}
        </main>
      </div>
    </div>
  );
} 
"use client";

import { useEffect, useState, useCallback, useRef, useMemo, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Package, Truck, CheckCircle, XCircle, ChevronRight, Calendar, CreditCard, RefreshCw, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { io } from 'socket.io-client';

export default function OrdersPage() {
  const router = useRouter();
  const { session, status, getUserOrders, cancelOrder } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [updatedOrders, setUpdatedOrders] = useState<Set<string>>(new Set());
  const fetchingRef = useRef(false);
  const lastFetchTimeRef = useRef<number>(0);
  const isVisibleRef = useRef(true);
  const socketRef = useRef<any>(null);
  const [socketConnected, setSocketConnected] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    // Only initialize socket if user is authenticated
    if (!session?.user?.id) return;
    
    // Initialize the socket server first
    fetch('/api/socket-init').finally(() => {
      // Then connect to it
      const socket = io({
        // Add connection options to reduce unnecessary traffic
        reconnectionAttempts: 5,
        reconnectionDelay: 5000,
        timeout: 10000
      });
      socketRef.current = socket;
      
      socket.on('connect', () => {
        console.log('Socket connected');
        setSocketConnected(true);
        
        // Join user-specific room if authenticated
        if (session?.user?.id) {
          socket.emit('join-user-room', session.user.id);
        }
      });
      
      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setSocketConnected(false);
      });
      
      // Listen for order updates
      socket.on('order-created', (newOrder) => {
        console.log('New order created:', newOrder);
        showNotification(`New order created: #${newOrder.id.substring(0, 8)}`, 'success');
        
        // Update orders list
        setOrders(prevOrders => {
          // Check if order already exists
          if (prevOrders.some(order => order.id === newOrder.id)) {
            return prevOrders;
          }
          return [newOrder, ...prevOrders];
        });
        setLastUpdated(new Date());
      });
      
      socket.on('order-updated', (updatedOrder) => {
        console.log('Order updated received via socket:', updatedOrder);
        
        // Ensure both id and _id are available for compatibility
        const normalizedUpdate = {
          ...updatedOrder,
          id: updatedOrder.id || updatedOrder._id,
          _id: updatedOrder._id || updatedOrder.id
        };
        
        // Ensure the update is for this user
        if (normalizedUpdate.userId && normalizedUpdate.userId !== session?.user?.id) {
          console.log(`Ignoring update for order ${normalizedUpdate.id} - belongs to user ${normalizedUpdate.userId}`);
          return;
        }
        
        // Update orders list
        setOrders(prevOrders => {
          // Check if we have this order in our list (try both id and _id)
          const hasOrder = prevOrders.some(order => 
            (order.id && (order.id === normalizedUpdate.id || order.id === normalizedUpdate._id)) || 
            (order._id && (order._id === normalizedUpdate.id || order._id === normalizedUpdate._id))
          );
          
          if (!hasOrder) {
            console.log(`Order ${normalizedUpdate.id} not found in current orders list, cannot update`);
            return prevOrders;
          }
          
          console.log(`Updating order ${normalizedUpdate.id} to status: ${normalizedUpdate.status}`);
          
          // Update orders list with visual indicator for updated orders
          const newUpdatedOrders = new Set(updatedOrders);
          newUpdatedOrders.add(normalizedUpdate.id);
          setUpdatedOrders(newUpdatedOrders);
          
          // Play a sound notification (optional)
          try {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(e => console.log('Audio play error:', e));
          } catch (e) {
            console.log('Audio not supported');
          }
          
          // Show notification with the new status
          showNotification(`Order #${normalizedUpdate.id.substring(0, 8)} updated to ${normalizedUpdate.status}`, 'success');
          
          // Return updated orders list, matching on either id or _id
          return prevOrders.map(order => {
            const isMatch = 
              (order.id && (order.id === normalizedUpdate.id || order.id === normalizedUpdate._id)) ||
              (order._id && (order._id === normalizedUpdate.id || order._id === normalizedUpdate._id));
            
            return isMatch ? { ...order, ...normalizedUpdate } : order;
          });
        });
        
        setLastUpdated(new Date());
      });
      
      return () => {
        socket.disconnect();
      };
    });
  }, [session?.user?.id]); // Only re-run if user ID changes

  // Memoize the fetchOrders function to use in the polling effect
  const fetchOrders = useCallback(async (showLoading = true, force = false) => {
    // Don't fetch if tab is not visible unless forced
    if (!isVisibleRef.current && !force) {
      return;
    }
    
    // Prevent multiple simultaneous fetches and limit frequency
    const now = Date.now();
    if (fetchingRef.current || (!force && now - lastFetchTimeRef.current < 30000)) { // Increased to 30 seconds
      return;
    }

    try {
      fetchingRef.current = true;
      if (showLoading) setIsLoading(true);
      
      console.log("OrdersPage: Fetching orders...");
      console.log("OrdersPage: Session user:", session?.user?.email);
      console.log("OrdersPage: Session user ID:", session?.user?.id);
      
      const ordersData = await getUserOrders();
      lastFetchTimeRef.current = Date.now();
      console.log(`OrdersPage: Fetched ${ordersData?.length || 0} orders`);
      
      // Ensure ordersData is an array
      const safeOrdersData = Array.isArray(ordersData) ? ordersData : [];
      
      // Log the first order for debugging
      if (safeOrdersData.length > 0) {
        console.log("OrdersPage: First order sample:", {
          id: safeOrdersData[0].id,
          userId: safeOrdersData[0].userId,
          status: safeOrdersData[0].status,
          itemCount: safeOrdersData[0].items?.length || 0
        });
      } else {
        console.log("OrdersPage: No orders found");
      }
      
      // Check for status changes - only if we have existing orders
      if (orders.length > 0 && safeOrdersData.length > 0) {
        const newUpdatedOrders = new Set(updatedOrders);
        let statusChanged = false;
        
        safeOrdersData.forEach(newOrder => {
          const oldOrder = orders.find(o => o.id === newOrder.id);
          if (oldOrder && oldOrder.status !== newOrder.status) {
            // Status has changed, mark this order as updated
            newUpdatedOrders.add(newOrder.id);
            statusChanged = true;
            
            // Show a notification about the status change
            showNotification(
              `Order #${newOrder.id.substring(0, 8)} status updated to ${newOrder.status}`,
              'success'
            );
          }
        });
        
        // Only update state if there were actual changes
        if (statusChanged) {
          setUpdatedOrders(newUpdatedOrders);
        }
      }
      
      // Only update orders state if there are actual changes
      if (JSON.stringify(safeOrdersData) !== JSON.stringify(orders)) {
        console.log("OrdersPage: Updating orders state with new data");
        setOrders(safeOrdersData);
        setLastUpdated(new Date());
      } else {
        console.log("OrdersPage: No changes in orders data");
      }
    } catch (error) {
      console.error('OrdersPage: Error fetching orders:', error);
      showNotification('Failed to load orders', 'error');
    } finally {
      if (showLoading) setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [getUserOrders, orders, updatedOrders, session]);

  // Load orders when authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/auth/signin');
    } else if (status === "authenticated" && !fetchingRef.current) {
      fetchOrders();
    }
  }, [status, router, fetchOrders]);

  // Add visibility change detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible';
      
      // Only fetch if tab becomes visible and enough time has passed
      if (isVisibleRef.current && 
          !socketConnected && 
          Date.now() - lastFetchTimeRef.current > 300000) { // 5 minutes
        fetchOrders(false);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchOrders, socketConnected]);

  // Optimize polling interval
  useEffect(() => {
    if (status !== "authenticated") return;

    // Set up polling interval with a longer delay and better conditions
    const intervalId = setInterval(() => {
      // Only fetch if:
      // 1. Tab is visible
      // 2. Socket is not connected
      // 3. Enough time has passed since last fetch
      if (isVisibleRef.current && 
          !socketConnected && 
          Date.now() - lastFetchTimeRef.current > 600000) { // 10 minutes
        fetchOrders(false);
      }
    }, 600000); // Check every 10 minutes
    
    return () => clearInterval(intervalId);
  }, [status, fetchOrders, socketConnected]);

  // Optimize socket connection
  useEffect(() => {
    if (!session?.user?.id || socketRef.current) return;

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
      transports: ['websocket'],
      query: {
        userId: session.user.id
      }
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocketConnected(false);
    });

    socket.on('orderUpdate', (updatedOrder) => {
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
      setUpdatedOrders(prev => new Set(prev).add(updatedOrder.id));
    });

    socketRef.current = socket;

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [session?.user?.id]);

  const refreshOrders = async () => {
    try {
      setIsRefreshing(true);
      // Force refresh by passing true as the second parameter
      await fetchOrders(false, true);
      showNotification('Orders refreshed successfully', 'success');
    } catch (error) {
      console.error('Error refreshing orders:', error);
      showNotification('Failed to refresh orders', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setIsCancelling(true);
      console.log(`Attempting to cancel order ${orderId}`);
      
      const result = await cancelOrder(orderId);
      console.log('Cancel order result:', result);
      
      // Update the order in the local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: 'cancelled' } : order
        )
      );
      
      showNotification('Order cancelled successfully', 'success');
      
      // Refresh the orders to ensure we have the latest data
      await fetchOrders(false, true);
    } catch (error) {
      console.error('Error cancelling order:', error);
      showNotification(`Failed to cancel order: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  // Toggle order expansion
  const toggleOrderExpand = (orderId) => {
    // If this order was marked as updated, clear that status
    if (updatedOrders.has(orderId)) {
      clearUpdatedStatus(orderId);
    }
    
    // Toggle expansion
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  };

  // Clear updated status for an order
  const clearUpdatedStatus = (orderId) => {
    setUpdatedOrders(prev => {
      const newSet = new Set(prev);
      newSet.delete(orderId);
      return newSet;
    });
  };

  // Handle filter button clicks
  const handleFilterClick = (filter) => {
    console.log(`OrdersPage: Filter clicked: ${filter}`);
    setActiveFilter(filter);
    
    // If "All Orders" is clicked, refresh the orders from the database
    if (filter === 'all') {
      console.log('OrdersPage: "All Orders" clicked, refreshing orders...');
      refreshOrders();
    }
  };

  // Filter orders based on active filter
  const filteredOrders = useMemo(() => {
    if (activeFilter === 'all') {
      return orders;
    }
    return orders.filter(order => order.status === activeFilter);
  }, [orders, activeFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ShoppingBag size={12} className="mr-1" />
            Pending
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Package size={12} className="mr-1" />
            Processing
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            <Truck size={12} className="mr-1" />
            Shipped
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" />
            Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={12} className="mr-1" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const getStatusTimeline = (status: string) => {
    const steps = [
      { key: 'pending', label: 'Pending' },
      { key: 'processing', label: 'Processing' },
      { key: 'shipped', label: 'Shipped' },
      { key: 'delivered', label: 'Delivered' }
    ];
    
    if (status === 'cancelled') {
      return (
        <div className="flex items-center justify-center mt-4 mb-2">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">Order Cancelled</p>
            <p className="text-xs text-gray-500">This order has been cancelled</p>
          </div>
        </div>
      );
    }
    
    const currentStepIndex = steps.findIndex(step => step.key === status);
    
    return (
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Order Status</h4>
        <div className="flex items-center">
          {steps.map((step, idx) => {
            const isActive = idx <= currentStepIndex;
            const isLast = idx === steps.length - 1;
            
            return (
              <Fragment key={step.key}>
                {/* Circle indicator */}
                <div className={`h-2 w-2 rounded-full ${
                  isActive ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                
                {/* Connector line */}
                {!isLast && (
                  <div className={`h-1 flex-1 ${
                    idx < currentStepIndex ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                )}
              </Fragment>
            );
          })}
        </div>
        
        {/* Status labels */}
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          {steps.map((step, idx) => (
            <span key={step.key} className={
              status === step.key ? 'font-medium text-green-600' : ''
            }>{step.label}</span>
          ))}
        </div>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (status === "loading" || isLoading) {
    return (
      <MainLayout>
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  return (
    <MainLayout>
      <div className="bg-gray-50 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
            <p className="text-gray-600">View and manage your orders</p>
          </div>

          {/* Status Filters */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex space-x-2 pb-2">
              <button
                onClick={() => handleFilterClick('all')}
                className={`px-4 py-2 text-sm font-medium rounded-md mr-2 whitespace-nowrap ${
                  activeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                All Orders
              </button>
              <button
                onClick={() => handleFilterClick('pending')}
                className={`px-4 py-2 text-sm font-medium rounded-md mr-2 whitespace-nowrap ${
                  activeFilter === 'pending' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => handleFilterClick('processing')}
                className={`px-4 py-2 text-sm font-medium rounded-md mr-2 whitespace-nowrap ${
                  activeFilter === 'processing' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                Processing
              </button>
              <button
                onClick={() => handleFilterClick('shipped')}
                className={`px-4 py-2 text-sm font-medium rounded-md mr-2 whitespace-nowrap ${
                  activeFilter === 'shipped' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                Shipped
              </button>
              <button
                onClick={() => handleFilterClick('delivered')}
                className={`px-4 py-2 text-sm font-medium rounded-md mr-2 whitespace-nowrap ${
                  activeFilter === 'delivered' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                Delivered
              </button>
              <button
                onClick={() => handleFilterClick('cancelled')}
                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                  activeFilter === 'cancelled' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                Cancelled
              </button>
            </div>
          </div>

          {/* Refresh Button and Last Updated */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={refreshOrders}
              disabled={isRefreshing}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <RefreshCw size={16} className={`mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Orders'}
            </button>
            {lastUpdated && (
              <div className="text-xs text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* Orders List */}
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-gray-400 mb-4">
                <ShoppingBag size={48} className="mx-auto" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h2>
              <p className="text-gray-600 mb-6">
                {activeFilter === 'all'
                  ? "You haven't placed any orders yet."
                  : `You don't have any ${activeFilter} orders.`}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/products"
                  className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700"
                >
                  Start Shopping
                </Link>
              </div>
              
              {/* Debug section */}
              {process.env.NODE_ENV !== 'production' && (
                <div className="mt-8 border-t pt-6 text-left">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Debug Information</h3>
                  <div className="bg-gray-100 p-4 rounded-md text-gray-800">
                    <p className="text-sm mb-2"><strong>Session User ID:</strong> {session?.user?.id || 'Not available'}</p>
                    <p className="text-sm mb-2"><strong>Session User Email:</strong> {session?.user?.email || 'Not available'}</p>
                    <p className="text-sm mb-2"><strong>Authentication Status:</strong> {status}</p>
                    <p className="text-sm mb-2"><strong>Raw Orders Count:</strong> {orders.length}</p>
                    <p className="text-sm mb-2"><strong>Last Updated:</strong> {lastUpdated?.toLocaleString() || 'Never'}</p>
                    <p className="text-sm mb-2"><strong>Socket Connected:</strong> {socketConnected ? 'Yes' : 'No'}</p>
                    
                    {orders.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-1">Raw Orders Data:</h4>
                        <pre className="text-xs bg-gray-800 text-white p-3 rounded-md overflow-auto max-h-60">
                          {JSON.stringify(orders, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={refreshOrders}
                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Force Refresh
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <div 
                  key={order.id} 
                  className={`bg-white rounded-xl shadow-sm overflow-hidden mb-4 transition-all ${
                    updatedOrders.has(order.id) 
                      ? 'ring-2 ring-blue-500 relative' 
                      : ''
                  }`}
                >
                  {updatedOrders.has(order.id) && (
                    <div className="absolute top-0 right-0 mt-2 mr-2 z-10">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 animate-pulse">
                        <AlertCircle size={12} className="mr-1" />
                        Status Updated
                      </span>
                    </div>
                  )}
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 relative"
                    onClick={() => toggleOrderExpand(order.id)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center mb-2 md:mb-0">
                        <div className={`mr-4 ${updatedOrders.has(order.id) ? 'animate-bounce' : ''}`}>
                          {getStatusBadge(order.status)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Order #{order.id.substring(0, 8)}</p>
                          <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 mr-4">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <ChevronRight 
                          size={20} 
                          className={`text-gray-400 transition-transform ${
                            expandedOrderId === order.id ? 'rotate-90' : ''
                          }`} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Order details when expanded */}
                  {expandedOrderId === order.id && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      {/* Status update banner */}
                      {updatedOrders.has(order.id) && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4 flex items-start">
                          <AlertCircle size={20} className="text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">
                              Order status was recently updated
                            </p>
                            <p className="text-sm text-blue-700">
                              Current status: <span className="font-semibold">{order.status}</span>
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Order details header */}
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
                          <p className="text-sm text-gray-600">
                            Order ID: {order.id}
                          </p>
                        </div>
                        <div className="mt-2 md:mt-0 flex items-center">
                          <div className="flex items-center mr-4">
                            <Calendar size={16} className="text-gray-500 mr-1" />
                            <span className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <CreditCard size={16} className="text-gray-500 mr-1" />
                            <span className="text-sm text-gray-600">
                              {formatCurrency(order.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Status timeline */}
                      {getStatusTimeline(order.status)}
                      
                      {/* Order items */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-medium text-gray-700">
                            Items ({order.items.length})
                          </h4>
                          {(order.status === 'pending' || order.status === 'processing') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent expanding/collapsing when clicking the button
                                handleCancelOrder(order.id);
                              }}
                              disabled={isCancelling}
                              className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center"
                            >
                              {isCancelling ? (
                                <>
                                  <RefreshCw size={14} className="mr-1 animate-spin" />
                                  Cancelling...
                                </>
                              ) : (
                                <>
                                  <XCircle size={14} className="mr-1" />
                                  Cancel Order
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          {/* Show first 3 items */}
                          {order.items.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-center">
                              <div className="w-12 h-12 relative rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                <Image
                                  src={item.image || '/images/placeholder.png'}
                                  alt={item.name}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="ml-4 flex-1">
                                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                <p className="text-xs text-gray-500">
                                  {formatCurrency(item.price)} × {item.quantity}
                                </p>
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                {formatCurrency(item.price * item.quantity)}
                              </div>
                            </div>
                          ))}
                          
                          {/* Show summary if more than 3 items */}
                          {order.items.length > 3 && (
                            <p className="text-sm text-gray-600 italic">
                              + {order.items.length - 3} more item(s)
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Debug section - only in development */}
              {process.env.NODE_ENV !== 'production' && (
                <div className="mt-8 border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Debug Information</h3>
                  <div className="bg-gray-100 p-4 rounded-md text-gray-800">
                    <p className="text-sm mb-2"><strong>Session User ID:</strong> {session?.user?.id || 'Not available'}</p>
                    <p className="text-sm mb-2"><strong>Session User Email:</strong> {session?.user?.email || 'Not available'}</p>
                    <p className="text-sm mb-2"><strong>Authentication Status:</strong> {status}</p>
                    <p className="text-sm mb-2"><strong>Raw Orders Count:</strong> {orders.length}</p>
                    <p className="text-sm mb-2"><strong>Filtered Orders Count:</strong> {filteredOrders.length}</p>
                    <p className="text-sm mb-2"><strong>Active Filter:</strong> {activeFilter}</p>
                    <p className="text-sm mb-2"><strong>Last Updated:</strong> {lastUpdated?.toLocaleString() || 'Never'}</p>
                    <p className="text-sm mb-2"><strong>Socket Connected:</strong> {socketConnected ? 'Yes' : 'No'}</p>
                    
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={refreshOrders}
                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Force Refresh
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 
"use client";

import React, { useState, useEffect, Fragment, useRef } from 'react';
import { 
  ShoppingBag, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/utils/currency';
import { io } from 'socket.io-client';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  phone?: string;
  streetAddress?: string;
}

interface Order {
  _id?: string;
  id?: string;
  orderId?: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

const TEST_MODE = process.env.NODE_ENV === 'development';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [updatedOrdersCount, setUpdatedOrdersCount] = useState(0);
  const socketRef = useRef<any>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
    
    // Initialize the socket server first
    fetch('/api/socket-init')
      .then(response => {
        console.log('Socket server initialization response:', response.status);
        return response.text();
      })
      .then(text => {
        console.log('Socket init response:', text);
      })
      .catch(error => {
        console.error('Error initializing socket server:', error);
      })
      .finally(() => {
        // Then connect to it with proper configuration
        const socket = io({
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 20000,
          transports: ['websocket'],
          // No custom path needed since we're using the default Socket.IO path
        });
        socketRef.current = socket;
        
        socket.on('connect', () => {
          console.log('Admin socket connected with id:', socket.id);
          setSocketConnected(true);
          
          // Join admin room
          socket.emit('join-admin-room');
          console.log('Sent join-admin-room event');
          
          // Fetch fresh data after connection
          fetchOrders();
        });
        
        socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          // Display connection error to user
          showNotification(`Socket connection error: ${error.message}`, 'error');
        });
        
        socket.on('disconnect', (reason) => {
          console.log('Admin socket disconnected. Reason:', reason);
          setSocketConnected(false);
          showNotification(`Socket disconnected: ${reason}`, 'error');
        });
        
        // Listen for new orders
        socket.on('new-order', (newOrder) => {
          console.log('New order received:', newOrder);
          
          // Add the new order to the list if it doesn't already exist
          setOrders(prevOrders => {
            // Check if order already exists
            if (prevOrders.some(order => order._id === newOrder._id)) {
              return prevOrders;
            }
            return [newOrder, ...prevOrders];
          });
          
          // Increment new orders count
          setNewOrdersCount(prev => prev + 1);
          
          // Show notification
          showNotification(`New order received: #${newOrder._id ? newOrder._id.substring(0, 8) : 'N/A'}`, 'success');
        });
        
        // Listen for order status changes
        socket.on('order-status-changed', (updatedOrder) => {
          console.log('Order status changed event received:', updatedOrder);
          
          if (!updatedOrder || !updatedOrder._id) {
            console.error('Invalid order data received in order-status-changed event');
            return;
          }
          
          // Update the order in the list
          setOrders(prevOrders => {
            console.log(`Updating order ${updatedOrder._id} to status: ${updatedOrder.status}`);
            return prevOrders.map(order => 
              order._id === updatedOrder._id ? { ...order, ...updatedOrder } : order
            );
          });
          
          // Update selectedOrder if this is the currently selected order
          if (selectedOrder && selectedOrder._id === updatedOrder._id) {
            setSelectedOrder(data.data);
          }
          
          // Increment updated orders count
          setUpdatedOrdersCount(prev => prev + 1);
          
          // Show notification (but only if it wasn't updated by this client)
          if (updatedOrder._id !== "justUpdatedFromThisClient") {
            showNotification(
              `Order #${updatedOrder._id.substring(0, 8)} status updated to ${updatedOrder.status}`,
              'success'
            );
          }
        });
        
        // Add additional event listeners for error handling
        socket.on('error', (error) => {
          console.error('Socket error:', error);
          showNotification(`Socket error: ${error.message || 'Unknown error'}`, 'error');
        });
        
        socket.on('reconnect', (attemptNumber) => {
          console.log(`Socket reconnected after ${attemptNumber} attempts`);
          showNotification('Socket reconnected successfully', 'success');
          fetchOrders(); // Refresh data after reconnection
        });
        
        socket.on('reconnect_error', (error) => {
          console.error('Socket reconnection error:', error);
          showNotification('Socket reconnection error: ' + error.message, 'error');
        });

        // Fix the selectedOrder update
        socket.on('orderUpdate', (updatedOrder) => {
          console.log('Socket: Order update received:', updatedOrder);
          
          setOrders(prevOrders => 
            prevOrders.map(order => 
              (order._id === updatedOrder._id || order.id === updatedOrder.id) 
                ? { ...order, ...updatedOrder } 
                : order
            )
          );
          
          // Update selectedOrder if this is the currently selected order
          if (selectedOrder && (selectedOrder._id === updatedOrder._id || selectedOrder.id === updatedOrder.id)) {
            setSelectedOrder({
              ...selectedOrder,
              ...updatedOrder,
              // Ensure status is cast to the correct type
              status: updatedOrder.status as Order['status']
            });
          }
          
          showNotification(`Order ${updatedOrder._id} has been updated`, 'success');
        });
      });
    
    // Cleanup function
    return () => {
      if (socketRef.current) {
        console.log('Closing socket connection...');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []); // Only run on component mount

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/orders', {
        // Add cache control to ensure fresh data
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        console.log('Orders loaded:', data.data.length);
        // Check the structure of the first order if available
        if (data.data && data.data.length > 0) {
          console.log('First order sample:', data.data[0]);
          console.log('Order ID type:', typeof data.data[0]._id);
          console.log('Has _id:', !!data.data[0]._id);
          console.log('Has id:', !!data.data[0].id);
        }
        
        // Normalize all orders to ensure they have both id and _id
        const normalizedOrders = data.data.map(order => {
          // Extract an ID from any available field
          const identifier = order._id || order.id || order.orderId;
          
          return {
            ...order,
            id: order.id || identifier,
            _id: order._id || identifier
          };
        });
        
        setOrders(normalizedOrders);
        // Reset counters
        setNewOrdersCount(0);
        setUpdatedOrdersCount(0);
      } else {
        console.error('Failed to fetch orders:', data.message);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get a valid order ID with better error handling and default values
  const getValidOrderId = (order: Order | null): string => {
    if (!order) {
      throw new Error('No order selected');
    }
    
    const orderId = order._id || order.id || order.orderId;
    if (!orderId) {
      console.error('Order missing ID fields:', order);
      throw new Error('No valid order ID found');
    }
    return orderId;
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    console.log(`Attempting to update order ${orderId} to status: ${status}`);
    console.log('OrderID type:', typeof orderId); // Debug
    console.log('OrderID value:', orderId); // Debug
    console.log('Status value:', status); // Debug
    
    if (!orderId || !status) {
      console.error('Invalid order ID or status - orderId:', orderId, 'status:', status);
      showNotification('Invalid order ID or status', 'error');
      return;
    }
    
    try {
      // Validate order ID format - ensure it's a string
      if (typeof orderId !== 'string') {
        console.error(`Invalid order ID format: ${typeof orderId}`);
        showNotification('Invalid order ID format', 'error');
        return;
      }
      
      // Validate status value
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        console.error(`Invalid status value: ${status}`);
        showNotification('Invalid order status value', 'error');
        return;
      }
      
      setIsUpdating(true);
      console.log(`Sending request to update order ${orderId} with status: ${status}`);
      
      try {
        // First, get the order to ensure it exists
        console.log(`Checking if order ${orderId} exists before updating`);
        const orderResponse = await fetch(`/api/admin/orders/${orderId}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        console.log(`GET order response status: ${orderResponse.status}`);
        
        if (!orderResponse.ok) {
          const errorData = await orderResponse.json();
          console.error('Error fetching order before update:', errorData);
          showNotification(`Cannot update: ${errorData.message || 'Order not found'}`, 'error');
          setIsUpdating(false);
          return;
        }
        
        const existingOrderData = await orderResponse.json();
        console.log('Existing order data:', existingOrderData);
        
        if (!existingOrderData.success || !existingOrderData.data) {
          console.error('Invalid order data structure:', existingOrderData);
          showNotification('Unable to retrieve valid order data', 'error');
          setIsUpdating(false);
          return;
        }
        
        const existingOrder = existingOrderData.data;
        
        // Extract the proper order ID to use for updates
        // This is important because Firebase might store the ID differently than the API returns it
        const dbOrderId = existingOrder._id || existingOrder.id || orderId;
        
        // Proceed with the update using the confirmed ID
        console.log(`Sending PUT request to update order ${dbOrderId} with status: ${status}`);
        const response = await fetch(`/api/admin/orders/${dbOrderId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
          body: JSON.stringify({ status }),
        });

        console.log(`PUT response status: ${response.status}`);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Order update failed with response:', errorData);
          showNotification(`Failed to update order: ${errorData.message || 'Unknown error'}`, 'error');
          setIsUpdating(false);
          return;
        }

        const data = await response.json();
        console.log('Update order response:', data);
        
        if (data.success) {
          // Update the order in the local state - use the returned data.data if available
          if (data.data) {
            // Directly replace the order with the updated data from the server
            setOrders(prevOrders => 
              prevOrders.map(order => 
                (order._id === dbOrderId || order.id === dbOrderId) ? data.data : order
              )
            );
            
            // Also update selectedOrder if this is the currently selected order
            if (selectedOrder && (selectedOrder._id === dbOrderId || selectedOrder.id === dbOrderId)) {
              setSelectedOrder(data.data);
            }
          } else {
            // Fallback to just updating the status
            setOrders(prevOrders => 
              prevOrders.map(order => 
                (order._id === dbOrderId || order.id === dbOrderId) ? { 
                  ...order, 
                  status, 
                  updatedAt: new Date().toISOString() 
                } : order
              )
            );
            
            // Update selectedOrder if this is the currently selected order
            if (selectedOrder && (selectedOrder._id === dbOrderId || selectedOrder.id === dbOrderId)) {
              setSelectedOrder({
                ...selectedOrder,
                status: status as Order['status'],
                updatedAt: new Date().toISOString()
              });
            }
          }
          
          // Show success notification
          showNotification(`Order status updated to ${status}`, 'success');
          
          // Emit event manually to all connected clients via socket if needed
          if (socketRef.current && socketConnected) {
            // Either use the data returned from the server or find in local state
            const updatedOrder = data.data || orders.find(order => 
              order._id === dbOrderId || order.id === dbOrderId
            );
            
            if (updatedOrder) {
              console.log('Emitting order status change event via socket');
              
              // Mark this update as coming from this client to avoid duplicate notifications
              const enhancedData = {
                ...updatedOrder,
                _id: dbOrderId,
                id: dbOrderId, // Include both formats for compatibility
                status,
                updatedAt: new Date().toISOString(),
                _clientId: socketRef.current.id // Add client ID to identify source
              };
              
              // Emit the event with all necessary information
              socketRef.current.emit('admin-order-update', enhancedData);
              console.log('Emitted admin-order-update event with data');
            }
          } else {
            console.warn('Socket not connected - real-time updates may not work');
            showNotification('Order updated, but socket not connected for real-time updates', 'success');
          }
        } else {
          console.error('Failed to update order status:', data.message);
          showNotification(`Failed to update order: ${data.message}`, 'error');
        }
      } catch (fetchError) {
        console.error('Network error when updating order:', fetchError);
        showNotification(`Network error: ${fetchError.message || 'Cannot connect to server'}`, 'error');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showNotification(`Error updating order: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setIsUpdating(false);
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

  const toggleOrderExpand = (orderId: string | undefined) => {
    if (!orderId) return;
    
    // If we're expanding this order, find it and set as selectedOrder
    if (expandedOrderId !== orderId) {
      const orderToSelect = orders.find(order => order._id === orderId || order.id === orderId);
      setSelectedOrder(orderToSelect || null);
    } else {
      // If we're closing the expanded view, clear the selectedOrder
      setSelectedOrder(null);
    }
    
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Helper to prevent clicks on buttons from toggling row expansion
  const preventRowToggle = (e: React.MouseEvent) => {
    // Check if the click was on or inside a button
    let target = e.target as HTMLElement;
    while (target && target !== e.currentTarget) {
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        e.stopPropagation();
        return;
      }
      target = target.parentElement as HTMLElement;
    }
  };

  const getFilteredOrders = () => {
    return orders.filter(order => {
      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }
      
      // Date filter
      if (dateFilter !== 'all') {
        const orderDate = new Date(order.createdAt);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (dateFilter === 'today' && 
            !(orderDate.getDate() === today.getDate() && 
              orderDate.getMonth() === today.getMonth() && 
              orderDate.getFullYear() === today.getFullYear())) {
          return false;
        }
        
        if (dateFilter === 'yesterday' && 
            !(orderDate.getDate() === yesterday.getDate() && 
              orderDate.getMonth() === yesterday.getMonth() && 
              orderDate.getFullYear() === yesterday.getFullYear())) {
          return false;
        }
        
        if (dateFilter === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (orderDate < weekAgo) {
            return false;
          }
        }
        
        if (dateFilter === 'month') {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          if (orderDate < monthAgo) {
            return false;
          }
        }
      }
      
      // Search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          (order._id && order._id.toLowerCase().includes(searchLower)) ||
          (order.userEmail && order.userEmail.toLowerCase().includes(searchLower)) ||
          (order.userName && order.userName.toLowerCase().includes(searchLower)) ||
          order.items.some(item => item.name.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    });
  };

  const getStatusBadge = (status: Order['status']) => {
    if (!status) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Unknown
        </span>
      );
    }
    
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ShoppingBag size={12} className="mr-1" />
            Pending
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Package size={12} className="mr-1" />
            Processing
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            <Truck size={12} className="mr-1" />
            Shipped
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" />
            Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={12} className="mr-1" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = getFilteredOrders();

  // Add a new function to test socket events (development only)
  const testSocketEvent = (eventType) => {
    if (!TEST_MODE) return;
    
    if (!socketRef.current || !socketConnected) {
      showNotification('Socket not connected. Cannot test events.', 'error');
      return;
    }
    
    console.log(`Testing socket event: ${eventType}`);
    
    if (eventType === 'order-status-changed') {
      // Check if we have orders to test with
      if (!orders || orders.length === 0) {
        console.error('No orders available to test with');
        showNotification('No orders available to test with. Please add at least one order.', 'error');
        return;
      }
      
      // Create a test event with the first order
      // Use a valid status from the Order type
      const testStatus: Order['status'] = 'processing';
      const testOrder = { 
        ...orders[0], 
        status: testStatus, 
        testEvent: true 
      };
      
      // Safety check for required properties
      if (!testOrder || !testOrder._id) {
        console.error('Invalid test order data:', testOrder);
        showNotification('Invalid test order data', 'error');
        return;
      }
      
      console.log('Simulating order-status-changed with test data:', testOrder);
      
      // Safer approach: Manually emit the event to ourselves
      // This avoids accessing internal Socket.IO structures
      try {
        // Directly update our state as if we received the event
        setOrders(prevOrders => {
          return prevOrders.map(order => 
            order._id === testOrder._id ? testOrder as Order : order
          );
        });
        
        // Increment updated orders count for UI feedback
        setUpdatedOrdersCount(prev => prev + 1);
        
        // Show notification
        showNotification(
          `Test event: Order #${testOrder._id.substring(0, 8)} status updated to ${testOrder.status}`,
          'success'
        );
        
        // Manually emit the event to the socket for testing purposes
        if (socketRef.current) {
          try {
            console.log('Manually emitting test event to the server');
            // This is just for development testing, emitting locally
            socketRef.current.emit('admin-test-event', {
              type: 'order-status-changed',
              data: testOrder
            });
          } catch (socketError) {
            console.error('Error emitting test event to socket:', socketError);
          }
        }
      } catch (error) {
        console.error('Error simulating event:', error);
        showNotification('Error simulating event: ' + (error.message || 'Unknown error'), 'error');
      }
    } else {
      showNotification(`Unsupported test event type: ${eventType}`, 'error');
    }
  };

  // Add testing and diagnostic functions
  const checkSocketConnections = async () => {
    try {
      // Get all user IDs from orders
      const userIds = Array.from(new Set(orders.map(order => order.userId)));
      const results: string[] = [];
      
      // Basic socket status
      results.push(`Admin socket connected: ${socketConnected}`);
      results.push(`Socket ID: ${socketRef.current?.id || 'N/A'}`);
      
      // Check server connection status
      const response = await fetch('/api/socket-init?check=status');
      const socketStatus = await response.json();
      
      results.push(`Socket server initialized: ${socketStatus.initialized}`);
      results.push(`Active connections: ${socketStatus.activeConnections}`);
      
      // Check each user connection (limit to first 5 for performance)
      for (const userId of userIds.slice(0, 5)) {
        if (userId) {
          const userCheckResponse = await fetch(`/api/socket-init?check=status&userId=${userId}`);
          const userStatus = await userCheckResponse.json();
          results.push(`User ${typeof userId === 'string' ? userId.substring(0, 8) : userId}: ${userStatus.userConnected ? 'connected' : 'not connected'}`);
        }
      }
      
      // Display results
      const resultMessage = results.join('\n');
      console.log('Socket diagnostic results:', resultMessage);
      
      // Create a modal or alert to show the results
      alert('Socket Diagnostics:\n\n' + resultMessage);
      
    } catch (error) {
      console.error('Error checking socket connections:', error);
      showNotification('Error checking socket connections', 'error');
    }
  };

  // Add a test UI element (visible only in development)
  const renderTestPanel = () => {
    if (!TEST_MODE) return null;
    
    return (
      <div className="bg-black bg-opacity-80 text-white p-4 rounded-lg mt-4">
        <h3 className="text-yellow-400 font-bold mb-2">DEVELOPMENT TEST PANEL</h3>
        <div className="flex items-center space-x-2 mb-2">
          <span>Socket Status: </span>
          <span className={socketConnected ? "text-green-400" : "text-red-400"}>
            {socketConnected ? "Connected" : "Disconnected"}
          </span>
          {socketConnected && socketRef.current && (
            <span className="text-xs text-gray-400 ml-2">ID: {socketRef.current.id}</span>
          )}
        </div>
        
        <div className="mb-3">
          <div className="text-xs text-gray-400 mb-1">Test Actions:</div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => testSocketEvent('order-status-changed')}
              className="px-2 py-1 bg-yellow-500 text-black rounded-md text-xs mb-2"
            >
              Test Status Change Event
            </button>
            
            <button 
              onClick={checkSocketConnections}
              className="px-2 py-1 bg-blue-500 text-white rounded-md text-xs mb-2"
            >
              Diagnose Socket Connections
            </button>
            
            <button 
              onClick={() => {
                // Reinitialize socket connection
                if (socketRef.current) {
                  socketRef.current.disconnect();
                }
                
                setTimeout(() => {
                  const socket = io({
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                    timeout: 20000,
                    transports: ['websocket']
                  });
                  socketRef.current = socket;
                  
                  socket.on('connect', () => {
                    console.log('Admin socket reconnected with id:', socket.id);
                    setSocketConnected(true);
                    socket.emit('join-admin-room');
                    showNotification('Socket reconnected successfully', 'success');
                  });
                  
                  socket.on('connect_error', (error) => {
                    console.error('Socket reconnection error:', error);
                    showNotification('Socket reconnection error: ' + error.message, 'error');
                  });
                }, 500);
              }}
              className="px-2 py-1 bg-green-500 text-white rounded-md text-xs mb-2"
            >
              Reconnect Socket
            </button>
          </div>
        </div>
        
        <div className="text-xs text-gray-400 mb-1">Debug Info:</div>
        <div className="bg-gray-800 p-2 rounded text-xs font-mono mb-3">
          <div>Orders: {orders.length}</div>
          <div>Updated: {updatedOrdersCount}</div>
          <div>New: {newOrdersCount}</div>
          <div>Mode: {process.env.NODE_ENV}</div>
        </div>
        
        <div className="text-xs text-gray-400">
          <p>Use these tools to test real-time order updates.</p>
          <p>Check browser console for detailed logs.</p>
        </div>
      </div>
    );
  };

  // Add this helper function to format order IDs consistently
  const getOrderIdDisplay = (order: Order): string => {
    const orderId = order._id || order.id || order.orderId;
    if (!orderId) return 'N/A';
    
    // Always return the first 8 characters of the ID, or the full ID if it's shorter
    return orderId.substring(0, 8);
  };

  // Add a new function to delete an order
  const deleteOrder = async (order: Order) => {
    if (!order || !order._id) {
      showNotification('Invalid order - cannot delete', 'error');
      return;
    }
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete order ${getOrderIdDisplay(order)}?`)) {
      return;
    }
    
    try {
      const orderId = getValidOrderId(order);
      console.log(`Deleting order ${orderId}`);
      
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        showNotification(`Order ${getOrderIdDisplay(order)} deleted successfully`, 'success');
        // Remove the order from the local state
        setOrders(prevOrders => prevOrders.filter(o => getValidOrderId(o) !== orderId));
      } else {
        throw new Error(result.message || 'Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      showNotification(`Failed to delete order: ${error.message}`, 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <div className="flex items-center space-x-2">
          {/* Socket connection status indicator */}
          <div className={`px-2 py-1 rounded text-xs font-medium flex items-center ${
            socketConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-1 ${
              socketConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {socketConnected ? 'Socket Connected' : 'Socket Disconnected'}
          </div>
          
          {(newOrdersCount > 0 || updatedOrdersCount > 0) && (
            <div className="text-sm text-gray-600 mr-2">
              {newOrdersCount > 0 && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2">
                  {newOrdersCount} new {newOrdersCount === 1 ? 'order' : 'orders'}
                </span>
              )}
              {updatedOrdersCount > 0 && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {updatedOrdersCount} updated {updatedOrdersCount === 1 ? 'order' : 'orders'}
                </span>
              )}
            </div>
          )}
          <button
            onClick={fetchOrders}
            className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw size={16} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-white">Refresh</span>
          </button>
        </div>
      </div>
      
      {/* Display connection error message if socket is disconnected */}
      {!socketConnected && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Socket connection is not active. Real-time updates may not work. 
                Try refreshing the page or check the server status.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Order Status Update Panel (visible only when an order is selected) */}
      {selectedOrder && (
        <div className="bg-white rounded-lg shadow-md p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Update Order: #{selectedOrder._id ? selectedOrder._id.substring(0, 8) : 'N/A'}
            </h2>
            <button 
              onClick={() => setSelectedOrder(null)} 
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircle size={20} />
            </button>
          </div>
          
          <div className="flex items-center mb-4">
            <span className="mr-3 text-sm font-medium text-gray-700">Current Status:</span>
            {getStatusBadge(selectedOrder.status)}
          </div>
          
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Change Status To:</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  try {
                    const orderId = getValidOrderId(selectedOrder);
                    updateOrderStatus(orderId, 'pending');
                  } catch (error) {
                    console.error('Error getting order ID:', error);
                    showNotification('Invalid order ID', 'error');
                  }
                }}
                disabled={selectedOrder.status === 'pending' || isUpdating || selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled'}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  selectedOrder.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed' 
                    : selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isUpdating ? 'bg-gray-100 text-gray-500 cursor-wait'
                      : 'bg-white border border-yellow-300 text-yellow-800 hover:bg-yellow-50'
                }`}
              >
                {isUpdating && selectedOrder.status !== 'pending' ? (
                  <RefreshCw size={14} className="inline mr-1 animate-spin" />
                ) : (
                  <ShoppingBag size={14} className="inline mr-1" />
                )}
                Pending
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  try {
                    const orderId = getValidOrderId(selectedOrder);
                    console.log('Processing button clicked for order:', selectedOrder);
                    console.log('Order ID value:', orderId);
                    updateOrderStatus(orderId, 'processing');
                  } catch (error) {
                    console.error('Error getting order ID:', error);
                    showNotification('Invalid order ID', 'error');
                  }
                }}
                disabled={selectedOrder.status === 'processing' || selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled' || isUpdating}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  selectedOrder.status === 'processing' 
                    ? 'bg-blue-100 text-blue-800 cursor-not-allowed' 
                    : selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isUpdating ? 'bg-gray-100 text-gray-500 cursor-wait'
                      : 'bg-white border border-blue-300 text-blue-800 hover:bg-blue-50'
                }`}
              >
                {isUpdating && selectedOrder.status !== 'processing' ? (
                  <RefreshCw size={14} className="inline mr-1 animate-spin" />
                ) : (
                  <Package size={14} className="inline mr-1" />
                )}
                Processing
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  try {
                    const orderId = getValidOrderId(selectedOrder);
                    updateOrderStatus(orderId, 'shipped');
                  } catch (error) {
                    console.error('Error getting order ID:', error);
                    showNotification('Invalid order ID', 'error');
                  }
                }}
                disabled={selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled' || isUpdating}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  selectedOrder.status === 'shipped' 
                    ? 'bg-indigo-100 text-indigo-800 cursor-not-allowed' 
                    : selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isUpdating ? 'bg-gray-100 text-gray-500 cursor-wait'
                      : 'bg-white border border-indigo-300 text-indigo-800 hover:bg-indigo-50'
                }`}
              >
                {isUpdating && selectedOrder.status !== 'shipped' ? (
                  <RefreshCw size={14} className="inline mr-1 animate-spin" />
                ) : (
                  <Truck size={14} className="inline mr-1" />
                )}
                Shipped
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  try {
                    const orderId = getValidOrderId(selectedOrder);
                    updateOrderStatus(orderId, 'delivered');
                  } catch (error) {
                    console.error('Error getting order ID:', error);
                    showNotification('Invalid order ID', 'error');
                  }
                }}
                disabled={selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled' || isUpdating}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  selectedOrder.status === 'delivered' 
                    ? 'bg-green-100 text-green-800 cursor-not-allowed' 
                    : selectedOrder.status === 'cancelled'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isUpdating ? 'bg-gray-100 text-gray-500 cursor-wait'
                      : 'bg-white border border-green-300 text-green-800 hover:bg-green-50'
                }`}
              >
                {isUpdating && selectedOrder.status !== 'delivered' ? (
                  <RefreshCw size={14} className="inline mr-1 animate-spin" />
                ) : (
                  <CheckCircle size={14} className="inline mr-1" />
                )}
                Delivered
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  try {
                    if (window.confirm('Are you sure you want to cancel this order?')) {
                      const orderId = getValidOrderId(selectedOrder);
                      updateOrderStatus(orderId, 'cancelled');
                    }
                  } catch (error) {
                    console.error('Error getting order ID:', error);
                    showNotification('Invalid order ID', 'error');
                  }
                }}
                disabled={selectedOrder.status === 'cancelled' || isUpdating}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  selectedOrder.status === 'cancelled' 
                    ? 'bg-red-100 text-red-800 cursor-not-allowed' 
                    : isUpdating ? 'bg-gray-100 text-gray-500 cursor-wait'
                    : 'bg-white border border-red-300 text-red-800 hover:bg-red-50'
                }`}
              >
                {isUpdating && selectedOrder.status !== 'cancelled' ? (
                  <RefreshCw size={14} className="inline mr-1 animate-spin" />
                ) : (
                  <XCircle size={14} className="inline mr-1" />
                )}
                Cancelled
              </button>
              
              {/* Add Delete Order Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteOrder(selectedOrder);
                }}
                disabled={isUpdating}
                className="px-3 py-1.5 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 flex items-center"
              >
                <XCircle size={14} className="inline mr-1" />
                Delete Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search orders by ID, customer, or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-gray-800"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Filter className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" size={16} />
            </div>
            
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-gray-800"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
              <Calendar className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="text-gray-400" size={24} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h2>
          <p className="text-gray-600">
            {searchTerm 
              ? "No orders match your search criteria." 
              : statusFilter !== 'all' 
                ? `No ${statusFilter} orders found.` 
                : "There are no orders in the system yet."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order, index) => (
                  <Fragment key={order._id}>
                    <tr 
                      className={`${
                        expandedOrderId === order._id 
                          ? 'bg-blue-50' 
                          : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-gray-100 transition cursor-pointer`}
                      onClick={() => toggleOrderExpand(order._id)}
                      onClickCapture={preventRowToggle}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{getOrderIdDisplay(order)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.userName || order.userEmail || (order.userId ? order.userId.substring(0, 8) : 'Unknown')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          {expandedOrderId === order._id ? (
                            <ChevronUp size={20} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={20} className="text-gray-400" />
                          )}
                          <span className="ml-2">Details</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteOrder(order);
                            }}
                            className="px-2 py-1 text-white bg-red-600 rounded hover:bg-red-700 flex items-center text-xs"
                            title="Delete duplicate or unnecessary order"
                          >
                            <XCircle size={14} className="mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Order Details */}
                    {expandedOrderId === order._id && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Customer Information */}
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
                              <div className="space-y-2">
                                <div className="flex items-start">
                                  <User size={16} className="text-gray-400 mt-0.5 mr-2" />
                                  <div>
                                    <p className="text-sm text-gray-900">{order.userName || 'Customer'}</p>
                                    <p className="text-xs text-gray-500">User ID: {order.userId}</p>
                                  </div>
                                </div>
                                {order.userEmail && (
                                  <div className="flex items-center">
                                    <Mail size={16} className="text-gray-400 mr-2" />
                                    <p className="text-sm text-gray-900">{order.userEmail}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Shipping Information */}
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <h3 className="text-lg font-medium text-gray-900 mb-3">Shipping Information</h3>
                              <div className="space-y-2">
                                <div className="flex items-start">
                                  <MapPin size={16} className="text-gray-400 mt-0.5 mr-2" />
                                  <div>
                                    {order.shippingAddress ? (
                                      <>
                                        <p className="text-sm font-medium text-gray-900">
                                          {order.shippingAddress.fullName || `${order.shippingAddress.firstName || ''} ${order.shippingAddress.lastName || ''}`}
                                        </p>
                                        <p className="text-sm text-gray-900">
                                          {order.shippingAddress.addressLine1 || order.shippingAddress.street || order.shippingAddress.streetAddress || 'No street address'}
                                        </p>
                                        {order.shippingAddress.addressLine2 && (
                                          <p className="text-sm text-gray-900">{order.shippingAddress.addressLine2}</p>
                                        )}
                                        <p className="text-sm text-gray-900">
                                          {order.shippingAddress.city || 'No city'}{order.shippingAddress.city && order.shippingAddress.state ? ', ' : ''} 
                                          {order.shippingAddress.state || 'No state'} {order.shippingAddress.postalCode || order.shippingAddress.zipCode || 'No zip code'}
                                        </p>
                                        <p className="text-sm text-gray-900">{order.shippingAddress.country || 'No country'}</p>
                                        {order.shippingAddress.phone && (
                                          <p className="text-sm text-gray-600 mt-1">Phone: {order.shippingAddress.phone}</p>
                                        )}
                                      </>
                                    ) : (
                                      <p className="text-sm text-gray-900">No shipping address available</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Payment Information */}
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Information</h3>
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <CreditCard size={16} className="text-gray-400 mr-2" />
                                  <p className="text-sm text-gray-900">{order.paymentMethod || 'Not specified'}</p>
                                </div>
                                <div className="flex items-center">
                                  <AlertCircle size={16} className="text-gray-400 mr-2" />
                                  <p className="text-sm text-gray-900">Total: {formatCurrency(order.totalAmount || 0)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Order Items */}
                          <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Order Items</h3>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Product
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Price
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Quantity
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Subtotal
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {(order.items || []).map((item, index) => (
                                    <tr key={`${order._id}-item-${index}`}>
                                      <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center">
                                          <div className="h-10 w-10 flex-shrink-0 mr-3">
                                            {item.image ? (
                                              <Image
                                                src={item.image}
                                                alt={item.name || 'Product'}
                                                width={40}
                                                height={40}
                                                className="rounded-md object-cover"
                                              />
                                            ) : (
                                              <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                                                <Package size={20} className="text-gray-400" />
                                              </div>
                                            )}
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium text-gray-900">{item.name || 'Unknown Product'}</p>
                                            <p className="text-xs text-gray-500">ID: {item.productId || 'N/A'}</p>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {formatCurrency(item.price || 0)}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {item.quantity || 0}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatCurrency((item.price || 0) * (item.quantity || 0))}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                          
                          {/* Update Status */}
                          <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Update Order Status</h3>
                            {selectedOrder ? (
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    try {
                                      const orderId = getValidOrderId(selectedOrder);
                                      updateOrderStatus(orderId, 'pending');
                                    } catch (error) {
                                      console.error('Error getting order ID:', error);
                                      showNotification('Invalid order ID', 'error');
                                    }
                                  }}
                                  disabled={selectedOrder.status === 'pending' || isUpdating || selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled'}
                                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                                    selectedOrder.status === 'pending' 
                                      ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed' 
                                      : selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled'
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : isUpdating ? 'bg-gray-100 text-gray-500 cursor-wait'
                                        : 'bg-white border border-yellow-300 text-yellow-800 hover:bg-yellow-50'
                                  }`}
                                >
                                  {isUpdating && selectedOrder.status !== 'pending' ? (
                                    <RefreshCw size={14} className="inline mr-1 animate-spin" />
                                  ) : (
                                    <ShoppingBag size={14} className="inline mr-1" />
                                  )}
                                  Pending
                                </button>
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    try {
                                      const orderId = getValidOrderId(selectedOrder);
                                      console.log('Processing button clicked for order:', selectedOrder);
                                      console.log('Order ID value:', orderId);
                                      updateOrderStatus(orderId, 'processing');
                                    } catch (error) {
                                      console.error('Error getting order ID:', error);
                                      showNotification('Invalid order ID', 'error');
                                    }
                                  }}
                                  disabled={selectedOrder.status === 'processing' || selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled' || isUpdating}
                                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                                    selectedOrder.status === 'processing' 
                                      ? 'bg-blue-100 text-blue-800 cursor-not-allowed' 
                                      : selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled'
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : isUpdating ? 'bg-gray-100 text-gray-500 cursor-wait'
                                        : 'bg-white border border-blue-300 text-blue-800 hover:bg-blue-50'
                                  }`}
                                >
                                  {isUpdating && selectedOrder.status !== 'processing' ? (
                                    <RefreshCw size={14} className="inline mr-1 animate-spin" />
                                  ) : (
                                    <Package size={14} className="inline mr-1" />
                                  )}
                                  Processing
                                </button>
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    try {
                                      const orderId = getValidOrderId(selectedOrder);
                                      updateOrderStatus(orderId, 'shipped');
                                    } catch (error) {
                                      console.error('Error getting order ID:', error);
                                      showNotification('Invalid order ID', 'error');
                                    }
                                  }}
                                  disabled={selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled' || isUpdating}
                                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                                    selectedOrder.status === 'shipped' 
                                      ? 'bg-indigo-100 text-indigo-800 cursor-not-allowed' 
                                      : selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled'
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : isUpdating ? 'bg-gray-100 text-gray-500 cursor-wait'
                                        : 'bg-white border border-indigo-300 text-indigo-800 hover:bg-indigo-50'
                                  }`}
                                >
                                  {isUpdating && selectedOrder.status !== 'shipped' ? (
                                    <RefreshCw size={14} className="inline mr-1 animate-spin" />
                                  ) : (
                                    <Truck size={14} className="inline mr-1" />
                                  )}
                                  Shipped
                                </button>
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    try {
                                      const orderId = getValidOrderId(selectedOrder);
                                      updateOrderStatus(orderId, 'delivered');
                                    } catch (error) {
                                      console.error('Error getting order ID:', error);
                                      showNotification('Invalid order ID', 'error');
                                    }
                                  }}
                                  disabled={selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled' || isUpdating}
                                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                                    selectedOrder.status === 'delivered' 
                                      ? 'bg-green-100 text-green-800 cursor-not-allowed' 
                                      : selectedOrder.status === 'cancelled'
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : isUpdating ? 'bg-gray-100 text-gray-500 cursor-wait'
                                        : 'bg-white border border-green-300 text-green-800 hover:bg-green-50'
                                  }`}
                                >
                                  {isUpdating && selectedOrder.status !== 'delivered' ? (
                                    <RefreshCw size={14} className="inline mr-1 animate-spin" />
                                  ) : (
                                    <CheckCircle size={14} className="inline mr-1" />
                                  )}
                                  Delivered
                                </button>
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    try {
                                      if (window.confirm('Are you sure you want to cancel this order?')) {
                                        const orderId = getValidOrderId(selectedOrder);
                                        updateOrderStatus(orderId, 'cancelled');
                                      }
                                    } catch (error) {
                                      console.error('Error getting order ID:', error);
                                      showNotification('Invalid order ID', 'error');
                                    }
                                  }}
                                  disabled={selectedOrder.status === 'cancelled' || isUpdating}
                                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                                    selectedOrder.status === 'cancelled' 
                                      ? 'bg-red-100 text-red-800 cursor-not-allowed' 
                                      : isUpdating ? 'bg-gray-100 text-gray-500 cursor-wait'
                                      : 'bg-white border border-red-300 text-red-800 hover:bg-red-50'
                                  }`}
                                >
                                  {isUpdating && selectedOrder.status !== 'cancelled' ? (
                                    <RefreshCw size={14} className="inline mr-1 animate-spin" />
                                  ) : (
                                    <XCircle size={14} className="inline mr-1" />
                                  )}
                                  Cancelled
                                </button>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">Select an order to update its status.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Add the test panel at the end of the return statement */}
      {renderTestPanel()}
    </div>
  );
} 
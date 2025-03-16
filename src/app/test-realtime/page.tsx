"use client";

import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { ShoppingBag, Package, Truck, CheckCircle, XCircle, RefreshCw, AlertCircle } from 'lucide-react';

export default function TestRealtimePage() {
  const { session } = useAuth();
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [testOrderId, setTestOrderId] = useState('');
  const socketRef = useRef<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Initialize the socket server first
    fetch('/api/socket-init').finally(() => {
      // Then connect to it
      const socket = io();
      socketRef.current = socket;
      
      socket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
        addMessage('Socket connected');
        
        // Join user-specific room if authenticated
        if (session?.user?.id) {
          socket.emit('join-user-room', session.user.id);
          addMessage(`Joined room for user: ${session.user.id}`);
        }
        
        // Also join admin room for testing
        socket.emit('join-admin-room');
        addMessage('Joined admin room for testing');
      });
      
      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
        addMessage('Socket disconnected');
      });
      
      // Listen for order events
      socket.on('order-created', (order) => {
        console.log('Test client received order-created event:', order);
        addMessage(`New order created: #${order._id ? order._id.substring(0, 8) : 'N/A'}`);
        setTestOrderId(order._id || '');
      });
      
      socket.on('order-updated', (order) => {
        console.log('Test client received order-updated event:', order);
        addMessage(`Order #${order._id ? order._id.substring(0, 8) : 'N/A'} updated to status: ${order.status || 'unknown'}`);
      });
      
      // Admin socket events (for demo purposes)
      socket.on('admin-new-order', (order) => {
        console.log('Test client received admin-new-order event:', order);
        addMessage(`Admin - New order received: #${order._id ? order._id.substring(0, 8) : 'N/A'}`);
      });
      
      socket.on('admin-order-status-changed', (order) => {
        console.log('Test client received admin-order-status-changed event:', order);
        addMessage(`Admin - Order #${order._id ? order._id.substring(0, 8) : 'N/A'} status changed to: ${order.status || 'unknown'}`);
      });
      
      return () => {
        socket.disconnect();
      };
    });
  }, [session]);

  const addMessage = (message: string) => {
    setMessages(prev => [
      `[${new Date().toLocaleTimeString()}] ${message}`, 
      ...prev
    ]);
  };

  const createTestOrder = async () => {
    if (!session?.user?.id) {
      addMessage('Error: You must be logged in to create a test order');
      return;
    }

    try {
      setIsCreating(true);
      addMessage('Creating test order...');
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          items: [
            {
              productId: '123456789',
              name: 'Test Product',
              price: 19.99,
              quantity: 1,
              image: '/images/placeholder.jpg'
            }
          ],
          shippingAddress: {
            street: '123 Test Street',
            city: 'Test City',
            state: 'Test State',
            zipCode: '12345',
            country: 'Test Country'
          },
          paymentMethod: 'Credit Card',
          totalAmount: 19.99
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        addMessage(`Test order created successfully: ${data.orderId}`);
        setTestOrderId(data.orderId);
      } else {
        addMessage(`Error creating test order: ${data.message}`);
      }
    } catch (error) {
      console.error('Error creating test order:', error);
      addMessage(`Error creating test order: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsCreating(false);
    }
  };

  const updateTestOrder = async (status: string) => {
    if (!testOrderId) {
      addMessage('Error: No test order ID available');
      return;
    }

    try {
      setIsUpdating(true);
      addMessage(`Updating test order ${testOrderId} to ${status}...`);
      
      const response = await fetch(`/api/admin/orders/${testOrderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        addMessage(`Test order updated successfully to status: ${status}`);
      } else {
        addMessage(`Error updating test order: ${data.message}`);
      }
    } catch (error) {
      console.error('Error updating test order:', error);
      addMessage(`Error updating test order: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
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

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Real-time Order Updates Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Socket Connection</h2>
            <div className="flex items-center mb-6">
              <div className={`w-3 h-3 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">{connected ? 'Connected' : 'Disconnected'}</span>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">User Info</h3>
              {session ? (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p><strong>User ID:</strong> {session.user?.id}</p>
                  <p><strong>Email:</strong> {session.user?.email}</p>
                </div>
              ) : (
                <p className="text-red-500">Not logged in. Please log in to test order creation.</p>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={createTestOrder}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                disabled={!connected || !session?.user?.id || isCreating}
              >
                {isCreating && <RefreshCw size={16} className="mr-2 animate-spin" />}
                Create Test Order
              </button>
            </div>
            
            {testOrderId && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Test Order</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="font-mono text-sm break-all mb-2"><strong>ID:</strong> {testOrderId}</p>
                  <div className="mt-3">
                    <p className="mb-2"><strong>Update Status:</strong></p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => updateTestOrder('processing')}
                        className="px-3 py-1.5 bg-white border border-blue-300 text-blue-800 hover:bg-blue-50 rounded-md text-sm font-medium flex items-center"
                        disabled={isUpdating}
                      >
                        {isUpdating && <RefreshCw size={14} className="mr-1 animate-spin" />}
                        <Package size={14} className={`${!isUpdating ? 'mr-1' : ''}`} />
                        {!isUpdating && 'Processing'}
                      </button>
                      
                      <button
                        onClick={() => updateTestOrder('shipped')}
                        className="px-3 py-1.5 bg-white border border-indigo-300 text-indigo-800 hover:bg-indigo-50 rounded-md text-sm font-medium flex items-center"
                        disabled={isUpdating}
                      >
                        {isUpdating && <RefreshCw size={14} className="mr-1 animate-spin" />}
                        <Truck size={14} className={`${!isUpdating ? 'mr-1' : ''}`} />
                        {!isUpdating && 'Shipped'}
                      </button>
                      
                      <button
                        onClick={() => updateTestOrder('delivered')}
                        className="px-3 py-1.5 bg-white border border-green-300 text-green-800 hover:bg-green-50 rounded-md text-sm font-medium flex items-center"
                        disabled={isUpdating}
                      >
                        {isUpdating && <RefreshCw size={14} className="mr-1 animate-spin" />}
                        <CheckCircle size={14} className={`${!isUpdating ? 'mr-1' : ''}`} />
                        {!isUpdating && 'Delivered'}
                      </button>
                      
                      <button
                        onClick={() => updateTestOrder('cancelled')}
                        className="px-3 py-1.5 bg-white border border-red-300 text-red-800 hover:bg-red-50 rounded-md text-sm font-medium flex items-center"
                        disabled={isUpdating}
                      >
                        {isUpdating && <RefreshCw size={14} className="mr-1 animate-spin" />}
                        <XCircle size={14} className={`${!isUpdating ? 'mr-1' : ''}`} />
                        {!isUpdating && 'Cancelled'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Event Log</h2>
            <div className="bg-gray-50 rounded-md p-4 h-[500px] overflow-y-auto">
              {messages.length > 0 ? (
                <ul className="space-y-2">
                  {messages.map((message, index) => (
                    <li key={index} className="font-mono text-sm">{message}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No events yet. Connect to the socket to see real-time updates.</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Testing Real-time Updates</h3>
              <ol className="list-decimal list-inside ml-4 mt-2 space-y-2">
                <li>Make sure you're logged in (required to create orders)</li>
                <li>Click "Create Test Order" to create a new order</li>
                <li>Use the status buttons to update the order status</li>
                <li>Watch the Event Log for real-time updates</li>
                <li>Open the <a href="/orders" className="text-blue-600 hover:underline">Orders Page</a> in another tab to see updates there</li>
                <li>Open the <a href="/admin/dashboard/orders" className="text-blue-600 hover:underline">Admin Orders Dashboard</a> in another tab to see admin updates</li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">What to Look For</h3>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
                <li>On the Orders Page: Visual indicators for updated orders, notifications, and automatic list updates</li>
                <li>On the Admin Dashboard: New order counters, updated order counters, and notifications</li>
                <li>In this test page: Socket events being logged in real-time</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 
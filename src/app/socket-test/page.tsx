"use client";

import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';

export default function SocketTestPage() {
  const { session } = useAuth();
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [testOrderId, setTestOrderId] = useState('');
  const socketRef = useRef<any>(null);

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
      });
      
      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
        addMessage('Socket disconnected');
      });
      
      // Listen for order events
      socket.on('order-created', (order) => {
        console.log('Order created:', order);
        addMessage(`New order created: #${order._id ? order._id.substring(0, 8) : 'N/A'}`);
        setTestOrderId(order._id || '');
      });
      
      socket.on('order-updated', (order) => {
        console.log('Order updated:', order);
        addMessage(`Order #${order._id ? order._id.substring(0, 8) : 'N/A'} updated to status: ${order.status || 'unknown'}`);
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
    }
  };

  const updateTestOrder = async () => {
    if (!testOrderId) {
      addMessage('Error: No test order ID available');
      return;
    }

    try {
      addMessage(`Updating test order ${testOrderId}...`);
      
      const statuses = ['processing', 'shipped', 'delivered'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      const response = await fetch(`/api/admin/orders/${testOrderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: randomStatus
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        addMessage(`Test order updated successfully to status: ${randomStatus}`);
      } else {
        addMessage(`Error updating test order: ${data.message}`);
      }
    } catch (error) {
      console.error('Error updating test order:', error);
      addMessage(`Error updating test order: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Socket.io Real-time Updates Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className={`w-3 h-3 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="font-medium">{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
          
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={createTestOrder}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={!connected || !session?.user?.id}
            >
              Create Test Order
            </button>
            
            <button
              onClick={updateTestOrder}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              disabled={!connected || !testOrderId}
            >
              Update Test Order Status
            </button>
          </div>
          
          {testOrderId && (
            <div className="mb-4 p-3 bg-gray-100 rounded-md">
              <p className="font-medium">Test Order ID:</p>
              <p className="font-mono text-sm break-all">{testOrderId}</p>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Event Log</h2>
          <div className="bg-gray-100 rounded-md p-4 h-80 overflow-y-auto">
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
    </MainLayout>
  );
} 
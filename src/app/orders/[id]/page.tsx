'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (!user) {
          setError('You must be logged in to view order details');
          setLoading(false);
          return;
        }
        
        const db = getDatabase();
        const orderRef = ref(db, `orders/${id}`);
        const snapshot = await get(orderRef);
        
        if (!snapshot.exists()) {
          setError('Order not found');
          setLoading(false);
          return;
        }
        
        const orderData = snapshot.val();
        
        // Check if the order belongs to the current user
        if (orderData.userId !== user.uid) {
          setError('You do not have permission to view this order');
          setLoading(false);
          return;
        }
        
        setOrder(orderData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
        setLoading(false);
      }
    };
    
    if (id) {
      fetchOrder();
    }
  }, [id]);

  if (loading) {
    return <div className="container mx-auto p-4">Loading order details...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  if (!order) {
    return <div className="container mx-auto p-4">Order not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Order Details</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Order #{id}</h2>
          <p className="text-gray-600">Placed on: {new Date(order.createdAt).toLocaleString()}</p>
          <p className="text-gray-600">Status: <span className="font-medium">{order.status}</span></p>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Items</h3>
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <p className="font-medium">${item.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Shipping Address</h3>
          <p>{order.shippingAddress.street}</p>
          <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
          <p>{order.shippingAddress.country}</p>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Payment Information</h3>
          <p>Method: {order.paymentMethod}</p>
          {order.trackingNumber && (
            <p className="mt-2">Tracking Number: {order.trackingNumber}</p>
          )}
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between">
            <span className="font-semibold">Subtotal:</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Shipping:</span>
            <span>${order.shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Tax:</span>
            <span>${order.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold mt-2">
            <span>Total:</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
        
        {order.status === 'pending' || order.status === 'processing' ? (
          <div className="mt-6">
            <button 
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              onClick={async () => {
                try {
                  const auth = getAuth();
                  const user = auth.currentUser;
                  const token = await user.getIdToken();
                  
                  const response = await fetch(`/api/orders/${id}/cancel`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    }
                  });
                  
                  if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to cancel order');
                  }
                  
                  // Refresh the page to show updated status
                  window.location.reload();
                } catch (err) {
                  console.error('Error canceling order:', err);
                  alert(err.message || 'Failed to cancel order');
                }
              }}
            >
              Cancel Order
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
} 
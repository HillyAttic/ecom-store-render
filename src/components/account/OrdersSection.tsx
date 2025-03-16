"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Package, Eye, Download, Search } from 'lucide-react';

interface Order {
  id: string;
  date: string;
  status: 'delivered' | 'processing' | 'shipped' | 'cancelled';
  total: number;
  items: number;
}

const OrdersSection = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Sample orders data
  const orders: Order[] = [
    {
      id: 'ORD-2023-7896',
      date: '2023-11-15',
      status: 'delivered',
      total: 259.98,
      items: 2,
    },
    {
      id: 'ORD-2023-6543',
      date: '2023-10-22',
      status: 'shipped',
      total: 129.99,
      items: 1,
    },
    {
      id: 'ORD-2023-5421',
      date: '2023-09-10',
      status: 'delivered',
      total: 532.45,
      items: 4,
    },
    {
      id: 'ORD-2023-4321',
      date: '2023-08-05',
      status: 'cancelled',
      total: 89.99,
      items: 1,
    },
    {
      id: 'ORD-2023-3210',
      date: '2023-07-21',
      status: 'delivered',
      total: 159.98,
      items: 2,
    },
  ];

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Helper function to get status badge color
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div suppressHydrationWarning>
      <div className="flex justify-between items-center mb-6" suppressHydrationWarning>
        <h2 className="text-xl font-semibold text-gray-900" suppressHydrationWarning>Order History</h2>
        <div className="relative" suppressHydrationWarning>
          <input
            type="text"
            placeholder="Search by order ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            suppressHydrationWarning
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </div>
      </div>
      
      {filteredOrders.length > 0 ? (
        <div className="overflow-x-auto" suppressHydrationWarning>
          <table className="min-w-full divide-y divide-gray-200" suppressHydrationWarning>
            <thead className="bg-gray-50" suppressHydrationWarning>
              <tr suppressHydrationWarning>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" suppressHydrationWarning>
                  Order ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" suppressHydrationWarning>
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" suppressHydrationWarning>
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" suppressHydrationWarning>
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" suppressHydrationWarning>
                  Items
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" suppressHydrationWarning>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200" suppressHydrationWarning>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50" suppressHydrationWarning>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" suppressHydrationWarning>
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" suppressHydrationWarning>
                    {formatDate(order.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" suppressHydrationWarning>
                    <span 
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}
                      suppressHydrationWarning
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" suppressHydrationWarning>
                    ₹{order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" suppressHydrationWarning>
                    {order.items}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" suppressHydrationWarning>
                    <div className="flex justify-end space-x-2" suppressHydrationWarning>
                      <Link 
                        href={`/account/orders/${order.id}`} 
                        className="text-blue-600 hover:text-blue-900"
                        suppressHydrationWarning
                      >
                        <Eye size={18} />
                      </Link>
                      <Link 
                        href={`/account/orders/${order.id}/invoice`} 
                        className="text-green-600 hover:text-green-900"
                        suppressHydrationWarning
                      >
                        <Download size={18} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white py-16 text-center rounded-lg border border-gray-200" suppressHydrationWarning>
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900" suppressHydrationWarning>No orders found</h3>
          <p className="mt-1 text-sm text-gray-500" suppressHydrationWarning>
            {searchTerm 
              ? `No orders matching "${searchTerm}"`
              : "You haven't placed any orders yet."
            }
          </p>
          
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              suppressHydrationWarning
            >
              Clear search
            </button>
          )}
          
          {!searchTerm && (
            <div className="mt-6" suppressHydrationWarning>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                suppressHydrationWarning
              >
                Start shopping
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersSection; 
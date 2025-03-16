"use client";

import { useState } from 'react';
import { 
  ShoppingBag, 
  Users, 
  CreditCard, 
  ArrowUp, 
  ArrowDown, 
  Package, 
  ShoppingCart,
  BarChart3,
  AlertCircle,
  Eye,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from "@/utils/currency";

export default function AdminDashboard() {
  // Sample data for demonstration purposes
  const stats = [
    {
      label: 'Total Sales',
      value: formatCurrency(2976478.23),
      change: '+4.75%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-100 text-green-800',
      iconColor: 'text-green-600',
    },
    {
      label: 'Active Customers',
      value: '2,854',
      change: '+7.2%',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-100 text-blue-800',
      iconColor: 'text-blue-600',
    },
    {
      label: 'New Orders',
      value: '184',
      change: '+18.9%',
      trend: 'up',
      icon: ShoppingBag,
      color: 'bg-purple-100 text-purple-800',
      iconColor: 'text-purple-600',
      link: '/admin/dashboard/orders',
    },
    {
      label: 'Product Returns',
      value: '23',
      change: '-5.1%',
      trend: 'down',
      icon: Package,
      color: 'bg-yellow-100 text-yellow-800',
      iconColor: 'text-yellow-600',
    },
  ];

  const recentOrders = [
    {
      id: 'ORD-7851',
      customer: 'John Smith',
      date: '2023-05-21',
      amount: formatCurrency(129.99),
      status: 'Completed',
      statusColor: 'bg-green-100 text-green-800',
    },
    {
      id: 'ORD-7852',
      customer: 'Sarah Johnson',
      date: '2023-05-20',
      amount: formatCurrency(259.99),
      status: 'Processing',
      statusColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'ORD-7853',
      customer: 'Michael Brown',
      date: '2023-05-20',
      amount: formatCurrency(89.99),
      status: 'Completed',
      statusColor: 'bg-green-100 text-green-800',
    },
    {
      id: 'ORD-7854',
      customer: 'Emma Wilson',
      date: '2023-05-19',
      amount: formatCurrency(179.99),
      status: 'Pending',
      statusColor: 'bg-yellow-100 text-yellow-800',
    },
    {
      id: 'ORD-7855',
      customer: 'James Taylor',
      date: '2023-05-19',
      amount: formatCurrency(349.99),
      status: 'Completed',
      statusColor: 'bg-green-100 text-green-800',
    },
  ];

  const topProducts = [
    {
      id: 1,
      name: 'Premium Wireless Headphones',
      category: 'Electronics',
      sales: 243,
      revenue: formatCurrency(31590),
    },
    {
      id: 2,
      name: 'Smart Fitness Watch',
      category: 'Electronics',
      sales: 187,
      revenue: formatCurrency(16830),
    },
    {
      id: 3,
      name: 'Ultra HD Smart LED TV',
      category: 'Electronics',
      sales: 152,
      revenue: formatCurrency(75948),
    },
    {
      id: 4,
      name: 'Designer Leather Handbag',
      category: 'Fashion',
      sales: 134,
      revenue: formatCurrency(22780),
    },
  ];

  const alerts = [
    {
      id: 1,
      message: 'Inventory low for Premium Wireless Headphones (5 left)',
      type: 'warning',
    },
    {
      id: 2,
      message: 'New support ticket opened: Order delivery delay (#T-458)',
      type: 'info',
    },
    {
      id: 3,
      message: 'Payment gateway issue detected - Please check logs',
      type: 'error',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid - Using the exact structure provided */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    {stat.icon && <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />}
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.label}</dt>
                    <dd>
                      <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                    </dd>
                  </dl>
                </div>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    stat.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {stat.trend === 'up' ? (
                      <ArrowUp className="mr-1 h-3 w-3" />
                    ) : (
                      <ArrowDown className="mr-1 h-3 w-3" />
                    )}
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rest of the dashboard with consistent styling */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Orders - left 2/3 */}
        <div className="lg:col-span-2 bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
            <Link 
              href="/admin/orders" 
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-5 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customer}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.date}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.amount}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${order.statusColor}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/orders/${order.id}`} className="text-blue-600 hover:text-blue-900">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analytics Chart Placeholder */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-gray-500" />
              Sales Analytics
            </h2>
          </div>
          <div className="p-5">
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Sales chart would be rendered here</p>
                <p className="text-sm text-gray-400 mt-1">
                  Integrate with Chart.js or any preferred charting library
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Package className="h-5 w-5 mr-2 text-gray-500" />
              Top Products
            </h2>
            <Link 
              href="/admin/products" 
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales
                  </th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th scope="col" className="relative px-5 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProducts.map((product, index) => (
                  <tr key={index}>
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.sales} units
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.revenue}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/products/${index + 1}`} className="text-blue-600 hover:text-blue-900">
                        <Eye size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-gray-500" />
              Recent Alerts
            </h2>
          </div>
          <div className="p-5 space-y-4">
            {alerts.map((alert, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg ${
                  alert.type === 'warning' 
                    ? 'bg-yellow-50 border-l-4 border-yellow-400' 
                    : alert.type === 'error'
                      ? 'bg-red-50 border-l-4 border-red-400'
                      : 'bg-blue-50 border-l-4 border-blue-400'
                }`}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className={`h-5 w-5 ${
                      alert.type === 'warning' 
                        ? 'text-yellow-400' 
                        : alert.type === 'error'
                          ? 'text-red-400'
                          : 'text-blue-400'
                    }`} />
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm ${
                      alert.type === 'warning' 
                        ? 'text-yellow-700' 
                        : alert.type === 'error'
                          ? 'text-red-700'
                          : 'text-blue-700'
                    }`}>
                      {alert.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/admin/dashboard/orders" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <ShoppingBag className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Manage Orders</h3>
              <p className="text-sm text-gray-500">View and update customer orders</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
} 
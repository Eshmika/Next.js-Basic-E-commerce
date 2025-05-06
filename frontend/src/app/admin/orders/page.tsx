'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Order {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  items: {
    product: {
      name: string;
    };
    quantity: number;
    price: number;
  }[];
  totalPrice: number;
  status: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'seller')) {
      router.push('/login');
      return;
    }
    
    fetch('/api/admin/orders', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data.orders);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user, router]);
  
  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message);
      
      // Update orders list
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? { ...order, status } : order
        )
      );
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Orders</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border text-left">Order ID</th>
              <th className="py-2 px-4 border text-left">Customer</th>
              <th className="py-2 px-4 border text-left">Date</th>
              <th className="py-2 px-4 border text-left">Total</th>
              <th className="py-2 px-4 border text-left">Status</th>
              <th className="py-2 px-4 border text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td className="py-2 px-4 border">{order._id}</td>
                <td className="py-2 px-4 border">
                  <div>
                    <p className="font-medium">{order.user.name}</p>
                    <p className="text-sm text-gray-600">{order.user.email}</p>
                  </div>
                </td>
                <td className="py-2 px-4 border">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="py-2 px-4 border">${order.totalPrice.toFixed(2)}</td>
                <td className="py-2 px-4 border">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-2 px-4 border">
                  <select
                    value={order.status}
                    onChange={e => handleStatusChange(order._id, e.target.value)}
                    className="p-1 border rounded"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

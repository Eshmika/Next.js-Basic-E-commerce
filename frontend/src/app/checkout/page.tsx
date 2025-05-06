'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Load Stripe outside of component render cycle
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm() {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  
  useEffect(() => {
    // Create a payment intent as soon as the page loads
    if (items.length > 0) {
      fetch('/api/payment/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount: totalPrice })
      })
        .then(res => res.json())
        .then(data => {
          setClientSecret(data.clientSecret);
        })
        .catch(err => {
          console.error(err);
          setError('Failed to initialize payment. Please try again.');
        });
    }
  }, [items, totalPrice]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setProcessing(true);
    
    // Validate shipping address
    if (!shippingAddress.street || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.zipCode || 
        !shippingAddress.country) {
      setError('Please fill in all shipping address fields');
      setProcessing(false);
      return;
    }
    
    const cardElement = elements.getElement(CardElement);
    
    if (!cardElement) {
      setError('Card information is required');
      setProcessing(false);
      return;
    }
    
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: user?.name || 'Guest',
          email: user?.email
        }
      }
    });
    
    if (stripeError) {
      setError(stripeError.message || 'Payment failed');
      setProcessing(false);
      return;
    }
    
    if (paymentIntent.status === 'succeeded') {
      // Create order in the database
      try {
        const orderItems = items.map(item => ({
          product: item.id,
          quantity: item.quantity,
          price: item.price
        }));
        
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            items: orderItems,
            shippingAddress,
            paymentMethod: 'stripe',
            paymentInfo: {
              id: paymentIntent.id,
              status: paymentIntent.status
            }
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to create order');
        }
        
        // Clear cart and redirect to order confirmation
        clearCart();
        router.push(`/orders/${data.order._id}`);
      } catch (error) {
        console.error('Order creation error:', error);
        setError('Payment succeeded but failed to create order. Please contact support.');
      }
    }
    
    setProcessing(false);
  };
  
  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Street</label>
        <input
          type="text"
          value={shippingAddress.street}
          onChange={e => setShippingAddress({...shippingAddress, street: e.target.value})}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <input
            type="text"
            value={shippingAddress.city}
            onChange={e => setShippingAddress({...shippingAddress, city: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">State</label>
          <input
            type="text"
            value={shippingAddress.state}
            onChange={e => setShippingAddress({...shippingAddress, state: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Zip Code</label>
          <input
            type="text"
            value={shippingAddress.zipCode}
            onChange={e => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Country</label>
          <input
            type="text"
            value={shippingAddress.country}
            onChange={e => setShippingAddress({...shippingAddress, country: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
      
      <div className="mb-6">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
          className="p-3 border rounded-md"
        />
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
      >
        {processing ? 'Processing...' : `Pay $${totalPrice.toFixed(2)}`}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const { items, totalItems } = useCart();
  const router = useRouter();
  
  useEffect(() => {
    if (totalItems === 0) {
      router.push('/cart');
    }
  }, [totalItems, router]);
  
  if (totalItems === 0) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          
          <div className="bg-gray-50 p-4 rounded-md">
            {items.map(item => (
              <div key={item.id} className="flex justify-between py-2 border-b">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            
            <div className="flex justify-between py-4 font-bold">
              <p>Total</p>
              <p>${items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div>
          <Elements stripe={stripePromise}>
            <CheckoutForm />
          </Elements>
        </div>
      </div>
    </div>
  );
}

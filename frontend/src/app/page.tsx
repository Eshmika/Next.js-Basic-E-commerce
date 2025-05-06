'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
}

interface Category {
  id: string;
  name: string;
  image: string;
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  
  useEffect(() => {
    // Fetch featured products
    fetch('/api/products/featured')
      .then(res => res.json())
      .then(data => {
        setFeaturedProducts(data.products);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
    
    // Fetch categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data.categories);
      })
      .catch(err => {
        console.error(err);
      });
  }, []);
  
  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0]
    });
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
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl overflow-hidden mb-12">
        <div className="container mx-auto px-6 py-16 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Discover Amazing Products for Every Need
            </h1>
            <p className="text-lg mb-8">
              Shop the latest trends with confidence. Quality products, fast shipping, and exceptional service.
            </p>
            <Link 
              href="/products" 
              className="bg-white text-blue-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
            >
              Shop Now
            </Link>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="w-full max-w-md h-64 md:h-96 relative">
              <Image 
                src="/images/hero-image.jpg" 
                alt="Shopping" 
                fill
                className="object-cover rounded-lg shadow-lg"
                priority
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Shop by Category</h2>
          <Link href="/categories" className="text-blue-600 hover:underline">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {categories.map(category => (
            <Link 
              key={category.id} 
              href={`/categories/${category.id}`}
              className="group"
            >
              <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square relative">
                <Image 
                  src={category.image} 
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <h3 className="text-center mt-2 font-medium">{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>
      
      {/* Featured Products Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link href="/products" className="text-blue-600 hover:underline">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <Link href={`/products/${product.id}`}>
                <div className="h-48 relative">
                  <Image 
                    src={product.images[0]} 
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-gray-600 mt-2 line-clamp-2">{product.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                  </div>
                </div>
              </Link>
              <div className="px-4 pb-4">
                <button 
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="mt-16 bg-gray-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-center mb-8">What Our Customers Say</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden relative">
                <Image 
                  src="/images/testimonial-1.jpg" 
                  alt="Customer" 
                  fill
                  className="object-cover"
                />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold">Sarah Johnson</h3>
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-600">
              "I've been shopping here for months now. The quality of products and customer service is outstanding. Highly recommended!"
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden relative">
                <Image 
                  src="/images/testimonial-2.jpg" 
                  alt="Customer" 
                  fill
                  className="object-cover"
                />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold">Michael Thompson</h3>
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-600">
              "Fast shipping and the product was exactly as described. The checkout process was smooth and hassle-free."
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden relative">
                <Image 
                  src="/images/testimonial-3.jpg" 
                  alt="Customer" 
                  fill
                  className="object-cover"
                />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold">Emily Rodriguez</h3>
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-600">
              "The customer support team went above and beyond to help me with my order. I'll definitely be shopping here again!"
            </p>
          </div>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="mt-16 bg-blue-600 text-white rounded-xl p-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="mb-6">Stay updated with our latest products and exclusive offers.</p>
          
          <form className="flex flex-col sm:flex-row gap-2">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-grow px-4 py-2 rounded-md text-gray-900 focus:outline-none"
              required
            />
            <button 
              type="submit"
              className="bg-white text-blue-600 px-6 py-2 rounded-md font-semibold hover:bg-gray-100 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

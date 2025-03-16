"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Truck, RotateCcw, ShoppingCart, Heart, Minus, Plus, ChevronRight } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { formatCurrency } from '@/utils/currency';
import RelatedProducts from '@/components/product/RelatedProducts';

interface Color {
  name: string;
  value: string;
}

interface Size {
  name: string;
  value: string;
  inStock: boolean;
}

export default function ProductDetails({ params }: { params: { id: string } }) {
  // In a real app, this would be fetched from an API
  const product = {
    id: params.id,
    name: 'Premium Wireless Headphones',
    price: 12999,
    originalPrice: 16999,
    rating: 4.5,
    reviewCount: 128,
    description: 'Experience premium sound quality with our wireless headphones. Features include active noise cancellation, 30-hour battery life, and comfortable over-ear design. Perfect for music lovers and professionals alike.',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?ixlib=rb-4.0.3',
    ],
    category: 'Electronics',
    features: [
      'Active Noise Cancellation',
      '30-hour Battery Life',
      'Bluetooth 5.0',
      'Built-in Microphone',
      'Touch Controls',
    ],
    colors: [
      { name: 'Matte Black', value: '#1a1a1a' },
      { name: 'Silver', value: '#C0C0C0' },
      { name: 'Navy Blue', value: '#000080' },
    ],
    sizes: [
      { name: 'Standard', value: 'STD', inStock: true },
    ],
  };

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<Color>(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<Size>(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(10, prev + delta)));
  };

  const addToCart = () => {
    // In a real app, this would add the item to the cart
    alert('Added to cart!');
  };

  const buyNow = () => {
    // In a real app, this would proceed to checkout
    alert('Proceeding to checkout!');
  };

  const toggleWishlist = () => {
    setIsWishlisted(prev => !prev);
  };

  // Helper to render stars
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star 
        key={index}
        size={20}
        className={index < Math.floor(rating) 
          ? "fill-yellow-400 text-yellow-400" 
          : index < rating 
            ? "fill-yellow-400 text-yellow-400 opacity-50" 
            : "text-gray-300"
        }
      />
    ));
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 py-8 md:py-12" suppressHydrationWarning>
        <div className="container mx-auto px-4" suppressHydrationWarning>
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm text-gray-500 mb-8" suppressHydrationWarning>
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight size={16} className="mx-2" />
            <Link href="/products" className="hover:text-blue-600">Products</Link>
            <ChevronRight size={16} className="mx-2" />
            <Link href={`/products/${product.category.toLowerCase()}`} className="hover:text-blue-600">
              {product.category}
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-gray-900">{product.name}</span>
          </nav>

          <div className="bg-white rounded-xl shadow-sm p-4 md:p-8" suppressHydrationWarning>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8" suppressHydrationWarning>
              {/* Product Images */}
              <div className="space-y-4" suppressHydrationWarning>
                <div className="relative aspect-square rounded-lg overflow-hidden" suppressHydrationWarning>
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="grid grid-cols-3 gap-4" suppressHydrationWarning>
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-blue-600' : 'border-transparent'
                      }`}
                      suppressHydrationWarning
                    >
                      <Image
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-6" suppressHydrationWarning>
                <div suppressHydrationWarning>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2" suppressHydrationWarning>
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-4" suppressHydrationWarning>
                    <div className="flex items-center" suppressHydrationWarning>
                      <div className="flex mr-2" suppressHydrationWarning>{renderStars(product.rating)}</div>
                      <span className="text-gray-600">({product.rating})</span>
                    </div>
                    <span className="text-gray-400">|</span>
                    <Link href="#reviews" className="text-blue-600 hover:text-blue-800" suppressHydrationWarning>
                      {product.reviewCount} Reviews
                    </Link>
                  </div>
                </div>

                <div className="space-y-2" suppressHydrationWarning>
                  <div className="flex items-baseline" suppressHydrationWarning>
                    <span className="text-3xl font-bold text-gray-900" suppressHydrationWarning>
                      {formatCurrency(product.price)}
                    </span>
                    {product.originalPrice && (
                      <>
                        <span className="ml-3 text-lg text-gray-500 line-through" suppressHydrationWarning>
                          {formatCurrency(product.originalPrice)}
                        </span>
                        <span className="ml-3 text-lg font-medium text-green-600" suppressHydrationWarning>
                          Save {formatCurrency(product.originalPrice - product.price)} ({Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%)
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-gray-600" suppressHydrationWarning>{product.description}</p>

                <div className="space-y-4 pt-4 border-t" suppressHydrationWarning>
                  {/* Color Selection */}
                  <div suppressHydrationWarning>
                    <label className="block text-sm font-medium text-gray-700 mb-2" suppressHydrationWarning>
                      Color
                    </label>
                    <div className="flex gap-3" suppressHydrationWarning>
                      {product.colors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setSelectedColor(color)}
                          className={`relative w-10 h-10 rounded-full ${
                            selectedColor.value === color.value 
                              ? 'ring-2 ring-blue-600 ring-offset-2' 
                              : ''
                          }`}
                          title={color.name}
                          suppressHydrationWarning
                        >
                          <span 
                            className="absolute inset-0 rounded-full"
                            style={{ backgroundColor: color.value }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size Selection */}
                  <div suppressHydrationWarning>
                    <label className="block text-sm font-medium text-gray-700 mb-2" suppressHydrationWarning>
                      Size
                    </label>
                    <div className="flex gap-3" suppressHydrationWarning>
                      {product.sizes.map((size) => (
                        <button
                          key={size.value}
                          onClick={() => setSelectedSize(size)}
                          disabled={!size.inStock}
                          className={`px-4 py-2 rounded-lg border ${
                            selectedSize.value === size.value
                              ? 'border-blue-600 bg-blue-50 text-blue-600'
                              : size.inStock
                              ? 'border-gray-200 hover:border-blue-600'
                              : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                          }`}
                          suppressHydrationWarning
                        >
                          {size.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity Selection */}
                  <div suppressHydrationWarning>
                    <label className="block text-sm font-medium text-gray-700 mb-2" suppressHydrationWarning>
                      Quantity
                    </label>
                    <div className="flex items-center gap-2" suppressHydrationWarning>
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                        suppressHydrationWarning
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center" suppressHydrationWarning>{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                        suppressHydrationWarning
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4" suppressHydrationWarning>
                    <button
                      onClick={buyNow}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      suppressHydrationWarning
                    >
                      Buy Now
                    </button>
                    <button
                      onClick={addToCart}
                      className="flex items-center justify-center gap-2 flex-1 border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                      suppressHydrationWarning
                    >
                      <ShoppingCart size={20} />
                      Add to Cart
                    </button>
                    <button
                      onClick={toggleWishlist}
                      className={`flex items-center justify-center w-12 h-12 rounded-lg border ${
                        isWishlisted
                          ? 'border-red-600 text-red-600 bg-red-50'
                          : 'border-gray-300 text-gray-400 hover:border-red-600 hover:text-red-600'
                      }`}
                      suppressHydrationWarning
                    >
                      <Heart size={20} className={isWishlisted ? 'fill-red-600' : ''} />
                    </button>
                  </div>
                </div>

                {/* Delivery and Returns */}
                <div className="space-y-4 pt-6 border-t" suppressHydrationWarning>
                  <div className="flex items-start gap-4" suppressHydrationWarning>
                    <Truck className="flex-shrink-0 w-6 h-6 text-gray-400" />
                    <div suppressHydrationWarning>
                      <h3 className="font-medium text-gray-900" suppressHydrationWarning>Free Delivery</h3>
                      <p className="text-sm text-gray-600" suppressHydrationWarning>
                        Enter your postal code for delivery availability
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4" suppressHydrationWarning>
                    <RotateCcw className="flex-shrink-0 w-6 h-6 text-gray-400" />
                    <div suppressHydrationWarning>
                      <h3 className="font-medium text-gray-900" suppressHydrationWarning>Return Delivery</h3>
                      <p className="text-sm text-gray-600" suppressHydrationWarning>
                        Free 30 days return. Details
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Features */}
            <div className="mt-12 pt-8 border-t" suppressHydrationWarning>
              <h2 className="text-xl font-bold text-gray-900 mb-4" suppressHydrationWarning>Features</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4" suppressHydrationWarning>
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2" suppressHydrationWarning>
                    <span className="w-2 h-2 bg-blue-600 rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Related Products */}
          <div className="mt-16" suppressHydrationWarning>
            <div className="flex items-center justify-between mb-8" suppressHydrationWarning>
              <h2 className="text-2xl font-bold text-gray-900" suppressHydrationWarning>Related Products</h2>
              <Link 
                href="/products" 
                className="text-blue-600 hover:text-blue-800 font-medium"
                suppressHydrationWarning
              >
                View All
              </Link>
            </div>
            <RelatedProducts category={product.category} excludeId={product.id} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 
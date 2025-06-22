import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface CartItemWithDetails {
  id: string;
  userId: string;
  foodItemId: string;
  quantity: number;
  createdAt: string;
  foodItem: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    isVeg: boolean;
    restaurantId: string;
  };
}

export function Cart() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading } = useQuery<CartItemWithDetails[]>({
    queryKey: ['/api/cart'],
    enabled: isAuthenticated,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) => {
      const response = await apiRequest('PUT', `/api/cart/${cartItemId}`, { quantity });
      if (!response.ok) throw new Error('Failed to update quantity');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update quantity',
        variant: 'destructive',
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (cartItemId: string) => {
      const response = await apiRequest('DELETE', `/api/cart/${cartItemId}`);
      if (!response.ok) throw new Error('Failed to remove item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: 'Item removed',
        description: 'Item has been removed from your cart',
        variant: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to remove item',
        variant: 'destructive',
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', '/api/cart');
      if (!response.ok) throw new Error('Failed to clear cart');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: 'Cart cleared',
        description: 'All items have been removed from your cart',
        variant: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to clear cart',
        variant: 'destructive',
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="text-6xl mb-6">🔐</div>
        <h1 className="font-display font-bold text-3xl text-gray-900 mb-4">
          Login Required
        </h1>
        <p className="text-gray-600 mb-8">
          Please login to view and manage your cart
        </p>
        <Link href="/login">
          <Button size="lg">Login to Continue</Button>
        </Link>
      </div>
    );
  }

  const subtotal = cartItems.reduce((total, item) => total + (item.foodItem.price * item.quantity), 0);
  const deliveryFee = subtotal > 150 ? 0 : 25;
  const total = subtotal + deliveryFee;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="text-6xl mb-6">🛒</div>
        <h1 className="font-display font-bold text-3xl text-gray-900 mb-4">
          Your cart is empty
        </h1>
        <p className="text-gray-600 mb-8">
          Looks like you haven't added any delicious items to your cart yet
        </p>
        <Link href="/restaurants">
          <Button size="lg">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Browse Restaurants
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-3xl text-gray-900">
          Your Cart ({cartItems.length} items)
        </h1>
        <Button
          variant="outline"
          onClick={() => clearCartMutation.mutate()}
          disabled={clearCartMutation.isPending}
          className="text-red-600 border-red-300 hover:bg-red-50"
        >
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start space-x-4">
                <img
                  src={item.foodItem.image}
                  alt={item.foodItem.name}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={item.foodItem.isVeg ? 'veg-indicator' : 'non-veg-indicator'}></div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {item.foodItem.name}
                        </h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {item.foodItem.description}
                      </p>
                      <div className="flex items-center space-x-4">
                        <span className="font-bold text-lg text-primary-600">
                          ₹{item.foodItem.price}
                        </span>
                        <span className="text-sm text-gray-500">
                          × {item.quantity} = ₹{item.foodItem.price * item.quantity}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => removeItemMutation.mutate(item.id)}
                      disabled={removeItemMutation.isPending}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantityMutation.mutate({ 
                          cartItemId: item.id, 
                          quantity: Math.max(1, item.quantity - 1) 
                        })}
                        disabled={updateQuantityMutation.isPending || item.quantity <= 1}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantityMutation.mutate({ 
                          cartItemId: item.id, 
                          quantity: item.quantity + 1 
                        })}
                        disabled={updateQuantityMutation.isPending}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
            <h2 className="font-display font-semibold text-xl text-gray-900 mb-6">
              Order Summary
            </h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              {subtotal < 150 && (
                <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                  Add ₹{150 - subtotal} more for free delivery!
                </div>
              )}
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary-600">₹{total}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setLocation('/checkout')}
              className="w-full h-12 text-lg font-semibold"
            >
              Proceed to Checkout
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <div className="mt-4 text-center">
              <Link href="/restaurants">
                <Button variant="ghost" className="text-primary-600">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

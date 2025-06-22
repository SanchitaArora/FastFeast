import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Clock, CreditCard, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const checkoutSchema = z.object({
  deliveryAddress: z.string().min(10, 'Please provide a complete address'),
  specialInstructions: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

interface CartItemWithDetails {
  id: string;
  quantity: number;
  foodItem: {
    id: string;
    name: string;
    price: number;
    restaurantId: string;
  };
}

export function Checkout() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState("");

  const { data: cartItems = [] } = useQuery<CartItemWithDetails[]>({
    queryKey: ['/api/cart'],
    enabled: isAuthenticated,
  });

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryAddress: user?.address || '',
      specialInstructions: '',
    },
  });

  const subtotal = cartItems.reduce((total, item) => total + (item.foodItem.price * item.quantity), 0);
  const deliveryFee = subtotal > 150 ? 0 : 25;
  const total = subtotal + deliveryFee;

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest('POST', '/api/orders', orderData);
      if (!response.ok) throw new Error('Failed to create order');
      return response.json();
    },
    onSuccess: (order) => {
      setOrderId(order.id);
      // Create payment intent
      createPaymentIntent(order.id);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create order',
        variant: 'destructive',
      });
    },
  });

  const createPaymentIntent = async (orderId: string) => {
    try {
      const response = await apiRequest('POST', '/api/create-payment-intent', {
        amount: total,
        orderId,
      });
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to initialize payment',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (data: CheckoutForm) => {
    if (cartItems.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Please add items to your cart before checkout',
        variant: 'destructive',
      });
      return;
    }

    // Group items by restaurant
    const restaurantGroups = cartItems.reduce((groups, item) => {
      const restaurantId = item.foodItem.restaurantId;
      if (!groups[restaurantId]) {
        groups[restaurantId] = [];
      }
      groups[restaurantId].push(item);
      return groups;
    }, {} as Record<string, CartItemWithDetails[]>);

    // For simplicity, we'll create one order for the first restaurant
    // In a real app, you might want to create separate orders for each restaurant
    const firstRestaurantId = Object.keys(restaurantGroups)[0];
    const orderItems = restaurantGroups[firstRestaurantId];

    const orderData = {
      restaurantId: firstRestaurantId,
      items: orderItems.map(item => ({
        foodItemId: item.foodItem.id,
        quantity: item.quantity,
        price: item.foodItem.price,
      })),
      totalAmount: total,
      deliveryAddress: data.deliveryAddress,
      deliveryFee,
      estimatedDeliveryTime: "30-45 mins",
      specialInstructions: data.specialInstructions,
    };

    createOrderMutation.mutate(orderData);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="text-6xl mb-6">🔐</div>
        <h1 className="font-display font-bold text-3xl text-gray-900 mb-4">
          Login Required
        </h1>
        <p className="text-gray-600 mb-8">
          Please login to proceed with checkout
        </p>
        <Button onClick={() => setLocation('/login')} size="lg">
          Login to Continue
        </Button>
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
          Add some delicious items to your cart before checkout
        </p>
        <Button onClick={() => setLocation('/restaurants')} size="lg">
          Browse Restaurants
        </Button>
      </div>
    );
  }

  if (clientSecret) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm orderId={orderId} total={total} />
      </Elements>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display font-bold text-3xl text-gray-900 mb-8">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-display font-semibold text-xl text-gray-900 mb-6">
            Delivery Details
          </h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="deliveryAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Delivery Address</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter your complete address"
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Instructions (Optional)</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        placeholder="Any special instructions for the restaurant or delivery"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-blue-800">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Estimated Delivery Time</span>
                </div>
                <p className="text-blue-700 mt-1">30-45 minutes</p>
              </div>

              <Button
                type="submit"
                disabled={createOrderMutation.isPending}
                className="w-full h-12 text-lg font-semibold"
              >
                {createOrderMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Creating Order...</span>
                  </div>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Proceed to Payment
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-display font-semibold text-xl text-gray-900 mb-6">
            Order Summary
          </h2>

          <div className="space-y-4 mb-6">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.foodItem.name}</h4>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <span className="font-medium">₹{item.foodItem.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
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
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span className="text-primary-600">₹{total}</span>
            </div>
          </div>

          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-green-800">
              <Lock className="h-4 w-4" />
              <span className="font-medium">Secure Payment</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Your payment information is encrypted and secure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutForm({ orderId, total }: { orderId: string; total: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-success?orderId=${orderId}`,
      },
      redirect: 'if_required',
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Payment succeeded
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      
      toast({
        title: "Payment Successful! 🎉",
        description: "Your order has been placed successfully",
        variant: "success",
      });
      
      setLocation(`/order-success?orderId=${orderId}`);
    }

    setIsProcessing(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-saffron rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900 mb-2">
            Complete Payment
          </h1>
          <p className="text-gray-600">
            Total Amount: <span className="font-bold text-primary-600">₹{total}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <PaymentElement />
          
          <Button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full h-12 text-lg font-semibold"
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Processing...</span>
              </div>
            ) : (
              `Pay ₹${total}`
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          <div className="flex items-center justify-center space-x-2">
            <Lock className="h-3 w-3" />
            <span>Secured by Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Clock, Truck, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Restaurant, FoodItem } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export function RestaurantDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: restaurant, isLoading: restaurantLoading } = useQuery<Restaurant>({
    queryKey: [`/api/restaurants/${id}`],
  });

  const { data: menuItems = [], isLoading: menuLoading } = useQuery<FoodItem[]>({
    queryKey: [`/api/restaurants/${id}/menu`],
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ foodItemId, quantity }: { foodItemId: string; quantity: number }) => {
      const response = await apiRequest('POST', '/api/cart', { foodItemId, quantity });
      if (!response.ok) throw new Error('Failed to add to cart');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: 'Added to cart!',
        description: 'Item has been added to your cart',
        variant: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Please login to add items to cart',
        variant: 'destructive',
      });
    },
  });

  const categories = [...new Set(menuItems.map(item => item.category))];
  const filteredItems = selectedCategory 
    ? menuItems.filter(item => item.category === selectedCategory)
    : menuItems;

  if (restaurantLoading || menuLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-xl mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="h-40 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="lg:col-span-3 space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <div className="text-6xl mb-4">🍽️</div>
        <h1 className="font-display font-bold text-2xl text-gray-900 mb-2">
          Restaurant not found
        </h1>
        <p className="text-gray-600">The restaurant you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Restaurant Header */}
      <div className="relative bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="relative h-64 lg:h-80">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display font-bold text-3xl lg:text-4xl mb-2">
                  {restaurant.name}
                </h1>
                <p className="text-lg opacity-90 mb-4">{restaurant.description}</p>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{restaurant.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{restaurant.deliveryTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Truck className="h-4 w-4" />
                    <span>₹{restaurant.deliveryFee} delivery</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`px-4 py-2 rounded-full text-sm font-medium mb-2 ${
                  restaurant.isOpen 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {restaurant.isOpen ? 'Open Now' : 'Closed'}
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                  restaurant.isVeg 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {restaurant.isVeg ? '🟢 Pure Veg' : '🔴 Non-Veg'}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-t-4 border-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 font-medium">
                Minimum order: ₹{restaurant.minOrder}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Cuisine: {restaurant.cuisine}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Category Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
            <h3 className="font-display font-semibold text-lg text-gray-900 mb-4">
              Menu Categories
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === '' 
                    ? 'bg-primary-100 text-primary-800 font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Items ({menuItems.length})
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category 
                      ? 'bg-primary-100 text-primary-800 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category} ({menuItems.filter(item => item.category === category).length})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-display font-bold text-2xl text-gray-900 mb-6">
              {selectedCategory || 'All Items'}
            </h2>
            
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="font-display font-semibold text-xl text-gray-900 mb-2">
                  No items found
                </h3>
                <p className="text-gray-600">
                  This category doesn't have any items yet.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredItems.map((item) => (
                  <FoodItemCard
                    key={item.id}
                    item={item}
                    onAddToCart={(quantity) => {
                      if (!isAuthenticated) {
                        toast({
                          title: 'Login Required',
                          description: 'Please login to add items to cart',
                          variant: 'destructive',
                        });
                        return;
                      }
                      addToCartMutation.mutate({ foodItemId: item.id, quantity });
                    }}
                    isAddingToCart={addToCartMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface FoodItemCardProps {
  item: FoodItem;
  onAddToCart: (quantity: number) => void;
  isAddingToCart: boolean;
}

function FoodItemCard({ item, onAddToCart, isAddingToCart }: FoodItemCardProps) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
      <div className="flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-24 h-24 object-cover rounded-lg"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <div className={item.isVeg ? 'veg-indicator' : 'non-veg-indicator'}></div>
              <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
              {item.isSpicy && (
                <span className="text-red-500 text-sm">🌶️ Spicy</span>
              )}
            </div>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {item.description}
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
              <span>⏱️ {item.preparationTime}</span>
              {item.ingredients && (
                <span>🥘 {item.ingredients.slice(0, 3).join(', ')}</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-xl text-primary-600">₹{item.price}</span>
              {item.isAvailable ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <Button
                    onClick={() => onAddToCart(quantity)}
                    disabled={isAddingToCart}
                    className="px-6"
                  >
                    {isAddingToCart ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <span className="text-red-500 font-medium">Out of Stock</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
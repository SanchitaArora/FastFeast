import { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Star, Clock, Truck, Search, ChefHat, MapPin } from 'lucide-react';
import { Restaurant, FoodItem } from '@shared/schema';
import { Button } from '@/components/ui/button';

export function Home() {
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');

  const { data: restaurants = [], isLoading: restaurantsLoading } = useQuery<Restaurant[]>({
    queryKey: ['/api/restaurants'],
  });

  const { data: popularItems = [], isLoading: itemsLoading } = useQuery<FoodItem[]>({
    queryKey: ['/api/food-items/category/Main Course'],
  });

  const cuisineTypes = ['North Indian', 'South Indian', 'Street Food', 'Chinese', 'Continental'];

  const filteredRestaurants = selectedCuisine
    ? restaurants.filter(r => r.cuisine === selectedCuisine)
    : restaurants.slice(0, 6);

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-600 via-red-500 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h1 className="font-display font-bold text-4xl lg:text-6xl leading-tight">
                  स्वादिष्ट भोजन
                  <br />
                  <span className="text-yellow-300">Lightning Fast!</span>
                </h1>
                <p className="text-xl lg:text-2xl mt-4 opacity-90">
                  Authentic Indian flavors delivered to your doorstep in minutes
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/restaurants">
                  <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 font-semibold px-8">
                    <ChefHat className="mr-2 h-5 w-5" />
                    Order Now
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-orange-600 font-semibold px-8">
                  <MapPin className="mr-2 h-5 w-5" />
                  Find Restaurants
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-sm opacity-80">Restaurants</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">25 min</div>
                  <div className="text-sm opacity-80">Avg Delivery</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">4.8★</div>
                  <div className="text-sm opacity-80">User Rating</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-3xl opacity-30 animate-pulse-slow"></div>
              <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <div className="text-center space-y-4">
                  <div className="text-6xl animate-float">🍛</div>
                  <h3 className="font-display font-semibold text-2xl">Ready to Order?</h3>
                  <div className="space-y-2 text-sm opacity-90">
                    <div className="flex items-center justify-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Fast 25-min delivery</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Truck className="h-4 w-4" />
                      <span>Free delivery on ₹150+</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Star className="h-4 w-4" />
                      <span>Fresh & Hot guaranteed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cuisine Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="font-display font-bold text-3xl text-gray-900 mb-4">
            Explore Cuisines 🍽️
          </h2>
          <p className="text-gray-600 text-lg">Discover the rich flavors of India</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Button
            variant={selectedCuisine === '' ? 'default' : 'outline'}
            onClick={() => setSelectedCuisine('')}
            className="px-6"
          >
            All Cuisines
          </Button>
          {cuisineTypes.map((cuisine) => (
            <Button
              key={cuisine}
              variant={selectedCuisine === cuisine ? 'default' : 'outline'}
              onClick={() => setSelectedCuisine(cuisine)}
              className="px-6"
            >
              {cuisine}
            </Button>
          ))}
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display font-bold text-3xl text-gray-900">
            Top Restaurants 🏆
          </h2>
          <Link href="/restaurants">
            <Button variant="outline">View All Restaurants</Button>
          </Link>
        </div>

        {restaurantsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`}>
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden cursor-pointer">
                  <div className="relative">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        restaurant.isVeg 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {restaurant.isVeg ? '🟢 Pure Veg' : '🔴 Non-Veg'}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-sm font-medium flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{restaurant.rating}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-display font-semibold text-xl text-gray-900 mb-2">
                      {restaurant.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {restaurant.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{restaurant.deliveryTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Truck className="h-4 w-4" />
                        <span>₹{restaurant.deliveryFee} delivery</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Min order: ₹{restaurant.minOrder}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        restaurant.isOpen 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {restaurant.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Popular Dishes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="font-display font-bold text-3xl text-gray-900 mb-4">
            Popular Dishes 🔥
          </h2>
          <p className="text-gray-600 text-lg">Most loved dishes by our customers</p>
        </div>

        {itemsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularItems.slice(0, 4).map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <div className={item.isVeg ? 'veg-indicator' : 'non-veg-indicator'}></div>
                  </div>
                  {item.isSpicy && (
                    <div className="absolute top-2 right-2 spicy-indicator bg-white/90 backdrop-blur-sm px-2 py-1 rounded">
                      🌶️
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg text-primary-600">₹{item.price}</span>
                    <span className="text-xs text-gray-500">{item.preparationTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl text-gray-900 mb-4">
              Why Choose FastFeast? 🚀
            </h2>
            <p className="text-gray-600 text-lg">Experience the best of Indian food delivery</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-saffron rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-3">Lightning Fast</h3>
              <p className="text-gray-600">Average delivery time of just 25 minutes. Your food reaches you hot and fresh!</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-spice rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-3">Authentic Flavors</h3>
              <p className="text-gray-600">Traditional recipes from across India, prepared by expert chefs who know their craft.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-mint rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-3">Quality Assured</h3>
              <p className="text-gray-600">Every order is quality checked. 4.8-star average rating from thousands of happy customers.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
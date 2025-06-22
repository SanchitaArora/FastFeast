import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ShoppingCart, User, Home, Search, Heart, MapPin, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { data: cartItems = [] } = useQuery({
    queryKey: ['/api/cart'],
    enabled: isAuthenticated,
  });

  const cartItemCount = cartItems.reduce((total: number, item: any) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-primary-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-10 h-10 bg-gradient-saffron rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">🍛</span>
                </div>
                <div>
                  <h1 className="font-display font-bold text-2xl text-gray-900">FastFeast</h1>
                  <p className="text-xs text-gray-600 -mt-1">तेज़ और स्वादिष्ट</p>
                </div>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search for restaurants, dishes..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/">
                <Button variant={location === '/' ? 'default' : 'ghost'} size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              
              {isAuthenticated && (
                <>
                  <Link href="/cart">
                    <Button variant={location === '/cart' ? 'default' : 'ghost'} size="sm" className="relative">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Cart
                      {cartItemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {cartItemCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                  <Link href="/orders">
                    <Button variant={location === '/orders' ? 'default' : 'ghost'} size="sm">
                      <Heart className="h-4 w-4 mr-2" />
                      Orders
                    </Button>
                  </Link>
                </>
              )}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="relative">
                  <Button
                    variant="ghost"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:block">{user?.username}</span>
                  </Button>
                  
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <p className="font-medium">{user?.username}</p>
                        <p className="text-gray-500">{user?.email}</p>
                      </div>
                      <Link href="/profile">
                        <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                          Profile
                        </button>
                      </Link>
                      <button
                        onClick={logout}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-saffron rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">🍛</span>
                </div>
                <h3 className="font-display font-bold text-xl">FastFeast</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Delivering authentic Indian flavors to your doorstep with lightning speed.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-white">Home</Link></li>
                <li><Link href="/restaurants" className="hover:text-white">Restaurants</Link></li>
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Help</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Cuisines</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">North Indian</a></li>
                <li><a href="#" className="hover:text-white">South Indian</a></li>
                <li><a href="#" className="hover:text-white">Street Food</a></li>
                <li><a href="#" className="hover:text-white">Desserts</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Delhi, Mumbai, Bangalore</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 FastFeast. Made with ❤️ in India. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
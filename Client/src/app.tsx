import { QueryClientProvider } from '@tanstack/react-query';
import { Router, Route, Switch } from 'wouter';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';
import { ToastComponent } from '@/components/ui/toast';

// Pages
import { Home } from '@/pages/Home';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Restaurants } from '@/pages/Restaurants';
import { RestaurantDetail } from '@/pages/RestaurantDetail';
import { Cart } from '@/pages/Cart';
import { Checkout } from '@/pages/Checkout';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  const { toasts, dismiss } = useToast();

  return (
    <>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route>
          <Layout>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/restaurants" component={Restaurants} />
              <Route path="/restaurant/:id" component={RestaurantDetail} />
              <Route path="/cart" component={Cart} />
              <Route path="/checkout" component={Checkout} />
              <Route>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                  <div className="text-6xl mb-6">🍽️</div>
                  <h1 className="font-display font-bold text-3xl text-gray-900 mb-4">
                    Page Not Found
                  </h1>
                  <p className="text-gray-600 mb-8">
                    The page you're looking for doesn't exist.
                  </p>
                </div>
              </Route>
            </Switch>
          </Layout>
        </Route>
      </Switch>

      {/* Toast notifications */}
      {toasts.map((toast) => (
        <ToastComponent
          key={toast.id}
          toast={toast}
          onDismiss={dismiss}
        />
      ))}
    </>
  );
}

export default App;

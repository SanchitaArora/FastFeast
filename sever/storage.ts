import { User, InsertUser, Restaurant, InsertRestaurant, FoodItem, InsertFoodItem, Order, InsertOrder, CartItem, InsertCartItem } from "@shared/schema";

// Storage interface for all CRUD operations
export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  updateStripeCustomerId(userId: string, stripeCustomerId: string): Promise<User>;
  updateUserStripeInfo(userId: string, stripeInfo: { stripeCustomerId: string; stripeSubscriptionId: string }): Promise<User>;
  
  // Restaurant operations
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  getAllRestaurants(): Promise<Restaurant[]>;
  getRestaurantById(id: string): Promise<Restaurant | null>;
  getRestaurantsByCuisine(cuisine: string): Promise<Restaurant[]>;
  
  // Food item operations
  createFoodItem(foodItem: InsertFoodItem): Promise<FoodItem>;
  getFoodItemsByRestaurant(restaurantId: string): Promise<FoodItem[]>;
  getFoodItemById(id: string): Promise<FoodItem | null>;
  getFoodItemsByCategory(category: string): Promise<FoodItem[]>;
  searchFoodItems(query: string): Promise<FoodItem[]>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderById(id: string): Promise<Order | null>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  updateOrderStatus(orderId: string, status: Order["status"]): Promise<Order>;
  updatePaymentStatus(orderId: string, paymentStatus: Order["paymentStatus"], paymentIntentId?: string): Promise<Order>;
  
  // Cart operations
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  getCartByUser(userId: string): Promise<CartItem[]>;
  updateCartItemQuantity(cartItemId: string, quantity: number): Promise<CartItem>;
  removeFromCart(cartItemId: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private restaurants: Map<string, Restaurant> = new Map();
  private foodItems: Map<string, FoodItem> = new Map();
  private orders: Map<string, Order> = new Map();
  private cartItems: Map<string, CartItem> = new Map();

  constructor() {
    this.seedData();
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // User operations
  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      ...user,
      id: this.generateId(),
      createdAt: new Date(),
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async updateStripeCustomerId(userId: string, stripeCustomerId: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, stripeCustomerId };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserStripeInfo(userId: string, stripeInfo: { stripeCustomerId: string; stripeSubscriptionId: string }): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...stripeInfo };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Restaurant operations
  async createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant> {
    const newRestaurant: Restaurant = {
      ...restaurant,
      id: this.generateId(),
      createdAt: new Date(),
    };
    this.restaurants.set(newRestaurant.id, newRestaurant);
    return newRestaurant;
  }

  async getAllRestaurants(): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values());
  }

  async getRestaurantById(id: string): Promise<Restaurant | null> {
    return this.restaurants.get(id) || null;
  }

  async getRestaurantsByCuisine(cuisine: string): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values()).filter(r => r.cuisine.toLowerCase().includes(cuisine.toLowerCase()));
  }

  // Food item operations
  async createFoodItem(foodItem: InsertFoodItem): Promise<FoodItem> {
    const newFoodItem: FoodItem = {
      ...foodItem,
      id: this.generateId(),
      createdAt: new Date(),
    };
    this.foodItems.set(newFoodItem.id, newFoodItem);
    return newFoodItem;
  }

  async getFoodItemsByRestaurant(restaurantId: string): Promise<FoodItem[]> {
    return Array.from(this.foodItems.values()).filter(item => item.restaurantId === restaurantId);
  }

  async getFoodItemById(id: string): Promise<FoodItem | null> {
    return this.foodItems.get(id) || null;
  }

  async getFoodItemsByCategory(category: string): Promise<FoodItem[]> {
    return Array.from(this.foodItems.values()).filter(item => item.category.toLowerCase() === category.toLowerCase());
  }

  async searchFoodItems(query: string): Promise<FoodItem[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.foodItems.values()).filter(item => 
      item.name.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm)
    );
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const newOrder: Order = {
      ...order,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.set(newOrder.id, newOrder);
    return newOrder;
  }

  async getOrderById(id: string): Promise<Order | null> {
    return this.orders.get(id) || null;
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async updateOrderStatus(orderId: string, status: Order["status"]): Promise<Order> {
    const order = this.orders.get(orderId);
    if (!order) throw new Error("Order not found");
    
    const updatedOrder = { ...order, status, updatedAt: new Date() };
    this.orders.set(orderId, updatedOrder);
    return updatedOrder;
  }

  async updatePaymentStatus(orderId: string, paymentStatus: Order["paymentStatus"], paymentIntentId?: string): Promise<Order> {
    const order = this.orders.get(orderId);
    if (!order) throw new Error("Order not found");
    
    const updatedOrder = { 
      ...order, 
      paymentStatus, 
      stripePaymentIntentId: paymentIntentId || order.stripePaymentIntentId,
      updatedAt: new Date() 
    };
    this.orders.set(orderId, updatedOrder);
    return updatedOrder;
  }

  // Cart operations
  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values()).find(
      item => item.userId === cartItem.userId && item.foodItemId === cartItem.foodItemId
    );

    if (existingItem) {
      return this.updateCartItemQuantity(existingItem.id, existingItem.quantity + cartItem.quantity);
    }

    const newCartItem: CartItem = {
      ...cartItem,
      id: this.generateId(),
      createdAt: new Date(),
    };
    this.cartItems.set(newCartItem.id, newCartItem);
    return newCartItem;
  }

  async getCartByUser(userId: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(item => item.userId === userId);
  }

  async updateCartItemQuantity(cartItemId: string, quantity: number): Promise<CartItem> {
    const cartItem = this.cartItems.get(cartItemId);
    if (!cartItem) throw new Error("Cart item not found");
    
    const updatedItem = { ...cartItem, quantity };
    this.cartItems.set(cartItemId, updatedItem);
    return updatedItem;
  }

  async removeFromCart(cartItemId: string): Promise<void> {
    this.cartItems.delete(cartItemId);
  }

  async clearCart(userId: string): Promise<void> {
    const userCartItems = Array.from(this.cartItems.entries()).filter(([_, item]) => item.userId === userId);
    userCartItems.forEach(([id]) => this.cartItems.delete(id));
  }

  // Seed data with authentic Indian restaurants and food items
  private seedData() {
    // Seed restaurants
    const restaurants = [
      {
        name: "Sharma Ji Ka Dhaba",
        description: "Authentic North Indian cuisine with traditional flavors from Punjab",
        cuisine: "North Indian",
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500",
        rating: 4.5,
        deliveryTime: "25-30 mins",
        deliveryFee: 25,
        minOrder: 150,
        isVeg: false,
        isOpen: true,
      },
      {
        name: "South Spice Express",
        description: "Traditional South Indian delicacies - Dosas, Idlis, and more",
        cuisine: "South Indian",
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500",
        rating: 4.3,
        deliveryTime: "20-25 mins",
        deliveryFee: 20,
        minOrder: 120,
        isVeg: true,
        isOpen: true,
      },
      {
        name: "Mumbai Street Kitchen",
        description: "Mumbai street food favorites - Vada Pav, Pav Bhaji, Bhel Puri",
        cuisine: "Street Food",
        image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500",
        rating: 4.7,
        deliveryTime: "15-20 mins",
        deliveryFee: 15,
        minOrder: 80,
        isVeg: true,
        isOpen: true,
      },
    ];

    restaurants.forEach(restaurant => {
      const newRestaurant: Restaurant = {
        ...restaurant,
        id: this.generateId(),
        createdAt: new Date(),
      };
      this.restaurants.set(newRestaurant.id, newRestaurant);
    });

    // Seed food items
    const restaurantIds = Array.from(this.restaurants.keys());
    
    const foodItems = [
      // North Indian items
      {
        restaurantId: restaurantIds[0],
        name: "Butter Chicken",
        description: "Creamy tomato-based curry with tender chicken pieces",
        price: 280,
        image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400",
        category: "Main Course",
        isVeg: false,
        isSpicy: true,
        isAvailable: true,
        preparationTime: "20-25 mins",
        ingredients: ["Chicken", "Tomatoes", "Cream", "Spices"],
      },
      {
        restaurantId: restaurantIds[0],
        name: "Dal Makhani",
        description: "Rich and creamy black lentils cooked overnight",
        price: 220,
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400",
        category: "Main Course",
        isVeg: true,
        isSpicy: false,
        isAvailable: true,
        preparationTime: "15-20 mins",
        ingredients: ["Black Lentils", "Butter", "Cream", "Spices"],
      },
      // South Indian items
      {
        restaurantId: restaurantIds[1],
        name: "Masala Dosa",
        description: "Crispy rice crepe filled with spiced potato curry",
        price: 120,
        image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400",
        category: "Main Course",
        isVeg: true,
        isSpicy: true,
        isAvailable: true,
        preparationTime: "15-18 mins",
        ingredients: ["Rice", "Lentils", "Potatoes", "Spices"],
      },
      {
        restaurantId: restaurantIds[1],
        name: "Sambar Vada",
        description: "Fried lentil donuts soaked in flavorful sambar",
        price: 80,
        image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400",
        category: "Appetizers",
        isVeg: true,
        isSpicy: true,
        isAvailable: true,
        preparationTime: "10-12 mins",
        ingredients: ["Lentils", "Tamarind", "Vegetables", "Spices"],
      },
      // Street Food items
      {
        restaurantId: restaurantIds[2],
        name: "Vada Pav",
        description: "Mumbai's famous potato fritter sandwich",
        price: 40,
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400",
        category: "Street Food",
        isVeg: true,
        isSpicy: true,
        isAvailable: true,
        preparationTime: "8-10 mins",
        ingredients: ["Potatoes", "Bread", "Chutneys", "Spices"],
      },
      {
        restaurantId: restaurantIds[2],
        name: "Pav Bhaji",
        description: "Spicy vegetable curry served with buttered bread",
        price: 90,
        image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400",
        category: "Main Course",
        isVeg: true,
        isSpicy: true,
        isAvailable: true,
        preparationTime: "12-15 mins",
        ingredients: ["Mixed Vegetables", "Bread", "Butter", "Spices"],
      },
    ];

    foodItems.forEach(foodItem => {
      const newFoodItem: FoodItem = {
        ...foodItem,
        id: this.generateId(),
        createdAt: new Date(),
      };
      this.foodItems.set(newFoodItem.id, newFoodItem);
    });
  }
}

export const storage = new MemStorage();
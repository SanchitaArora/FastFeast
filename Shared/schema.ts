import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

// User schema
export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
  phone: z.string().optional(),
  address: z.string().optional(),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  createdAt: z.date(),
});

export const insertUserSchema = userSchema.omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof userSchema>;

// Restaurant schema
export const restaurantSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  cuisine: z.string(), // Indian, South Indian, North Indian, etc.
  image: z.string(),
  rating: z.number().min(0).max(5),
  deliveryTime: z.string(), // "25-30 mins"
  deliveryFee: z.number(),
  minOrder: z.number(),
  isVeg: z.boolean(),
  isOpen: z.boolean(),
  createdAt: z.date(),
});

export const insertRestaurantSchema = restaurantSchema.omit({ id: true, createdAt: true });
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type Restaurant = z.infer<typeof restaurantSchema>;

// Food Item schema
export const foodItemSchema = z.object({
  id: z.string(),
  restaurantId: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  image: z.string(),
  category: z.string(), // Appetizers, Main Course, Desserts, Beverages
  isVeg: z.boolean(),
  isSpicy: z.boolean(),
  isAvailable: z.boolean(),
  preparationTime: z.string(), // "15-20 mins"
  ingredients: z.array(z.string()).optional(),
  createdAt: z.date(),
});

export const insertFoodItemSchema = foodItemSchema.omit({ id: true, createdAt: true });
export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;
export type FoodItem = z.infer<typeof foodItemSchema>;

// Order schema
export const orderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  restaurantId: z.string(),
  items: z.array(z.object({
    foodItemId: z.string(),
    quantity: z.number(),
    price: z.number(),
  })),
  totalAmount: z.number(),
  deliveryAddress: z.string(),
  deliveryFee: z.number(),
  status: z.enum(["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"]),
  paymentStatus: z.enum(["pending", "paid", "failed"]),
  stripePaymentIntentId: z.string().optional(),
  estimatedDeliveryTime: z.string(),
  specialInstructions: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertOrderSchema = orderSchema.omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = z.infer<typeof orderSchema>;

// Cart schema
export const cartItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  foodItemId: z.string(),
  quantity: z.number(),
  createdAt: z.date(),
});

export const insertCartItemSchema = cartItemSchema.omit({ id: true, createdAt: true });
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;

export type UserRole = 'student' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  role: UserRole;
  createdAt: string;
}

export type MealCategory = 'Main Dish' | 'Quick Bite' | 'Daily Special' | 'Traditional';

export type CountryCategory = 'Uganda' | 'Somalia' | 'Eritrea' | 'DR Congo' | 'Nigeria' | 'Sudan';

export interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MealCategory;
  country: CountryCategory;
  imageUrl?: string;
  isAvailable: boolean;
  meatOptions?: string[];
  accompanimentOptions?: string[];
  options?: string[]; // Generic options
  createdAt: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  mealId: string;
  mealName: string;
  selectedMeat?: string;
  selectedAccompaniment?: string;
  selectedOption?: string; // Generic option
  quantity: number;
  totalPrice: number;
  paidAmount: number;
  status: OrderStatus;
  deliveryDate: string;
  deliveryLocation: string;
  createdAt: string;
}

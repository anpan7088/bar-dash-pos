import { Product } from "@/types/pos";

export const categories = [
  { id: "coffee", label: "Coffee", emoji: "☕" },
  { id: "drinks", label: "Drinks", emoji: "🥤" },
  { id: "cocktails", label: "Cocktails", emoji: "🍸" },
  { id: "beer", label: "Beer & Wine", emoji: "🍺" },
  { id: "food", label: "Food", emoji: "🍕" },
  { id: "desserts", label: "Desserts", emoji: "🍰" },
];

export const products: Product[] = [
  // Coffee
  { id: "esp", name: "Espresso", price: 1.80, category: "coffee", emoji: "☕" },
  { id: "dbl", name: "Double Espresso", price: 2.40, category: "coffee", emoji: "☕" },
  { id: "cap", name: "Cappuccino", price: 2.90, category: "coffee", emoji: "☕" },
  { id: "lat", name: "Caffè Latte", price: 3.20, category: "coffee", emoji: "☕" },
  { id: "mac", name: "Macchiato", price: 2.20, category: "coffee", emoji: "☕" },
  { id: "flt", name: "Flat White", price: 3.40, category: "coffee", emoji: "☕" },
  { id: "ame", name: "Americano", price: 2.50, category: "coffee", emoji: "☕" },
  { id: "moc", name: "Mocha", price: 3.60, category: "coffee", emoji: "☕" },

  // Drinks
  { id: "wat", name: "Water 0.5L", price: 1.50, category: "drinks", emoji: "💧" },
  { id: "spa", name: "Sparkling Water", price: 2.00, category: "drinks", emoji: "💧" },
  { id: "col", name: "Coca-Cola", price: 2.50, category: "drinks", emoji: "🥤" },
  { id: "fan", name: "Fanta", price: 2.50, category: "drinks", emoji: "🥤" },
  { id: "jui", name: "Fresh Juice", price: 3.50, category: "drinks", emoji: "🧃" },
  { id: "tea", name: "Tea", price: 2.20, category: "drinks", emoji: "🍵" },
  { id: "ice", name: "Iced Tea", price: 2.80, category: "drinks", emoji: "🧊" },
  { id: "lem", name: "Lemonade", price: 3.00, category: "drinks", emoji: "🍋" },

  // Cocktails
  { id: "moj", name: "Mojito", price: 7.50, category: "cocktails", emoji: "🍸" },
  { id: "mar", name: "Margarita", price: 8.00, category: "cocktails", emoji: "🍸" },
  { id: "gin", name: "Gin Tonic", price: 7.00, category: "cocktails", emoji: "🍸" },
  { id: "apr", name: "Aperol Spritz", price: 6.50, category: "cocktails", emoji: "🍹" },
  { id: "neg", name: "Negroni", price: 8.50, category: "cocktails", emoji: "🍸" },
  { id: "mos", name: "Moscow Mule", price: 7.50, category: "cocktails", emoji: "🍸" },

  // Beer & Wine
  { id: "drf", name: "Draft Beer 0.3L", price: 3.00, category: "beer", emoji: "🍺" },
  { id: "dr5", name: "Draft Beer 0.5L", price: 4.00, category: "beer", emoji: "🍺" },
  { id: "bwh", name: "White Wine", price: 3.50, category: "beer", emoji: "🍷" },
  { id: "brd", name: "Red Wine", price: 3.50, category: "beer", emoji: "🍷" },
  { id: "pro", name: "Prosecco", price: 4.50, category: "beer", emoji: "🥂" },

  // Food
  { id: "tst", name: "Toast", price: 3.50, category: "food", emoji: "🥪" },
  { id: "crk", name: "Croissant", price: 2.80, category: "food", emoji: "🥐" },
  { id: "sal", name: "Mixed Salad", price: 5.50, category: "food", emoji: "🥗" },
  { id: "brg", name: "Burger", price: 8.90, category: "food", emoji: "🍔" },
  { id: "pzz", name: "Pizza Slice", price: 3.50, category: "food", emoji: "🍕" },

  // Desserts
  { id: "chc", name: "Chocolate Cake", price: 4.50, category: "desserts", emoji: "🍫" },
  { id: "tir", name: "Tiramisu", price: 4.90, category: "desserts", emoji: "🍰" },
  { id: "pan", name: "Pancakes", price: 5.50, category: "desserts", emoji: "🥞" },
  { id: "icr", name: "Ice Cream", price: 3.00, category: "desserts", emoji: "🍨" },
];

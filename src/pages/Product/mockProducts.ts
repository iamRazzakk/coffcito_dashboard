import type { Product, ProductCategory } from "./types";

export const DEFAULT_CATEGORIES: ProductCategory[] = [
  "Hot Drinks",
  "Cold Drinks",
  "Bakery",
  "Snacks",
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "PR-001",
    name: "Caramel Macchiato",
    category: "Hot Drinks",
    description:
      "Espresso with steamed milk, vanilla, and a caramel drizzle — our best seller.",
    image:
      "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=600&h=450&fit=crop&auto=format",
    price: 185,
    costPrice: 62,
    sold: 2841,
    status: "Active",
    sizes: [
      { id: "s1", label: "S", priceOffset: 0 },
      { id: "s2", label: "M", priceOffset: 15 },
      { id: "s3", label: "L", priceOffset: 30 },
    ],
    extras: [
      { id: "e1", label: "Extra shot", price: 25 },
      { id: "e2", label: "Oat milk", price: 20 },
    ],
  },
  {
    id: "PR-002",
    name: "Cold Brew Classic",
    category: "Cold Drinks",
    description: "Slow-steeped cold brew, smooth and naturally sweet.",
    image:
      "https://images.unsplash.com/photo-1517701604599-bb87e620215d?w=600&h=450&fit=crop&auto=format",
    price: 165,
    costPrice: 48,
    sold: 2204,
    status: "Active",
    sizes: [
      { id: "s1", label: "M", priceOffset: 0 },
      { id: "s2", label: "L", priceOffset: 20 },
    ],
    extras: [{ id: "e1", label: "Vanilla syrup", price: 15 }],
  },
  {
    id: "PR-003",
    name: "Vanilla Latte",
    category: "Hot Drinks",
    description: "Silky latte with house vanilla syrup.",
    image:
      "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&h=450&fit=crop&auto=format",
    price: 175,
    costPrice: 55,
    sold: 1976,
    status: "Active",
    sizes: [
      { id: "s1", label: "S", priceOffset: 0 },
      { id: "s2", label: "M", priceOffset: 10 },
      { id: "s3", label: "L", priceOffset: 20 },
    ],
    extras: [],
  },
  {
    id: "PR-004",
    name: "Matcha Latte",
    category: "Hot Drinks",
    description: "Ceremonial-grade matcha whisked with steamed milk.",
    image:
      "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&h=450&fit=crop&auto=format",
    price: 190,
    costPrice: 70,
    sold: 1642,
    status: "Active",
    sizes: [
      { id: "s1", label: "S", priceOffset: 0 },
      { id: "s2", label: "M", priceOffset: 15 },
      { id: "s3", label: "L", priceOffset: 25 },
    ],
    extras: [{ id: "e1", label: "Honey", price: 10 }],
  },
  {
    id: "PR-005",
    name: "Espresso Doppio",
    category: "Hot Drinks",
    description: "Double shot of our house espresso blend.",
    image:
      "https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?w=600&h=450&fit=crop&auto=format",
    price: 120,
    costPrice: 28,
    sold: 1510,
    status: "Active",
    sizes: [],
    extras: [{ id: "e1", label: "Extra shot", price: 25 }],
  },
  {
    id: "PR-006",
    name: "Iced Americano",
    category: "Cold Drinks",
    description: "Espresso over ice with cold water — crisp and bold.",
    image:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&h=450&fit=crop&auto=format",
    price: 145,
    costPrice: 35,
    sold: 1890,
    status: "Active",
    sizes: [
      { id: "s1", label: "M", priceOffset: 0 },
      { id: "s2", label: "L", priceOffset: 15 },
    ],
    extras: [],
  },
  {
    id: "PR-007",
    name: "Banana Bread",
    category: "Bakery",
    description: "Warm banana bread loaf slice with walnuts.",
    image:
      "https://images.unsplash.com/photo-1605286978633-2dec93ff88d3?w=600&h=450&fit=crop&auto=format",
    price: 115,
    costPrice: 32,
    sold: 980,
    status: "Active",
    sizes: [],
    extras: [],
  },
  {
    id: "PR-008",
    name: "Taro Milk Tea",
    category: "Cold Drinks",
    description: "Creamy taro milk tea with chewy pearls.",
    image:
      "https://images.unsplash.com/photo-1558857563-b371033873a8?w=600&h=450&fit=crop&auto=format",
    price: 165,
    costPrice: 52,
    sold: 1120,
    status: "Active",
    sizes: [
      { id: "s1", label: "M", priceOffset: 0 },
      { id: "s2", label: "L", priceOffset: 20 },
    ],
    extras: [
      { id: "e1", label: "Pearls", price: 15 },
      { id: "e2", label: "Pudding", price: 20 },
    ],
  },
  {
    id: "PR-009",
    name: "Seasonal Pumpkin Spice",
    category: "Hot Drinks",
    description: "Limited seasonal latte — currently paused.",
    image:
      "https://images.unsplash.com/photo-1570968915860-54d0c802d8c7?w=600&h=450&fit=crop&auto=format",
    price: 195,
    costPrice: 68,
    sold: 420,
    status: "Inactive",
    sizes: [
      { id: "s1", label: "S", priceOffset: 0 },
      { id: "s2", label: "M", priceOffset: 15 },
      { id: "s3", label: "L", priceOffset: 30 },
    ],
    extras: [{ id: "e1", label: "Whipped cream", price: 15 }],
  },
];

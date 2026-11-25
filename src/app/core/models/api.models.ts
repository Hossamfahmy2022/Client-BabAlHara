export type OrderStatus =
  | 'New'
  | 'Confirmed'
  | 'Preparing'
  | 'ReadyForPickup'
  | 'OutForDelivery'
  | 'Delivered'
  | 'Cancelled';

export type OrderType = 'Delivery' | 'Pickup';
export type OrderChannel = 'Website' | 'WhatsApp' | 'Phone';

export interface OpeningHour {
  dayOfWeek: number;
  dayAr: string;
  open: string;
  close: string;
}

export interface RestaurantRatings {
  google: { score: number; count: number };
  facebook: { recommendPercent: number; count: number };
}

export interface RestaurantInfo {
  nameAr: string;
  nameEn: string;
  taglineAr: string;
  descriptionAr: string;
  addressAr: string;
  addressEn: string;
  latitude: number;
  longitude: number;
  plusCode: string;
  googleMapsUrl: string;
  phones: string[];
  whatsappNumber: string;
  complaintsPhone?: string | null;
  facebookUrl: string;
  deliveryFee: number;
  minOrderAmount: number;
  acceptingOrders: boolean;
  isOpenNow: boolean;
  paymentMethods: string[];
  services: string[];
  openingHours: OpeningHour[];
  ratings: RestaurantRatings;
  logoUrl: string;
  coverUrl: string;
  menuImageUrl: string;
}

export interface Variant {
  id: number;
  nameAr?: string | null;
  price: number | null;
  sortOrder: number;
}

export interface MenuItem {
  id: number;
  categoryId: number;
  nameAr: string;
  nameEn?: string | null;
  descriptionAr?: string | null;
  imageUrl?: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  sortOrder: number;
  needsPricing: boolean;
  variants: Variant[];
}

export interface MenuCategory {
  id: number;
  slug: string;
  nameAr: string;
  nameEn?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
  items: MenuItem[];
}

export interface Offer {
  id: number;
  titleAr: string;
  descriptionAr: string;
  imageUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface CreateOrderItemRequest {
  menuItemId: number;
  variantId: number;
  quantity: number;
  notes?: string | null;
}

export interface CreateOrderRequest {
  customerName: string;
  customerPhone: string;
  orderType: OrderType;
  address?: string | null;
  notes?: string | null;
  channel: OrderChannel;
  items: CreateOrderItemRequest[];
}

export interface OrderItemDto {
  id: number;
  menuItemId: number;
  variantId: number;
  itemNameAr: string;
  variantNameAr?: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  notes?: string | null;
}

export interface OrderStatusHistoryDto {
  status: OrderStatus;
  changedAt: string;
  note?: string | null;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  orderType: OrderType;
  address?: string | null;
  notes?: string | null;
  channel: OrderChannel;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDto[];
  statusHistory: OrderStatusHistoryDto[];
}

export interface OrderTracking {
  orderNumber: string;
  status: OrderStatus;
  orderType: OrderType;
  total: number;
  createdAt: string;
  updatedAt: string;
  statusHistory: OrderStatusHistoryDto[];
  items: OrderItemDto[];
}

export interface CartEntry {
  key: string;
  menuItemId: number;
  variantId: number;
  itemNameAr: string;
  variantNameAr?: string | null;
  unitPrice: number;
  quantity: number;
  notes?: string;
  imageUrl?: string | null;
}

export interface RecentOrderRef {
  orderNumber: string;
  phone: string;
  total: number;
  createdAt: string;
}

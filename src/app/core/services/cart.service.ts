import { Injectable, computed, signal } from '@angular/core';
import { CartEntry, MenuItem, RecentOrderRef, Variant } from '../models/api.models';

const CART_KEY = 'babalhara_cart_v1';
const RECENT_ORDERS_KEY = 'babalhara_recent_orders_v1';

@Injectable({ providedIn: 'root' })
export class CartService {
  readonly items = signal<CartEntry[]>(this.readCart());
  readonly drawerOpen = signal<boolean>(false);
  readonly recentOrders = signal<RecentOrderRef[]>(this.readRecentOrders());

  readonly itemCount = computed(() =>
    this.items().reduce((acc, item) => acc + item.quantity, 0),
  );

  readonly subtotal = computed(() =>
    this.items().reduce((acc, item) => acc + item.unitPrice * item.quantity, 0),
  );

  openDrawer(): void {
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  addItem(
    item: MenuItem,
    variant: Variant,
    quantity = 1,
    notes = '',
    fallbackImage?: string | null,
  ): void {
    if (variant.price === null || variant.price <= 0) {
      return;
    }

    const cleanNotes = notes.trim();
    const key = `${item.id}:${variant.id}:${cleanNotes}`;
    const current = [...this.items()];
    const idx = current.findIndex((c) => c.key === key);

    if (idx >= 0) {
      const existing = current[idx];
      current[idx] = {
        ...existing,
        quantity: Math.min(50, existing.quantity + quantity),
      };
    } else {
      current.push({
        key,
        menuItemId: item.id,
        variantId: variant.id,
        itemNameAr: item.nameAr,
        variantNameAr: variant.nameAr ?? null,
        unitPrice: variant.price,
        quantity: Math.min(50, Math.max(1, quantity)),
        notes: cleanNotes || undefined,
        imageUrl: item.imageUrl || fallbackImage || null,
      });
    }

    this.items.set(current);
    this.saveCart(current);
  }

  increment(key: string): void {
    const updated = this.items().map((item) =>
      item.key === key ? { ...item, quantity: Math.min(50, item.quantity + 1) } : item,
    );
    this.items.set(updated);
    this.saveCart(updated);
  }

  decrement(key: string): void {
    const updated = this.items()
      .map((item) =>
        item.key === key ? { ...item, quantity: item.quantity - 1 } : item,
      )
      .filter((item) => item.quantity > 0);
    this.items.set(updated);
    this.saveCart(updated);
  }

  remove(key: string): void {
    const updated = this.items().filter((item) => item.key !== key);
    this.items.set(updated);
    this.saveCart(updated);
  }

  clear(): void {
    this.items.set([]);
    this.saveCart([]);
  }

  saveRecentOrder(ref: RecentOrderRef): void {
    const list = [
      ref,
      ...this.recentOrders().filter((o) => o.orderNumber !== ref.orderNumber),
    ].slice(0, 6);
    this.recentOrders.set(list);
    try {
      localStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify(list));
    } catch {
      // Ignore storage quota errors
    }
  }

  private readCart(): CartEntry[] {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveCart(items: CartEntry[]): void {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota errors
    }
  }

  private readRecentOrders(): RecentOrderRef[] {
    try {
      const raw = localStorage.getItem(RECENT_ORDERS_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}

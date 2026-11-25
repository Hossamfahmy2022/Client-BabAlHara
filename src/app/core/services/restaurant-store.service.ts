import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { MenuCategory, MenuItem, Offer, RestaurantInfo } from '../models/api.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class RestaurantStoreService {
  private readonly api = inject(ApiService);

  readonly restaurant = signal<RestaurantInfo | null>(null);
  readonly menu = signal<MenuCategory[]>([]);
  readonly offers = signal<Offer[]>([]);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  readonly featuredItems = computed(() => {
    const categories = this.menu();
    const list: { item: MenuItem; categoryImage?: string | null }[] = [];
    for (const cat of categories) {
      for (const item of cat.items) {
        if (item.isFeatured) {
          list.push({ item, categoryImage: cat.imageUrl });
        }
      }
    }
    return list;
  });

  readonly todayOpeningHour = computed(() => {
    const info = this.restaurant();
    if (!info) {
      return null;
    }
    const cairoDayStr = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Cairo',
      weekday: 'short',
    }).format(new Date());

    const map: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    const dow = map[cairoDayStr] ?? new Date().getDay();
    return info.openingHours.find((h) => h.dayOfWeek === dow) ?? null;
  });

  constructor() {
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      restaurant: this.api.getRestaurant(),
      menu: this.api.getMenu(),
      offers: this.api.getOffers().pipe(catchError(() => of([] as Offer[]))),
    }).subscribe({
      next: ({ restaurant, menu, offers }) => {
        this.restaurant.set(restaurant);
        this.menu.set(menu);
        this.offers.set(offers);
        this.loading.set(false);
      },
      error: (err) => {
        const msgs = this.api.extractErrorMessages(err);
        this.error.set(msgs[0] ?? 'تعذر تحميل بيانات المطعم.');
        this.loading.set(false);
      },
    });
  }
}

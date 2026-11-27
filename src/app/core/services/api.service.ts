import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateOrderRequest,
  MenuCategory,
  Offer,
  Order,
  OrderTracking,
  RestaurantInfo,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl.replace(/\/+$/, '');

  getRestaurant(): Observable<RestaurantInfo> {
    return this.http.get<RestaurantInfo>(`${this.baseUrl}/api/restaurant`);
  }

  getMenu(): Observable<MenuCategory[]> {
    return this.http.get<MenuCategory[]>(`${this.baseUrl}/api/menu`);
  }

  getOffers(): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${this.baseUrl}/api/offers`);
  }

  createOrder(payload: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/api/orders`, payload);
  }

  trackOrder(orderNumber: string, phone: string): Observable<OrderTracking> {
    const params = new HttpParams()
      .set('orderNumber', orderNumber.trim())
      .set('phone', phone.trim());
    return this.http.get<OrderTracking>(`${this.baseUrl}/api/orders/track`, { params });
  }

  resolveImageUrl(path?: string | null, fallbackPath?: string | null): string {
    const chosen = path || fallbackPath || '/images/logo.jpg';
    if (chosen.startsWith('http://') || chosen.startsWith('https://')) {
      return chosen;
    }
    if (chosen.startsWith('/')) {
      return `${this.baseUrl}${chosen}`;
    }
    return `${this.baseUrl}/${chosen}`;
  }

  extractErrorMessages(err: unknown): string[] {
    if (!(err instanceof HttpErrorResponse)) {
      return ['حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.'];
    }

    if (err.status === 0) {
      return ['تعذر الاتصال بالخادم. يرجى التأكد من تشغيل الخدمة أو الاتصال بالإنترنت.'];
    }

    const body = err.error as Record<string, unknown> | null;
    if (body && typeof body === 'object') {
      const errorsObj = body['errors'] as Record<string, string[]> | undefined;
      if (errorsObj && typeof errorsObj === 'object') {
        const collected: string[] = [];
        for (const key of Object.keys(errorsObj)) {
          const msgs = errorsObj[key];
          if (Array.isArray(msgs)) {
            collected.push(...msgs);
          }
        }
        if (collected.length > 0) {
          return collected;
        }
      }

      const detail = body['detail'];
      if (typeof detail === 'string' && detail.trim()) {
        return [detail];
      }

      const title = body['title'];
      if (typeof title === 'string' && title.trim()) {
        return [title];
      }
    }

    return ['تعذر إتمام الطلب، يرجى مراجعة البيانات والمحاولة مرة أخرى.'];
  }
}

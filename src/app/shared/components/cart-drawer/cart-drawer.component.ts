import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { CartService } from '../../../core/services/cart.service';
import { RestaurantStoreService } from '../../../core/services/restaurant-store.service';
import { EgpPipe } from '../../pipes/egp.pipe';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [EgpPipe],
  template: `
    @if (cart.drawerOpen()) {
      <div class="drawer-backdrop" (click)="cart.closeDrawer()"></div>
      <aside class="drawer-panel" aria-label="سلة الطلبات">
        <header class="drawer-header">
          <div>
            <h3>سلة طلباتك</h3>
            <span>{{ cart.itemCount() }} صنف</span>
          </div>
          <button type="button" class="close-btn" (click)="cart.closeDrawer()" aria-label="إغلاق">
            ✕
          </button>
        </header>

        @if (store.restaurant(); as rest) {
          @if (!rest.acceptingOrders) {
            <div class="alert alert-warning drawer-alert">
              المطعم متوقف مؤقتاً عن استقبال الطلبات أونلاين. يمكنك التصفح أو الاتصال على {{ rest.phones[0] }}.
            </div>
          } @else if (!rest.isOpenNow) {
            <div class="alert alert-warning drawer-alert">
              المطعم مغلق حالياً. يمكنك تصفح المنيو وتجهيز طلبك.
            </div>
          }
        }

        <div class="drawer-body">
          @if (cart.items().length === 0) {
            <div class="empty-cart">
              <div class="empty-icon">🥙</div>
              <p>سلتك فارغة حالياً</p>
              <button type="button" class="btn btn-primary" (click)="goToMenu()">تصفح المنيو</button>
            </div>
          } @else {
            @for (entry of cart.items(); track entry.key) {
              <div class="cart-row">
                <img
                  [src]="api.resolveImageUrl(entry.imageUrl)"
                  [alt]="entry.itemNameAr"
                  class="cart-thumb"
                />
                <div class="cart-info">
                  <div class="cart-name">{{ entry.itemNameAr }}</div>
                  @if (entry.variantNameAr) {
                    <span class="variant-tag">{{ entry.variantNameAr }}</span>
                  }
                  @if (entry.notes) {
                    <div class="cart-note">ملاحظة: {{ entry.notes }}</div>
                  }
                  <div class="cart-price">{{ entry.unitPrice * entry.quantity | egp }}</div>
                </div>
                <div class="cart-actions">
                  <div class="qty-pill">
                    <button type="button" (click)="cart.increment(entry.key)" aria-label="زيادة">+</button>
                    <span>{{ entry.quantity }}</span>
                    <button type="button" (click)="cart.decrement(entry.key)" aria-label="إنقاص">−</button>
                  </div>
                  <button type="button" class="remove-link" (click)="cart.remove(entry.key)">حذف</button>
                </div>
              </div>
            }
          }
        </div>

        @if (cart.items().length > 0) {
          <footer class="drawer-footer">
            <div class="summary-line">
              <span>المجموع الفرعي</span>
              <strong>{{ cart.subtotal() | egp }}</strong>
            </div>
            @if (store.restaurant(); as rest) {
              <div class="summary-line muted">
                <span>رسوم التوصيل (داخل سنورس)</span>
                <span>{{ rest.deliveryFee | egp }}</span>
              </div>
            }
            <div class="footer-buttons">
              <button type="button" class="btn btn-primary checkout-btn" (click)="goToCheckout()">
                إتمام الطلب
              </button>
              <button type="button" class="btn btn-ghost" (click)="cart.clear()">تفريغ</button>
            </div>
          </footer>
        }
      </aside>
    }
  `,
  styles: [`
    .drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(43, 29, 20, 0.55);
      z-index: 90;
      backdrop-filter: blur(2px);
    }
    .drawer-panel {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      width: min(410px, 100vw);
      background: var(--bg);
      z-index: 100;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-lg);
    }
    .drawer-header {
      padding: 16px 20px;
      background: var(--dark);
      color: var(--cream);
      display: flex;
      align-items: center;
      justify-content: space-between;
      h3 { margin: 0; font-size: 1.15rem; }
      span { font-size: 0.85rem; color: var(--gold-soft); }
    }
    .close-btn {
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
      border: none;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      font-size: 1rem;
      cursor: pointer;
    }
    .drawer-alert {
      margin: 12px 16px 0;
      font-size: 0.85rem;
    }
    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .empty-cart {
      text-align: center;
      padding: 48px 16px;
      .empty-icon { font-size: 3rem; margin-bottom: 8px; }
      p { color: var(--muted); font-weight: 600; margin-bottom: 16px; }
    }
    .cart-row {
      display: flex;
      gap: 12px;
      align-items: center;
      background: #fff;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 10px;
    }
    .cart-thumb {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      object-fit: cover;
      flex-shrink: 0;
      background: var(--cream);
    }
    .cart-info {
      flex: 1;
      min-width: 0;
    }
    .cart-name {
      font-weight: 700;
      font-size: 0.94rem;
      color: var(--dark);
    }
    .variant-tag {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      background: var(--cream);
      color: var(--primary-dark);
      padding: 1px 8px;
      border-radius: 999px;
      margin-top: 2px;
    }
    .cart-note {
      font-size: 0.78rem;
      color: var(--muted);
      margin-top: 2px;
    }
    .cart-price {
      font-weight: 800;
      color: var(--primary);
      font-size: 0.92rem;
      margin-top: 4px;
    }
    .cart-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
    .qty-pill {
      display: flex;
      align-items: center;
      background: var(--cream);
      border-radius: 999px;
      border: 1px solid var(--border);
      button {
        width: 26px;
        height: 26px;
        border: none;
        background: transparent;
        font-weight: 800;
        color: var(--dark);
        cursor: pointer;
      }
      span {
        min-width: 20px;
        text-align: center;
        font-weight: 700;
        font-size: 0.88rem;
      }
    }
    .remove-link {
      border: none;
      background: transparent;
      color: var(--closed);
      font-size: 0.76rem;
      font-weight: 700;
      cursor: pointer;
    }
    .drawer-footer {
      padding: 16px 20px;
      background: #fff;
      border-top: 1px solid var(--border);
    }
    .summary-line {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 0.95rem;
      &.muted { color: var(--muted); font-size: 0.85rem; }
    }
    .footer-buttons {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      .checkout-btn { flex: 1; }
    }
  `],
})
export class CartDrawerComponent {
  readonly cart = inject(CartService);
  readonly store = inject(RestaurantStoreService);
  readonly api = inject(ApiService);
  private readonly router = inject(Router);

  goToCheckout(): void {
    this.cart.closeDrawer();
    this.router.navigate(['/checkout']);
  }

  goToMenu(): void {
    this.cart.closeDrawer();
    this.router.navigate(['/menu']);
  }
}

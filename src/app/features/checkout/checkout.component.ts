import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CreateOrderRequest, OrderChannel, OrderType } from '../../core/models/api.models';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';
import { RestaurantStoreService } from '../../core/services/restaurant-store.service';
import { ToastService } from '../../core/services/toast.service';
import { EgpPipe } from '../../shared/pipes/egp.pipe';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, EgpPipe],
  template: `
    <div class="container checkout-page">
      <h1>إتمام الطلب</h1>

      @if (cart.items().length === 0) {
        <div class="card empty-state">
          <p>السلة فارغة حالياً. أضف أصنافك المفضلة من المنيو أولاً.</p>
          <a routerLink="/menu" class="btn btn-primary">تصفح المنيو</a>
        </div>
      } @else {
        @if (store.restaurant(); as rest) {
          @if (!rest.acceptingOrders) {
            <div class="alert alert-error" style="margin-bottom: 18px;">
              المطعم لا يستقبل طلبات أونلاين حالياً. يمكنك الاتصال بنا مباشرة على {{ rest.phones.join(' أو ') }}.
            </div>
          } @else if (!rest.isOpenNow) {
            <div class="alert alert-warning" style="margin-bottom: 18px;">
              تنبيه: المطعم خارج مواعيد العمل الرسمية الآن؛ قد يتم تأكيد طلبك مع بداية الشيفت.
            </div>
          }
        }

        <div class="checkout-grid">
          <div class="card form-card">
            <h2>بيانات العميل والتوصيل</h2>

            @if (serverErrors().length > 0) {
              <div class="alert alert-error" style="margin-bottom: 16px;">
                @for (msg of serverErrors(); track msg) {
                  <div>• {{ msg }}</div>
                }
              </div>
            }

            <form [formGroup]="form" novalidate>
              <div class="type-toggle">
                <button
                  type="button"
                  class="type-btn"
                  [class.active]="orderType() === 'Delivery'"
                  (click)="setOrderType('Delivery')"
                >
                  🛵 توصيل للمنزل
                </button>
                <button
                  type="button"
                  class="type-btn"
                  [class.active]="orderType() === 'Pickup'"
                  (click)="setOrderType('Pickup')"
                >
                  🏪 استلام من المطعم
                </button>
              </div>

              <div class="field-group">
                <label for="customerName">الاسم بالكامل *</label>
                <input
                  id="customerName"
                  type="text"
                  formControlName="customerName"
                  placeholder="مثال: أحمد محمد"
                />
                @if (form.controls.customerName.touched && form.controls.customerName.invalid) {
                  <span class="field-error">يرجى كتابة الاسم (من 2 إلى 80 حرفاً).</span>
                }
              </div>

              <div class="field-group">
                <label for="customerPhone">رقم الموبايل (مصر) *</label>
                <input
                  id="customerPhone"
                  type="tel"
                  dir="ltr"
                  formControlName="customerPhone"
                  placeholder="01012345678"
                />
                @if (form.controls.customerPhone.touched && form.controls.customerPhone.invalid) {
                  <span class="field-error">يرجى إدخال رقم موبايل مصري صحيح (11 رقم يبدأ بـ 010 أو 011 أو 012 أو 015).</span>
                }
              </div>

              @if (orderType() === 'Delivery') {
                <div class="field-group">
                  <label for="address">العنوان بالتفصيل في سنورس *</label>
                  <textarea
                    id="address"
                    rows="2"
                    formControlName="address"
                    placeholder="الشارع، رقم المنزل أو أقرب علامة مميزة، الدور والشقة"
                  ></textarea>
                  @if (form.controls.address.touched && form.controls.address.invalid) {
                    <span class="field-error">يرجى كتابة عنوان التوصيل بالتفصيل (5 أحرف على الأقل).</span>
                  }
                </div>
              }

              <div class="field-group">
                <label for="notes">ملاحظات إضافية (اختياري)</label>
                <textarea
                  id="notes"
                  rows="2"
                  formControlName="notes"
                  placeholder="أي طلبات خاصة للأكل أو التوصيل"
                ></textarea>
              </div>

              @if (belowMinOrder()) {
                <div class="alert alert-warning" style="margin-bottom: 14px;">
                  الحد الأدنى للطلب هو {{ store.restaurant()?.minOrderAmount | egp }}.
                </div>
              }

              <div class="submit-actions">
                <button
                  type="button"
                  class="btn btn-primary submit-btn"
                  [disabled]="submitting() || !canSubmit()"
                  (click)="submitOrder('Website')"
                >
                  {{ submittingChannel() === 'Website' ? 'جاري إرسال الطلب...' : 'تأكيد الطلب الآن' }}
                </button>

                <button
                  type="button"
                  class="btn btn-whatsapp submit-btn"
                  [disabled]="submitting() || !canSubmit()"
                  (click)="submitOrder('WhatsApp')"
                >
                  {{ submittingChannel() === 'WhatsApp' ? 'جاري التسجيل...' : 'اطلب عبر واتساب' }}
                </button>
              </div>
            </form>

            @if (store.restaurant(); as rest) {
              <div class="call-box">
                <strong>أو اتصل للطلب مباشرة:</strong>
                <div class="phone-links">
                  @for (phone of rest.phones; track phone) {
                    <a [href]="'tel:' + phone" class="btn btn-outline">اتصال: {{ phone }}</a>
                  }
                </div>
              </div>
            }
          </div>

          <aside class="card summary-card">
            <h2>ملخص الطلب</h2>
            <div class="summary-items">
              @for (entry of cart.items(); track entry.key) {
                <div class="sum-row">
                  <div>
                    <div class="sum-name">
                      {{ entry.itemNameAr }}
                      @if (entry.variantNameAr) {
                        <small>({{ entry.variantNameAr }})</small>
                      }
                    </div>
                    @if (entry.notes) {
                      <div class="sum-note">{{ entry.notes }}</div>
                    }
                    <div class="sum-controls">
                      <button type="button" (click)="cart.increment(entry.key)">+</button>
                      <span>{{ entry.quantity }}</span>
                      <button type="button" (click)="cart.decrement(entry.key)">−</button>
                      <button type="button" class="del" (click)="cart.remove(entry.key)">حذف</button>
                    </div>
                  </div>
                  <strong>{{ entry.unitPrice * entry.quantity | egp }}</strong>
                </div>
              }
            </div>

            <div class="totals">
              <div class="tot-line">
                <span>المجموع الفرعي</span>
                <span>{{ cart.subtotal() | egp }}</span>
              </div>
              <div class="tot-line">
                <span>رسوم التوصيل</span>
                <span>{{ deliveryFee() | egp }}</span>
              </div>
              <div class="tot-line grand">
                <span>الإجمالي النهائي (دفع كاش)</span>
                <strong>{{ total() | egp }}</strong>
              </div>
            </div>
          </aside>
        </div>
      }
    </div>
  `,
  styles: [`
    .checkout-page {
      padding-block: 28px 48px;
      h1 { margin: 0 0 20px; font-size: 1.65rem; font-weight: 800; color: var(--dark); }
    }
    .empty-state {
      padding: 48px 20px;
      text-align: center;
      p { color: var(--muted); margin-bottom: 16px; font-weight: 600; }
    }
    .checkout-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      align-items: start;
    }
    @media (min-width: 900px) {
      .checkout-grid {
        grid-template-columns: 1.25fr 0.9fr;
      }
    }
    .form-card, .summary-card {
      padding: 22px;
      h2 { margin: 0 0 18px; font-size: 1.2rem; color: var(--dark); }
    }
    .type-toggle {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 18px;
    }
    .type-btn {
      padding: 12px;
      border-radius: var(--radius-sm);
      border: 1.5px solid var(--border);
      background: var(--bg);
      font-weight: 700;
      font-size: 0.94rem;
      cursor: pointer;
      color: var(--text);

      &.active {
        border-color: var(--primary);
        background: var(--cream);
        color: var(--primary-dark);
      }
    }
    .submit-actions {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
      margin-top: 8px;
    }
    @media (min-width: 520px) {
      .submit-actions {
        grid-template-columns: 1fr 1fr;
      }
    }
    .submit-btn {
      padding: 13px 16px;
      font-size: 0.98rem;
    }
    .call-box {
      margin-top: 22px;
      padding-top: 16px;
      border-top: 1px dashed var(--border);
      display: flex;
      flex-direction: column;
      gap: 10px;
      .phone-links {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
    }
    .summary-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;
    }
    .sum-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border);
    }
    .sum-name {
      font-weight: 700;
      font-size: 0.94rem;
      small { color: var(--muted); }
    }
    .sum-note {
      font-size: 0.8rem;
      color: var(--muted);
    }
    .sum-controls {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 6px;
      button {
        border: 1px solid var(--border);
        background: var(--bg);
        width: 24px;
        height: 24px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 800;
      }
      span { font-weight: 700; font-size: 0.88rem; min-width: 18px; text-align: center; }
      .del {
        width: auto;
        padding-inline: 8px;
        color: var(--closed);
        border-color: transparent;
        background: transparent;
        font-size: 0.78rem;
      }
    }
    .totals {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .tot-line {
      display: flex;
      justify-content: space-between;
      font-size: 0.94rem;
      color: var(--muted);
      &.grand {
        padding-top: 10px;
        border-top: 2px solid var(--gold-soft);
        color: var(--dark);
        font-size: 1.08rem;
        font-weight: 800;
        strong { color: var(--primary); }
      }
    }
  `],
})
export class CheckoutComponent {
  readonly cart = inject(CartService);
  readonly store = inject(RestaurantStoreService);
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly orderType = signal<OrderType>('Delivery');
  readonly submitting = signal<boolean>(false);
  readonly submittingChannel = signal<OrderChannel | null>(null);
  readonly serverErrors = signal<string[]>([]);

  readonly form = this.fb.nonNullable.group({
    customerName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    customerPhone: ['', [Validators.required, Validators.pattern(/^01[0125]\d{8}$/)]],
    address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(300)]],
    notes: ['', [Validators.maxLength(500)]],
  });

  readonly deliveryFee = computed(() => {
    const rest = this.store.restaurant();
    if (!rest || this.orderType() !== 'Delivery') {
      return 0;
    }
    return rest.deliveryFee;
  });

  readonly total = computed(() => this.cart.subtotal() + this.deliveryFee());

  readonly belowMinOrder = computed(() => {
    const rest = this.store.restaurant();
    return Boolean(rest && rest.minOrderAmount > 0 && this.cart.subtotal() < rest.minOrderAmount);
  });

  readonly canSubmit = computed(() => {
    const rest = this.store.restaurant();
    if (rest && !rest.acceptingOrders) {
      return false;
    }
    return this.cart.items().length > 0 && !this.belowMinOrder();
  });

  setOrderType(type: OrderType): void {
    this.orderType.set(type);
    const addressCtrl = this.form.controls.address;
    if (type === 'Delivery') {
      addressCtrl.setValidators([Validators.required, Validators.minLength(5), Validators.maxLength(300)]);
    } else {
      addressCtrl.setValidators([Validators.maxLength(300)]);
    }
    addressCtrl.updateValueAndValidity();
  }

  submitOrder(channel: OrderChannel): void {
    this.serverErrors.set([]);
    this.form.markAllAsTouched();

    if (this.form.invalid || !this.canSubmit()) {
      this.toast.show('يرجى التأكد من استكمال البيانات المطلوبة بشكل صحيح', 'error');
      return;
    }

    const raw = this.form.getRawValue();
    const payload: CreateOrderRequest = {
      customerName: raw.customerName.trim(),
      customerPhone: raw.customerPhone.trim(),
      orderType: this.orderType(),
      address: this.orderType() === 'Delivery' ? raw.address.trim() : null,
      notes: raw.notes.trim() || null,
      channel,
      items: this.cart.items().map((i) => ({
        menuItemId: i.menuItemId,
        variantId: i.variantId,
        quantity: i.quantity,
        notes: i.notes ?? null,
      })),
    };

    this.submitting.set(true);
    this.submittingChannel.set(channel);

    this.api.createOrder(payload).subscribe({
      next: (order) => {
        this.submitting.set(false);
        this.submittingChannel.set(null);

        this.cart.saveRecentOrder({
          orderNumber: order.orderNumber,
          phone: order.customerPhone,
          total: order.total,
          createdAt: order.createdAt,
        });
        this.cart.clear();

        let whatsappUrl: string | null = null;
        if (channel === 'WhatsApp') {
          whatsappUrl = this.buildWhatsappUrl(order);
          if (whatsappUrl) {
            window.open(whatsappUrl, '_blank', 'noopener');
          }
        }

        this.router.navigate(['/order-success', order.orderNumber], {
          state: { order, whatsappUrl },
        });
      },
      error: (err) => {
        this.submitting.set(false);
        this.submittingChannel.set(null);
        this.serverErrors.set(this.api.extractErrorMessages(err));
      },
    });
  }

  private buildWhatsappUrl(order: {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    orderType: OrderType;
    address?: string | null;
    notes?: string | null;
    subtotal: number;
    deliveryFee: number;
    total: number;
    items: { itemNameAr: string; variantNameAr?: string | null; quantity: number; lineTotal: number; notes?: string | null }[];
  }): string | null {
    const waNumber = this.store.restaurant()?.whatsappNumber;
    if (!waNumber) {
      return null;
    }

    const lines: string[] = [
      `طلب جديد من موقع *باب الحارة* 🥙`,
      `رقم الطلب: *${order.orderNumber}*`,
      `الاسم: ${order.customerName}`,
      `الموبايل: ${order.customerPhone}`,
      `نوع الطلب: ${order.orderType === 'Delivery' ? 'توصيل للمنزل' : 'استلام من المطعم'}`,
    ];

    if (order.address) {
      lines.push(`العنوان: ${order.address}`);
    }

    lines.push('', '*الأصناف:*');
    for (const item of order.items) {
      const variant = item.variantNameAr ? ` (${item.variantNameAr})` : '';
      const itemNote = item.notes ? ` - [${item.notes}]` : '';
      lines.push(`• ${item.quantity}× ${item.itemNameAr}${variant} — ${item.lineTotal} ج.م${itemNote}`);
    }

    lines.push('', `المجموع الفرعي: ${order.subtotal} ج.م`);
    if (order.orderType === 'Delivery') {
      lines.push(`التوصيل: ${order.deliveryFee} ج.م`);
    }
    lines.push(`*الإجمالي: ${order.total} ج.م (دفع كاش)*`);

    if (order.notes) {
      lines.push(`ملاحظات: ${order.notes}`);
    }

    return `https://wa.me/${waNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
  }
}

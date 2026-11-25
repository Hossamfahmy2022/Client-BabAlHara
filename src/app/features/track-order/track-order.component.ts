import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OrderStatus, OrderTracking, RecentOrderRef } from '../../core/models/api.models';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';
import { CairoDatePipe } from '../../shared/pipes/cairo-date.pipe';
import { EgpPipe } from '../../shared/pipes/egp.pipe';

interface StepDef {
  status: OrderStatus;
  label: string;
}

@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [ReactiveFormsModule, EgpPipe, CairoDatePipe],
  template: `
    <div class="container track-page">
      <h1>تتبع حالة طلبك</h1>

      @if (cart.recentOrders().length > 0) {
        <div class="recent-wrap">
          <span>طلباتك الأخيرة:</span>
          @for (ref of cart.recentOrders(); track ref.orderNumber) {
            <button type="button" class="recent-chip" (click)="selectRecent(ref)">
              {{ ref.orderNumber }} ({{ ref.total | egp }})
            </button>
          }
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="search()" class="card search-card">
        <div class="search-fields">
          <div class="field-group" style="margin-bottom: 0;">
            <label for="orderNumber">رقم الطلب</label>
            <input
              id="orderNumber"
              type="text"
              dir="ltr"
              formControlName="orderNumber"
              placeholder="BH-000001"
            />
          </div>
          <div class="field-group" style="margin-bottom: 0;">
            <label for="phone">رقم الموبايل</label>
            <input
              id="phone"
              type="tel"
              dir="ltr"
              formControlName="phone"
              placeholder="01012345678"
            />
          </div>
          <button type="submit" class="btn btn-primary search-btn" [disabled]="loading()">
            {{ loading() ? 'جاري البحث...' : 'بحث عن الطلب' }}
          </button>
        </div>
      </form>

      @if (errorMsg()) {
        <div class="alert alert-error" style="margin-top: 18px;">
          {{ errorMsg() }}
        </div>
      }

      @if (tracking(); as t) {
        <div class="card result-card">
          <div class="result-head">
            <div>
              <span class="order-num">{{ t.orderNumber }}</span>
              <span class="badge badge-gold">
                {{ t.orderType === 'Delivery' ? 'توصيل للمنزل' : 'استلام من المطعم' }}
              </span>
            </div>
            <div class="result-total">الإجمالي: <strong>{{ t.total | egp }}</strong></div>
          </div>

          @if (t.status === 'Cancelled') {
            <div class="alert alert-error" style="margin-bottom: 20px;">
              تم إلغاء هذا الطلب. للمزيد من التفاصيل يرجى التواصل مع المطعم.
            </div>
          } @else {
            <div class="stepper">
              @for (step of steps(); track step.status; let idx = $index) {
                <div
                  class="step-item"
                  [class.done]="idx < currentStepIndex()"
                  [class.active]="idx === currentStepIndex()"
                >
                  <div class="step-dot">{{ idx <= currentStepIndex() ? '✓' : idx + 1 }}</div>
                  <div class="step-label">{{ step.label }}</div>
                </div>
              }
            </div>
            @if (t.status !== 'Delivered') {
              <p class="auto-refresh-note">يتم تحديث الحالة تلقائياً كل 15 ثانية</p>
            }
          }

          <div class="result-grid">
            <div>
              <h3>الأصناف المطلوبة</h3>
              <ul class="items-list">
                @for (item of t.items; track item.id) {
                  <li>
                    <span>
                      {{ item.quantity }}× {{ item.itemNameAr }}
                      @if (item.variantNameAr) {
                        <small>({{ item.variantNameAr }})</small>
                      }
                    </span>
                    <strong>{{ item.lineTotal | egp }}</strong>
                  </li>
                }
              </ul>
            </div>

            <div>
              <h3>سجل التحديثات</h3>
              <ul class="history-list">
                @for (h of t.statusHistory; track $index) {
                  <li>
                    <div class="hist-status">{{ statusLabel(h.status) }}</div>
                    <div class="hist-time">{{ h.changedAt | cairoDate }}</div>
                    @if (h.note) {
                      <div class="hist-note">{{ h.note }}</div>
                    }
                  </li>
                }
              </ul>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .track-page {
      padding-block: 28px 56px;
      max-width: 880px;
      h1 { margin: 0 0 18px; font-size: 1.65rem; font-weight: 800; color: var(--dark); }
    }
    .recent-wrap {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      margin-bottom: 14px;
      span { font-weight: 700; font-size: 0.9rem; color: var(--muted); }
    }
    .recent-chip {
      border: 1px solid var(--gold);
      background: var(--cream);
      color: var(--primary-dark);
      border-radius: 999px;
      padding: 4px 12px;
      font-weight: 700;
      font-size: 0.84rem;
      cursor: pointer;
    }
    .search-card {
      padding: 18px;
    }
    .search-fields {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      align-items: end;
    }
    @media (min-width: 680px) {
      .search-fields {
        grid-template-columns: 1fr 1fr auto;
      }
    }
    .search-btn { height: 46px; }
    .result-card {
      margin-top: 22px;
      padding: 22px;
    }
    .result-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 20px;
      .order-num {
        font-size: 1.25rem;
        font-weight: 900;
        color: var(--dark);
        margin-inline-end: 10px;
      }
      .result-total strong { color: var(--primary); font-size: 1.1rem; }
    }
    .stepper {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      margin-bottom: 10px;
    }
    .step-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 6px;
      color: var(--muted);
      .step-dot {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 2px solid var(--border);
        background: var(--bg);
        display: grid;
        place-items: center;
        font-weight: 800;
        font-size: 0.86rem;
      }
      .step-label {
        font-size: 0.78rem;
        font-weight: 700;
      }
      &.done .step-dot {
        background: var(--open);
        border-color: var(--open);
        color: #fff;
      }
      &.active .step-dot {
        background: var(--primary);
        border-color: var(--gold);
        color: #fff;
        box-shadow: 0 0 0 4px var(--cream);
      }
      &.done, &.active {
        color: var(--dark);
      }
    }
    .auto-refresh-note {
      text-align: center;
      font-size: 0.8rem;
      color: var(--muted);
      margin: 0 0 20px;
    }
    .result-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      padding-top: 12px;
      border-top: 1px solid var(--border);
      h3 { margin: 0 0 12px; font-size: 1.05rem; color: var(--dark); }
    }
    @media (min-width: 680px) {
      .result-grid { grid-template-columns: 1fr 1fr; }
    }
    .items-list, .history-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .items-list li {
      display: flex;
      justify-content: space-between;
      padding-bottom: 8px;
      border-bottom: 1px dashed var(--border);
      font-size: 0.92rem;
      small { color: var(--muted); }
    }
    .history-list li {
      background: var(--bg);
      padding: 8px 12px;
      border-radius: 8px;
      border-right: 3px solid var(--primary);
      .hist-status { font-weight: 800; font-size: 0.9rem; color: var(--dark); }
      .hist-time { font-size: 0.78rem; color: var(--muted); }
      .hist-note { font-size: 0.82rem; color: var(--text); margin-top: 2px; }
    }
  `],
})
export class TrackOrderComponent {
  readonly cart = inject(CartService);
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal<boolean>(false);
  readonly errorMsg = signal<string | null>(null);
  readonly tracking = signal<OrderTracking | null>(null);

  private timerId: ReturnType<typeof setInterval> | null = null;

  readonly form = this.fb.nonNullable.group({
    orderNumber: ['', [Validators.required]],
    phone: ['', [Validators.required]],
  });

  readonly steps = computed<StepDef[]>(() => {
    const t = this.tracking();
    const fourth: StepDef =
      t?.orderType === 'Pickup'
        ? { status: 'ReadyForPickup', label: 'جاهز للاستلام' }
        : { status: 'OutForDelivery', label: 'في الطريق إليك' };

    return [
      { status: 'New', label: 'طلب جديد' },
      { status: 'Confirmed', label: 'تم التأكيد' },
      { status: 'Preparing', label: 'جاري التحضير' },
      fourth,
      { status: 'Delivered', label: 'تم التسليم' },
    ];
  });

  readonly currentStepIndex = computed(() => {
    const t = this.tracking();
    if (!t) {
      return -1;
    }
    return this.steps().findIndex((s) => s.status === t.status);
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.stopPolling());

    const qp = this.route.snapshot.queryParamMap;
    const orderNumber = qp.get('orderNumber');
    const phone = qp.get('phone');
    if (orderNumber && phone) {
      this.form.patchValue({ orderNumber, phone });
      this.search();
    }
  }

  selectRecent(ref: RecentOrderRef): void {
    this.form.patchValue({ orderNumber: ref.orderNumber, phone: ref.phone });
    this.search();
  }

  search(): void {
    if (this.form.invalid) {
      this.errorMsg.set('يرجى إدخال رقم الطلب ورقم الموبايل.');
      return;
    }
    const { orderNumber, phone } = this.form.getRawValue();
    this.fetch(orderNumber, phone, true);
  }

  statusLabel(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      New: 'طلب جديد',
      Confirmed: 'تم تأكيد الطلب',
      Preparing: 'جاري التحضير في المطبخ',
      ReadyForPickup: 'جاهز للاستلام من المطعم',
      OutForDelivery: 'خرج مع الطيار للتوصيل',
      Delivered: 'تم التسليم',
      Cancelled: 'تم إلغاء الطلب',
    };
    return map[status] ?? status;
  }

  private fetch(orderNumber: string, phone: string, showSpinner: boolean): void {
    if (showSpinner) {
      this.loading.set(true);
      this.errorMsg.set(null);
    }

    this.api.trackOrder(orderNumber, phone).subscribe({
      next: (data) => {
        this.tracking.set(data);
        this.loading.set(false);
        this.errorMsg.set(null);

        if (data.status === 'Delivered' || data.status === 'Cancelled') {
          this.stopPolling();
        } else {
          this.startPolling(orderNumber, phone);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.tracking.set(null);
        this.stopPolling();
        this.errorMsg.set(this.api.extractErrorMessages(err)[0] ?? 'لم يتم العثور على الطلب.');
      },
    });
  }

  private startPolling(orderNumber: string, phone: string): void {
    if (this.timerId !== null) {
      return;
    }
    this.timerId = setInterval(() => {
      this.fetch(orderNumber, phone, false);
    }, 15000);
  }

  private stopPolling(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}

import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Order } from '../../core/models/api.models';
import { ToastService } from '../../core/services/toast.service';
import { CairoDatePipe } from '../../shared/pipes/cairo-date.pipe';
import { EgpPipe } from '../../shared/pipes/egp.pipe';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [RouterLink, EgpPipe, CairoDatePipe],
  template: `
    <div class="container success-page">
      <div class="card success-card">
        <div class="check-circle">✓</div>
        <h1>تم استلام طلبك بنجاح!</h1>
        <p class="lead">شكراً لطلبك من مطعم باب الحارة، بدأ فريقنا في مراجعة طلبك.</p>

        <div class="order-num-box">
          <span>رقم الطلب</span>
          <strong>{{ orderNumber() }}</strong>
          <button type="button" class="btn btn-ghost copy-btn" (click)="copyOrderNumber()">نسخ الرقم</button>
        </div>

        @if (whatsappUrl()) {
          <div class="wa-box">
            <p>أرسل تفاصيل طلبك مباشرة على واتساب المطعم لتأكيده فوراً:</p>
            <a [href]="whatsappUrl()!" target="_blank" rel="noopener" class="btn btn-whatsapp">
              فتح واتساب وإرسال الطلب
            </a>
          </div>
        }

        @if (order(); as o) {
          <div class="details-box">
            <div class="meta-row">
              <span>العميل: <strong>{{ o.customerName }}</strong></span>
              <span>الوقت: <strong>{{ o.createdAt | cairoDate:'time' }}</strong></span>
              <span>الإجمالي: <strong>{{ o.total | egp }}</strong></span>
            </div>
            <ul>
              @for (item of o.items; track item.id) {
                <li>
                  <span>{{ item.quantity }}× {{ item.itemNameAr }} {{ item.variantNameAr ? '(' + item.variantNameAr + ')' : '' }}</span>
                  <strong>{{ item.lineTotal | egp }}</strong>
                </li>
              }
            </ul>
          </div>
        }

        <div class="actions">
          <a
            routerLink="/track"
            [queryParams]="{ orderNumber: orderNumber(), phone: order()?.customerPhone }"
            class="btn btn-primary"
          >
            تتبع حالة الطلب
          </a>
          <a routerLink="/menu" class="btn btn-outline">العودة للمنيو</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .success-page {
      padding-block: 36px 56px;
      display: flex;
      justify-content: center;
    }
    .success-card {
      max-width: 620px;
      width: 100%;
      padding: 32px 24px;
      text-align: center;
    }
    .check-circle {
      width: 68px;
      height: 68px;
      margin: 0 auto 14px;
      border-radius: 50%;
      background: var(--open-bg);
      color: var(--open);
      font-size: 2rem;
      font-weight: 900;
      display: grid;
      place-items: center;
    }
    h1 { margin: 0 0 6px; font-size: 1.6rem; color: var(--dark); }
    .lead { margin: 0 0 22px; color: var(--muted); }
    .order-num-box {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: var(--cream);
      border: 1.5px dashed var(--gold);
      padding: 12px 20px;
      border-radius: var(--radius-md);
      margin-bottom: 20px;
      span { color: var(--muted); font-weight: 700; }
      strong { font-size: 1.35rem; color: var(--primary-dark); letter-spacing: 0.5px; }
      .copy-btn { padding: 4px 10px; font-size: 0.8rem; }
    }
    .wa-box {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: var(--radius-sm);
      padding: 14px;
      margin-bottom: 20px;
      p { margin: 0 0 10px; font-weight: 700; color: #065f46; font-size: 0.92rem; }
    }
    .details-box {
      text-align: right;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 14px;
      margin-bottom: 22px;
      .meta-row {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        justify-content: space-between;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--border);
        margin-bottom: 10px;
        font-size: 0.9rem;
      }
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
        li {
          display: flex;
          justify-content: space-between;
          font-size: 0.92rem;
        }
      }
    }
    .actions {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 10px;
    }
  `],
})
export class OrderSuccessComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly orderNumber = signal<string>(this.route.snapshot.paramMap.get('orderNumber') ?? '');
  readonly order = signal<Order | null>(null);
  readonly whatsappUrl = signal<string | null>(null);

  constructor() {
    const nav = this.router.currentNavigation();
    const state = (nav?.extras.state ?? window.history.state) as
      | { order?: Order; whatsappUrl?: string | null }
      | undefined;

    if (state?.order) {
      this.order.set(state.order);
    }
    if (state?.whatsappUrl) {
      this.whatsappUrl.set(state.whatsappUrl);
    }
  }

  copyOrderNumber(): void {
    const num = this.orderNumber();
    if (num && navigator.clipboard) {
      navigator.clipboard.writeText(num).then(() => {
        this.toast.show('تم نسخ رقم الطلب');
      });
    }
  }
}

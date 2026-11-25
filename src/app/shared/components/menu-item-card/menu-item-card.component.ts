import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuItem, Variant } from '../../../core/models/api.models';
import { ApiService } from '../../../core/services/api.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { EgpPipe } from '../../pipes/egp.pipe';

@Component({
  selector: 'app-menu-item-card',
  standalone: true,
  imports: [FormsModule, EgpPipe],
  template: `
    <article class="item-card card">
      <div class="item-media">
        <img
          [src]="api.resolveImageUrl(item().imageUrl, fallbackImage())"
          [alt]="item().nameAr"
          loading="lazy"
        />
        @if (item().isFeatured) {
          <span class="featured-ribbon">الأكثر طلباً ★</span>
        }
      </div>

      <div class="item-body">
        <div class="item-head">
          <h4>{{ item().nameAr }}</h4>
          @if (selectedVariant(); as v) {
            <span class="price-tag">{{ v.price | egp }}</span>
          }
        </div>

        @if (item().descriptionAr) {
          <p class="item-desc">{{ item().descriptionAr }}</p>
        }

        @if (item().variants.length > 1) {
          <div class="variants-row" role="radiogroup" aria-label="اختر الحجم أو النوع">
            @for (v of item().variants; track v.id) {
              <button
                type="button"
                class="variant-chip"
                [class.active]="selectedVariant()?.id === v.id"
                (click)="selectVariant(v.id)"
              >
                <span>{{ v.nameAr || 'عادي' }}</span>
                <small>{{ v.price | egp }}</small>
              </button>
            }
          </div>
        } @else if (selectedVariant()?.nameAr) {
          <div class="single-variant">الحجم: {{ selectedVariant()?.nameAr }}</div>
        }

        @if (showNoteInput()) {
          <input
            type="text"
            class="note-input"
            maxlength="200"
            [(ngModel)]="itemNote"
            placeholder="ملاحظة للمطبخ (مثال: بدون مخلل / تومية زيادة)"
          />
        }

        <div class="item-footer">
          <div class="qty-box">
            <button type="button" (click)="incQty()" aria-label="زيادة">+</button>
            <span>{{ qty() }}</span>
            <button type="button" (click)="decQty()" aria-label="إنقاص">−</button>
          </div>

          <button
            type="button"
            class="note-toggle"
            (click)="showNoteInput.set(!showNoteInput())"
            title="إضافة ملاحظة"
          >
            {{ showNoteInput() ? 'إخفاء الملاحظة' : '+ ملاحظة' }}
          </button>

          <button
            type="button"
            class="btn btn-primary add-btn"
            [disabled]="!selectedVariant() || selectedVariant()?.price === null"
            (click)="addToCart()"
          >
            أضف للسلة
          </button>
        </div>
      </div>
    </article>
  `,
  styles: [`
    .item-card {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: transform 0.18s ease, box-shadow 0.18s ease;
      height: 100%;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
    }
    .item-media {
      position: relative;
      height: 156px;
      background: var(--cream);
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    .featured-ribbon {
      position: absolute;
      top: 10px;
      right: 10px;
      background: var(--gold);
      color: var(--dark);
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 800;
      box-shadow: var(--shadow-sm);
    }
    .item-body {
      padding: 14px;
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 10px;
    }
    .item-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 10px;

      h4 {
        margin: 0;
        font-size: 1.03rem;
        font-weight: 800;
        color: var(--dark);
      }
    }
    .price-tag {
      font-weight: 800;
      color: var(--primary);
      background: var(--cream);
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 0.9rem;
      white-space: nowrap;
    }
    .item-desc {
      margin: 0;
      color: var(--muted);
      font-size: 0.86rem;
      line-height: 1.45;
    }
    .variants-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .variant-chip {
      border: 1.5px solid var(--border);
      background: var(--bg);
      color: var(--text);
      padding: 4px 10px;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.82rem;
      font-weight: 700;

      small { color: var(--primary); font-weight: 800; }

      &.active {
        border-color: var(--primary);
        background: var(--primary);
        color: #fff;
        small { color: var(--gold-soft); }
      }
    }
    .single-variant {
      font-size: 0.82rem;
      color: var(--muted);
      font-weight: 600;
    }
    .note-input {
      width: 100%;
      padding: 7px 10px;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 0.84rem;
      background: var(--bg);
    }
    .item-footer {
      margin-top: auto;
      padding-top: 6px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .qty-box {
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--border);
      background: var(--bg);
      border-radius: 8px;

      button {
        width: 28px;
        height: 32px;
        border: none;
        background: transparent;
        font-weight: 800;
        cursor: pointer;
        color: var(--dark);
      }
      span {
        min-width: 22px;
        text-align: center;
        font-weight: 700;
        font-size: 0.9rem;
      }
    }
    .note-toggle {
      border: none;
      background: transparent;
      color: var(--muted);
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      padding: 4px;
    }
    .add-btn {
      margin-inline-start: auto;
      padding: 8px 14px;
      font-size: 0.88rem;
    }
  `],
})
export class MenuItemCardComponent {
  readonly item = input.required<MenuItem>();
  readonly fallbackImage = input<string | null>(null);

  readonly api = inject(ApiService);
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);

  private readonly selectedId = signal<number | null>(null);
  readonly qty = signal<number>(1);
  readonly showNoteInput = signal<boolean>(false);
  itemNote = '';

  readonly selectedVariant = computed<Variant | null>(() => {
    const variants = this.item().variants;
    if (!variants.length) {
      return null;
    }
    const id = this.selectedId();
    return variants.find((v) => v.id === id) ?? variants[0];
  });

  constructor() {
    effect(() => {
      const variants = this.item().variants;
      if (variants.length && this.selectedId() === null) {
        this.selectedId.set(variants[0].id);
      }
    });
  }

  selectVariant(id: number): void {
    this.selectedId.set(id);
  }

  incQty(): void {
    this.qty.update((q) => Math.min(50, q + 1));
  }

  decQty(): void {
    this.qty.update((q) => Math.max(1, q - 1));
  }

  addToCart(): void {
    const variant = this.selectedVariant();
    if (!variant) {
      return;
    }
    this.cart.addItem(this.item(), variant, this.qty(), this.itemNote, this.fallbackImage());
    const label = variant.nameAr ? `${this.item().nameAr} (${variant.nameAr})` : this.item().nameAr;
    this.toast.show(`تمت إضافة ${label} إلى السلة`);
    this.qty.set(1);
    this.itemNote = '';
    this.showNoteInput.set(false);
  }
}

import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { RestaurantStoreService } from '../../core/services/restaurant-store.service';
import { MenuItemCardComponent } from '../../shared/components/menu-item-card/menu-item-card.component';
import { EgpPipe } from '../../shared/pipes/egp.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MenuItemCardComponent, EgpPipe],
  template: `
    @if (store.loading()) {
      <div class="container section-space">
        <div class="skeleton" style="height: 360px; border-radius: 24px; margin-bottom: 24px;"></div>
        <div class="skeleton-grid">
          <div class="skeleton" style="height: 260px;"></div>
          <div class="skeleton" style="height: 260px;"></div>
          <div class="skeleton" style="height: 260px;"></div>
        </div>
      </div>
    } @else if (store.error()) {
      <div class="container section-space">
        <div class="card error-box">
          <h3>تعذر تحميل بيانات المطعم</h3>
          <p>{{ store.error() }}</p>
          <button type="button" class="btn btn-primary" (click)="store.loadAll()">إعادة المحاولة</button>
        </div>
      </div>
    } @else if (store.restaurant(); as rest) {
      <section class="hero">
        <img
          class="hero-bg"
          [src]="api.resolveImageUrl(rest.coverUrl)"
          [alt]="rest.nameAr"
        />
        <div class="hero-overlay"></div>
        <div class="container hero-content">
          <div class="hero-brand">
            <img [src]="api.resolveImageUrl(rest.logoUrl)" [alt]="rest.nameAr" class="hero-logo" />
            <div>
              <div class="hero-badges">
                <span class="badge" [class.badge-open]="rest.isOpenNow" [class.badge-closed]="!rest.isOpenNow">
                  <span class="dot">●</span>
                  {{ rest.isOpenNow ? 'مفتوح الآن' : 'مغلق الآن' }}
                </span>
                @if (store.todayOpeningHour(); as hrs) {
                  <span class="badge badge-gold">اليوم: {{ hrs.open }} – {{ hrs.close }}</span>
                }
                <span class="badge badge-gold">توصيل {{ rest.deliveryFee | egp }}</span>
              </div>
              <h1>{{ rest.nameAr }}</h1>
              <p class="hero-tagline">{{ rest.taglineAr }}</p>
            </div>
          </div>

          <p class="hero-desc">{{ rest.descriptionAr }}</p>

          @if (!rest.acceptingOrders) {
            <div class="alert alert-warning" style="max-width: 600px;">
              استقبال الطلبات أونلاين متوقف مؤقتاً. يمكنك تصفح المنيو أو الاتصال مباشرة على الأرقام بالأسفل.
            </div>
          }

          <div class="hero-actions">
            <a routerLink="/menu" class="btn btn-gold hero-cta">اطلب أونلاين الآن</a>
            <a
              [href]="'https://wa.me/' + rest.whatsappNumber"
              target="_blank"
              rel="noopener"
              class="btn btn-whatsapp"
            >
              تواصل واتساب
            </a>
            @for (phone of rest.phones; track phone) {
              <a [href]="'tel:' + phone" class="btn btn-phone">
                اتصل: {{ phone }}
              </a>
            }
          </div>
        </div>
      </section>

      @if (store.offers().length > 0) {
        <section class="container section-space">
          <h2 class="section-title">عروض باب الحارة</h2>
          <div class="syrian-divider"><span>✦</span></div>
          <div class="offers-grid">
            @for (offer of store.offers(); track offer.id) {
              <a routerLink="/menu" class="offer-card card">
                @if (offer.imageUrl) {
                  <img [src]="api.resolveImageUrl(offer.imageUrl)" [alt]="offer.titleAr" />
                }
                <div class="offer-body">
                  <span class="badge badge-gold">عرض متاح</span>
                  <h3>{{ offer.titleAr }}</h3>
                  <p>{{ offer.descriptionAr }}</p>
                </div>
              </a>
            }
          </div>
        </section>
      }

      @if (store.menu().length > 0) {
        <section class="container section-space">
          <h2 class="section-title">أقسام المنيو</h2>
          <div class="syrian-divider"><span>✦</span></div>
          <div class="categories-strip">
            @for (cat of store.menu(); track cat.id) {
              <a routerLink="/menu" [fragment]="'cat-' + cat.slug" class="cat-pill card">
                <img [src]="api.resolveImageUrl(cat.imageUrl)" [alt]="cat.nameAr" />
                <div>
                  <strong>{{ cat.nameAr }}</strong>
                  <small>{{ cat.items.length }} صنف</small>
                </div>
              </a>
            }
          </div>
        </section>
      }

      @if (store.featuredItems().length > 0) {
        <section class="container section-space">
          <h2 class="section-title">الأكثر طلباً واختياراتنا</h2>
          <div class="syrian-divider"><span>✦</span></div>
          <div class="featured-grid">
            @for (entry of store.featuredItems(); track entry.item.id) {
              <app-menu-item-card
                [item]="entry.item"
                [fallbackImage]="entry.categoryImage ?? null"
              />
            }
          </div>
          <div class="center-cta">
            <a routerLink="/menu" class="btn btn-primary">عرض المنيو بالكامل</a>
          </div>
        </section>
      }

      <section class="trust-band">
        <div class="container trust-grid">
          <div class="trust-item">
            <span class="trust-value">{{ rest.ratings.google.score }} ★</span>
            <span class="trust-label">تقييم Google ({{ rest.ratings.google.count }} مراجعة)</span>
          </div>
          <div class="trust-item">
            <span class="trust-value">{{ rest.ratings.facebook.recommendPercent }}%</span>
            <span class="trust-label">نسبة التوصية على فيسبوك</span>
          </div>
          <div class="trust-item">
            <span class="trust-value">{{ rest.deliveryFee | egp }}</span>
            <span class="trust-label">توصيل سريع داخل سنورس</span>
          </div>
          <div class="trust-item">
            <span class="trust-value">كاش</span>
            <span class="trust-label">الدفع عند الاستلام أو بالفرع</span>
          </div>
        </div>
      </section>
    }
  `,
  styles: [`
    .section-space {
      padding-block: 36px;
    }
    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 16px;
    }
    .error-box {
      padding: 36px;
      text-align: center;
      p { color: var(--muted); margin-bottom: 16px; }
    }
    .hero {
      position: relative;
      min-height: 410px;
      display: flex;
      align-items: center;
      color: #fff;
      overflow: hidden;
      background: var(--dark);
    }
    .hero-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.35;
    }
    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(120deg, rgba(43, 29, 20, 0.94) 15%, rgba(139, 90, 43, 0.72) 100%);
    }
    .hero-content {
      position: relative;
      z-index: 2;
      padding-block: 44px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .hero-brand {
      display: flex;
      align-items: center;
      gap: 18px;
      flex-wrap: wrap;
      h1 {
        margin: 6px 0 0;
        font-size: clamp(2rem, 4vw, 3rem);
        font-weight: 900;
        color: #fff;
        line-height: 1.15;
      }
    }
    .hero-logo {
      width: 88px;
      height: 88px;
      border-radius: 50%;
      border: 3px solid var(--gold);
      object-fit: cover;
      box-shadow: var(--shadow-md);
      background: var(--dark);
    }
    .hero-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      .dot { font-size: 0.65rem; }
    }
    .hero-tagline {
      margin: 2px 0 0;
      color: var(--gold-soft);
      font-size: 1.15rem;
      font-weight: 700;
    }
    .hero-desc {
      margin: 0;
      max-width: 660px;
      font-size: 1.02rem;
      color: var(--cream);
    }
    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .hero-cta {
      padding: 12px 26px;
      font-size: 1rem;
    }
    .btn-phone {
      background: rgba(255, 255, 255, 0.14);
      border: 1px solid rgba(255, 255, 255, 0.35);
      color: #fff;
      &:hover { background: rgba(255, 255, 255, 0.24); }
    }
    .offers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
      gap: 18px;
    }
    .offer-card {
      display: flex;
      overflow: hidden;
      transition: transform 0.18s ease;
      &:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
      img {
        width: 130px;
        object-fit: cover;
        flex-shrink: 0;
        background: var(--cream);
      }
      .offer-body {
        padding: 16px;
        h3 { margin: 8px 0 4px; color: var(--dark); font-size: 1.1rem; }
        p { margin: 0; color: var(--muted); font-size: 0.9rem; }
      }
    }
    .categories-strip {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
    }
    .cat-pill {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px;
      transition: border-color 0.15s ease, transform 0.15s ease;
      &:hover {
        border-color: var(--primary);
        transform: translateY(-2px);
      }
      img {
        width: 52px;
        height: 52px;
        border-radius: 10px;
        object-fit: cover;
        background: var(--cream);
      }
      strong { display: block; color: var(--dark); font-size: 0.96rem; }
      small { color: var(--muted); font-weight: 600; }
    }
    .featured-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(265px, 1fr));
      gap: 18px;
    }
    .center-cta {
      margin-top: 26px;
      text-align: center;
    }
    .trust-band {
      background: var(--dark);
      color: var(--cream);
      padding-block: 28px;
      border-top: 3px solid var(--gold);
    }
    .trust-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      text-align: center;
    }
    .trust-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .trust-value {
      font-size: 1.5rem;
      font-weight: 900;
      color: var(--gold);
    }
    .trust-label {
      font-size: 0.88rem;
      color: var(--cream);
    }
  `],
})
export class HomeComponent {
  readonly store = inject(RestaurantStoreService);
  readonly api = inject(ApiService);
}

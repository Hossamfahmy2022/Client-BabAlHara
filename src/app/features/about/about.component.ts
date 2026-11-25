import { Component, computed, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';
import { RestaurantStoreService } from '../../core/services/restaurant-store.service';
import { EgpPipe } from '../../shared/pipes/egp.pipe';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [EgpPipe],
  template: `
    <div class="container about-page">
      @if (store.loading()) {
        <div class="skeleton" style="height: 340px;"></div>
      } @else if (store.restaurant(); as rest) {
        <div class="about-header">
          <img [src]="api.resolveImageUrl(rest.logoUrl)" [alt]="rest.nameAr" class="about-logo" />
          <div>
            <h1>{{ rest.nameAr }} — {{ rest.nameEn }}</h1>
            <p class="tagline">{{ rest.taglineAr }} · {{ rest.descriptionAr }}</p>
            <div class="badges">
              <span class="badge" [class.badge-open]="rest.isOpenNow" [class.badge-closed]="!rest.isOpenNow">
                {{ rest.isOpenNow ? 'مفتوح الآن' : 'مغلق الآن' }}
              </span>
              <span class="badge badge-gold">Google {{ rest.ratings.google.score }} ★ ({{ rest.ratings.google.count }})</span>
              <span class="badge badge-gold">توصية فيسبوك {{ rest.ratings.facebook.recommendPercent }}%</span>
            </div>
          </div>
        </div>

        <div class="about-grid">
          <div class="card info-card">
            <h2>العنوان والتواصل</h2>
            <p class="address">{{ rest.addressAr }}</p>
            <p class="plus-code">Plus Code: <strong dir="ltr">{{ rest.plusCode }}</strong></p>

            <div class="info-list">
              <div>
                <strong>أرقام الطلبات والتوصيل:</strong>
                <div class="links-wrap">
                  @for (p of rest.phones; track p) {
                    <a [href]="'tel:' + p" class="btn btn-outline">{{ p }}</a>
                  }
                  <a
                    [href]="'https://wa.me/' + rest.whatsappNumber"
                    target="_blank"
                    rel="noopener"
                    class="btn btn-whatsapp"
                  >
                    واتساب
                  </a>
                </div>
              </div>

              @if (rest.complaintsPhone) {
                <div>
                  <strong>الشكاوى والاقتراحات:</strong>
                  <a [href]="'tel:' + rest.complaintsPhone" class="plain-link">{{ rest.complaintsPhone }}</a>
                </div>
              }

              <div>
                <strong>رسوم التوصيل داخل سنورس:</strong>
                <span>{{ rest.deliveryFee | egp }}</span>
              </div>

              <div>
                <strong>طرق الدفع والخدمات:</strong>
                <span>كاش عند الاستلام · توصيل · تيك أواي · صالة</span>
              </div>

              <div>
                <strong>صفحة فيسبوك الرسمية:</strong>
                <a [href]="rest.facebookUrl" target="_blank" rel="noopener" class="plain-link">
                  facebook.com/baballhara
                </a>
              </div>
            </div>
          </div>

          <div class="card hours-card">
            <h2>مواعيد العمل الأسبوعية (توقيت القاهرة)</h2>
            <table class="hours-table">
              <tbody>
                @for (h of rest.openingHours; track h.dayOfWeek) {
                  <tr [class.today]="store.todayOpeningHour()?.dayOfWeek === h.dayOfWeek">
                    <td>
                      {{ h.dayAr }}
                      @if (store.todayOpeningHour()?.dayOfWeek === h.dayOfWeek) {
                        <span class="today-tag">اليوم</span>
                      }
                    </td>
                    <td dir="ltr">{{ h.open }} – {{ h.close }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <div class="card map-card">
          <div class="map-head">
            <h2>موقعنا على الخريطة</h2>
            <a [href]="rest.googleMapsUrl" target="_blank" rel="noopener" class="btn btn-primary">
              فتح الاتجاهات في خرائط Google
            </a>
          </div>
          @if (mapEmbedUrl(); as safeUrl) {
            <iframe
              [src]="safeUrl"
              title="موقع مطعم باب الحارة سنورس"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .about-page {
      padding-block: 28px 56px;
    }
    .about-header {
      display: flex;
      align-items: center;
      gap: 18px;
      flex-wrap: wrap;
      margin-bottom: 24px;
      h1 { margin: 0 0 6px; font-size: 1.65rem; color: var(--dark); }
      .tagline { margin: 0 0 10px; color: var(--muted); }
      .badges { display: flex; flex-wrap: wrap; gap: 8px; }
    }
    .about-logo {
      width: 84px;
      height: 84px;
      border-radius: 50%;
      border: 3px solid var(--gold);
      object-fit: cover;
    }
    .about-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    @media (min-width: 840px) {
      .about-grid { grid-template-columns: 1.2fr 0.9fr; }
    }
    .info-card, .hours-card, .map-card {
      padding: 22px;
      h2 { margin: 0 0 14px; font-size: 1.2rem; color: var(--dark); }
    }
    .address { font-weight: 700; font-size: 1.02rem; margin: 0 0 4px; color: var(--dark); }
    .plus-code { margin: 0 0 16px; color: var(--muted); font-size: 0.88rem; }
    .info-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
      strong { display: block; margin-bottom: 4px; color: var(--dark); font-size: 0.92rem; }
    }
    .links-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
    .plain-link { color: var(--primary); font-weight: 700; text-decoration: underline; }
    .hours-table {
      width: 100%;
      border-collapse: collapse;
      tr {
        border-bottom: 1px solid var(--border);
        &.today {
          background: var(--cream);
          font-weight: 800;
        }
      }
      td {
        padding: 10px 8px;
        font-size: 0.94rem;
      }
      td:last-child { text-align: left; }
    }
    .today-tag {
      background: var(--primary);
      color: #fff;
      font-size: 0.72rem;
      padding: 2px 8px;
      border-radius: 999px;
      margin-inline-start: 6px;
    }
    .map-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 14px;
      h2 { margin: 0; }
    }
    iframe {
      width: 100%;
      height: 360px;
      border: 0;
      border-radius: var(--radius-sm);
    }
  `],
})
export class AboutComponent {
  readonly store = inject(RestaurantStoreService);
  readonly api = inject(ApiService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly mapEmbedUrl = computed<SafeResourceUrl | null>(() => {
    const rest = this.store.restaurant();
    if (!rest) {
      return null;
    }
    const url = `https://maps.google.com/maps?q=${rest.latitude},${rest.longitude}&z=16&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });
}

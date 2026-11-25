import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { RestaurantStoreService } from '../../core/services/restaurant-store.service';
import { MenuItemCardComponent } from '../../shared/components/menu-item-card/menu-item-card.component';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [FormsModule, MenuItemCardComponent],
  template: `
    <div class="menu-page">
      <div class="menu-toolbar">
        <div class="container toolbar-inner">
          <div class="search-row">
            <input
              type="search"
              [ngModel]="searchTerm()"
              (ngModelChange)="searchTerm.set($event)"
              placeholder="ابحث في المنيو (بيتزا، كريب، بوكس، طاسة...)"
              class="search-input"
            />
            @if (store.restaurant()?.menuImageUrl) {
              <button type="button" class="btn btn-outline" (click)="showOfficialMenu.set(true)">
                صورة المنيو الرسمي
              </button>
            }
          </div>

          @if (filteredCategories().length > 0) {
            <nav class="cat-tabs" aria-label="أقسام المنيو">
              @for (cat of filteredCategories(); track cat.id) {
                <button
                  type="button"
                  class="cat-tab"
                  [class.active]="activeSlug() === cat.slug"
                  (click)="scrollToCategory(cat.slug)"
                >
                  {{ cat.nameAr }}
                </button>
              }
            </nav>
          }
        </div>
      </div>

      <div class="container menu-content">
        @if (store.loading()) {
          <div class="skeleton-grid">
            @for (i of [1, 2, 3, 4, 5, 6]; track i) {
              <div class="skeleton" style="height: 280px;"></div>
            }
          </div>
        } @else if (store.error()) {
          <div class="card error-box">
            <h3>تعذر تحميل المنيو</h3>
            <p>{{ store.error() }}</p>
            <button type="button" class="btn btn-primary" (click)="store.loadAll()">إعادة المحاولة</button>
          </div>
        } @else if (filteredCategories().length === 0) {
          <div class="card empty-box">
            <p>لا توجد أصناف مطابقة لبحثك "{{ searchTerm() }}"</p>
            <button type="button" class="btn btn-ghost" (click)="searchTerm.set('')">عرض كل المنيو</button>
          </div>
        } @else {
          @for (cat of filteredCategories(); track cat.id) {
            <section [id]="'cat-' + cat.slug" class="cat-section">
              <div class="cat-header">
                <div>
                  <h2>{{ cat.nameAr }}</h2>
                  @if (cat.nameEn) {
                    <span class="cat-en">{{ cat.nameEn }}</span>
                  }
                </div>
                <span class="badge badge-gold">{{ cat.items.length }} صنف</span>
              </div>

              <div class="items-grid">
                @for (item of cat.items; track item.id) {
                  <app-menu-item-card
                    [item]="item"
                    [fallbackImage]="cat.imageUrl ?? null"
                  />
                }
              </div>
            </section>
          }
        }
      </div>
    </div>

    @if (showOfficialMenu() && store.restaurant()?.menuImageUrl; as imgPath) {
      <div class="modal-backdrop" (click)="showOfficialMenu.set(false)">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-head">
            <h3>منيو باب الحارة الرسمي (مارس 2026)</h3>
            <button type="button" class="close-btn" (click)="showOfficialMenu.set(false)">✕</button>
          </div>
          <div class="modal-img-wrap">
            <img [src]="api.resolveImageUrl(imgPath)" alt="صورة منيو باب الحارة الرسمي" />
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .menu-toolbar {
      position: sticky;
      top: 64px;
      z-index: 40;
      background: rgba(253, 249, 242, 0.96);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--border);
      padding-block: 12px;
    }
    .toolbar-inner {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .search-row {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .search-input {
      flex: 1;
      min-width: 220px;
      padding: 10px 14px;
      border-radius: var(--radius-sm);
      border: 1.5px solid var(--border);
      background: #fff;
      font-size: 0.95rem;
      &:focus {
        outline: none;
        border-color: var(--primary);
      }
    }
    .cat-tabs {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
      scrollbar-width: thin;
    }
    .cat-tab {
      border: 1px solid var(--border);
      background: #fff;
      color: var(--text);
      padding: 6px 14px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 0.86rem;
      white-space: nowrap;
      cursor: pointer;
      transition: background-color 0.15s ease, color 0.15s ease;

      &.active, &:hover {
        background: var(--primary);
        border-color: var(--primary);
        color: #fff;
      }
    }
    .menu-content {
      padding-block: 24px 48px;
    }
    .cat-section {
      margin-bottom: 36px;
      scroll-margin-top: 175px;
    }
    .cat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid var(--gold-soft);
      padding-bottom: 8px;
      margin-bottom: 16px;
      h2 { margin: 0; font-size: 1.4rem; font-weight: 800; color: var(--dark); }
      .cat-en { font-size: 0.82rem; color: var(--muted); font-weight: 600; }
    }
    .items-grid, .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(265px, 1fr));
      gap: 18px;
    }
    .error-box, .empty-box {
      padding: 40px 24px;
      text-align: center;
      p { color: var(--muted); margin-bottom: 16px; }
    }
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(20, 12, 8, 0.78);
      z-index: 120;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .modal-box {
      background: #fff;
      border-radius: var(--radius-md);
      max-width: 960px;
      width: 100%;
      max-height: 92vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .modal-head {
      padding: 12px 18px;
      background: var(--dark);
      color: var(--cream);
      display: flex;
      align-items: center;
      justify-content: space-between;
      h3 { margin: 0; font-size: 1rem; }
      .close-btn {
        background: rgba(255, 255, 255, 0.14);
        border: none;
        color: #fff;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
      }
    }
    .modal-img-wrap {
      overflow: auto;
      padding: 12px;
      background: #f3ede3;
      img {
        width: 100%;
        height: auto;
        border-radius: 8px;
      }
    }
  `],
})
export class MenuComponent {
  readonly store = inject(RestaurantStoreService);
  readonly api = inject(ApiService);

  readonly searchTerm = signal<string>('');
  readonly activeSlug = signal<string>('');
  readonly showOfficialMenu = signal<boolean>(false);

  readonly filteredCategories = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const cats = this.store.menu();
    if (!term) {
      return cats;
    }

    return cats
      .map((c) => ({
        ...c,
        items: c.items.filter(
          (i) =>
            i.nameAr.toLowerCase().includes(term) ||
            (i.descriptionAr?.toLowerCase().includes(term) ?? false) ||
            c.nameAr.toLowerCase().includes(term),
        ),
      }))
      .filter((c) => c.items.length > 0);
  });

  scrollToCategory(slug: string): void {
    this.activeSlug.set(slug);
    const el = document.getElementById(`cat-${slug}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

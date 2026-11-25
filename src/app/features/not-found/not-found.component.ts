import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container not-found">
      <div class="card nf-card">
        <span>404</span>
        <h1>الصفحة غير موجودة</h1>
        <p>يبدو أن الرابط الذي تحاول زيارته غير متاح.</p>
        <a routerLink="/" class="btn btn-primary">العودة للرئيسية</a>
      </div>
    </div>
  `,
  styles: [`
    .not-found {
      padding-block: 64px;
      display: flex;
      justify-content: center;
    }
    .nf-card {
      padding: 40px 28px;
      max-width: 440px;
      width: 100%;
      text-align: center;
      span { font-size: 3.4rem; font-weight: 900; color: var(--gold); }
      h1 { margin: 4px 0 8px; color: var(--dark); }
      p { color: var(--muted); margin-bottom: 20px; }
    }
  `],
})
export class NotFoundComponent {}

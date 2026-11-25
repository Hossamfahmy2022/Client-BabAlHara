import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ApiService } from './core/services/api.service';
import { CartService } from './core/services/cart.service';
import { RestaurantStoreService } from './core/services/restaurant-store.service';
import { ToastService } from './core/services/toast.service';
import { CartDrawerComponent } from './shared/components/cart-drawer/cart-drawer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CartDrawerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly store = inject(RestaurantStoreService);
  readonly cart = inject(CartService);
  readonly api = inject(ApiService);
  readonly toast = inject(ToastService);
}

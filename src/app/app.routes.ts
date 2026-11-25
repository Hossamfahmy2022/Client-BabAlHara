import { Routes } from '@angular/router';
import { AboutComponent } from './features/about/about.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { HomeComponent } from './features/home/home.component';
import { MenuComponent } from './features/menu/menu.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { OrderSuccessComponent } from './features/order-success/order-success.component';
import { TrackOrderComponent } from './features/track-order/track-order.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'order-success/:orderNumber', component: OrderSuccessComponent },
  { path: 'track', component: TrackOrderComponent },
  { path: 'about', component: AboutComponent },
  { path: '**', component: NotFoundComponent },
];

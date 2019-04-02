import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'home', loadChildren: './home/home.module#HomePageModule' },
  { path: 'history', loadChildren: './history/history.module#HistoryPageModule' },
  { path: 'contact-us', loadChildren: './contact-us/contact-us.module#ContactUsPageModule' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'forgot-password', loadChildren: './forgot-password/forgot-password.module#ForgotPasswordPageModule' },
  { path: 'sign-up', loadChildren: './sign-up/sign-up.module#SignUpPageModule' },
  { path: 'booking', loadChildren: './booking/booking.module#BookingPageModule' },
  { path: 'settings', loadChildren: './settings/settings.module#SettingsPageModule' },
  { path: 'change-password', loadChildren: './change-password/change-password.module#ChangePasswordPageModule' },
  { path: 'opening-time', loadChildren: './opening-time/opening-time.module#OpeningTimePageModule' },
  { path: 'menu', loadChildren: './menu/menu.module#MenuPageModule' },
  { path: 'orders-list', loadChildren: './orders-list/orders-list.module#OrdersListPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

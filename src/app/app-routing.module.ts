import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './shared/auth-guard.service';
import { AnonymousGuardService } from './shared/anonymous-guard.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'booking',
    pathMatch: 'full'
  }, {
    path: 'history',
    loadChildren: () => import('./history/history.module').then( m => m.HistoryPageModule),
    canActivate: [AuthGuardService],
  }, {
    path: 'contact-us',
    loadChildren: () => import('./contact-us/contact-us.module').then( m => m.ContactUsPageModule),
    canActivate: [AuthGuardService],
  }, {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule),
    canActivate: [AnonymousGuardService],
  }, {
    path: 'forgot-password',
    loadChildren: () => import('./forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule),
    canActivate: [AnonymousGuardService],
  }, {
    path: 'sign-up',
    loadChildren: () => import('./sign-up/sign-up.module').then( m => m.SignUpPageModule),
    canActivate: [AnonymousGuardService],
  }, {
    path: 'booking',
    loadChildren: () => import('./booking/booking.module').then( m => m.BookingPageModule),
    canActivate: [AuthGuardService],
  }, {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then( m => m.SettingsPageModule),
    // loadChildren: () => import('./settings-new/settings-new.module').then( m => m.SettingsNewPageModule),
    canActivate: [AuthGuardService],
  }, {
    path: 'change-password',
    loadChildren: () => import('./change-password/change-password.module').then( m => m.ChangePasswordPageModule),
    canActivate: [AuthGuardService],
  }, {
    path: 'menu',
    loadChildren: () => import('./menu/menu.module').then( m => m.MenuPageModule),
    canActivate: [AuthGuardService],
  }, {
    path: 'orders-list',
    loadChildren: () => import('./orders-list/orders-list.module').then( m => m.OrdersListPageModule),
    canActivate: [AuthGuardService],
  }, {
    path: 'order',
    loadChildren: () => import('./order/order.module').then( m => m.OrderPageModule),
    canActivate: [AuthGuardService],
  }, {
    path: 'confirm-sms-phone',
    loadChildren: () => import('./confirm-sms-phone/confirm-sms-phone.module').then( m => m.ConfirmSmsPhonePageModule),
  },
  {
    path: 'select-bt-printer',
    loadChildren: () => import('./select-bt-printer/select-bt-printer.module').then( m => m.SelectBtPrinterPageModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, useHash: true })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}

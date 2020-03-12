import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './shared/auth-guard.service';
import { AnonymousGuardService } from './shared/anonymous-guard.service';

const routes: Routes = [
  { path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  }, { path: 'home',
    loadChildren: './home/home.module#HomePageModule',
    canActivate: [AuthGuardService],
  }, { path: 'history',
    loadChildren: './history/history.module#HistoryPageModule',
    canActivate: [AuthGuardService],
  }, { path: 'contact-us',
    loadChildren: './contact-us/contact-us.module#ContactUsPageModule',
    canActivate: [AuthGuardService],
  }, { path: 'login',
    loadChildren: './login/login.module#LoginPageModule',
    canActivate: [AnonymousGuardService],
  }, { path: 'forgot-password',
    loadChildren: './forgot-password/forgot-password.module#ForgotPasswordPageModule',
    canActivate: [AnonymousGuardService],
  }, { path: 'sign-up',
    loadChildren: './sign-up/sign-up.module#SignUpPageModule',
    canActivate: [AnonymousGuardService],
  }, { path: 'booking',
    loadChildren: './booking/booking.module#BookingPageModule',
    canActivate: [AuthGuardService],
  }, { path: 'settings',
    loadChildren: './settings/settings.module#SettingsPageModule',
    canActivate: [AuthGuardService],
  }, { path: 'change-password',
    loadChildren: './change-password/change-password.module#ChangePasswordPageModule',
    canActivate: [AuthGuardService],
  }, { path: 'opening-time',
    loadChildren: './opening-time/opening-time.module#OpeningTimePageModule',
    canActivate: [AuthGuardService],
  }, { path: 'menu',
    loadChildren: './menu/menu.module#MenuPageModule',
    canActivate: [AuthGuardService],
  }, { path: 'orders-list',
    loadChildren: './orders-list/orders-list.module#OrdersListPageModule',
    canActivate: [AuthGuardService],
  }, {
    path: 'credit-card',
    loadChildren: './credit-card/credit-card.module#CreditCardPageModule',
    canActivate: [AuthGuardService],
  }, { path: 'confirm-sms-phone',
    loadChildren: './confirm-sms-phone/confirm-sms-phone.module#ConfirmSmsPhonePageModule',
  }, {
    path: 'reports',
    loadChildren: './reports/reports.module#ReportsPageModule',
    canActivate: [AuthGuardService],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, useHash: true })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

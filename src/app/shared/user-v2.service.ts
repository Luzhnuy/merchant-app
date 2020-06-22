import { Injectable, NgZone } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { ApiV2Service } from './api-v2.service';
import { UserV2 as User } from './user-v2';
import { StorageVariableV2Service as StorageVariableService } from './storage-variable-v2.service';
import { StorageVariablesV2Enum as StorageVariables } from './storage-variables-v2.enum';
import { Merchant } from './merchant';
import { OneSignalService } from './one-signal.service';

declare var google: any;

@Injectable({
  providedIn: 'root',
})
export class UserServiceV2 {

  readonly merchantRoleName = 'Merchant';

  private $$user: ReplaySubject<User> = new ReplaySubject(1);
  public $user: Observable<User> = this.$$user.asObservable();

  private readonly endpointLogin = 'users/login';
  private readonly endpointUsers = 'users';
  private readonly endpointSignUp = 'merchants/sign-up';
  private readonly endpointConfirmSMS = 'merchants/confirm-sms';
  private readonly endpointResendSMS = 'merchants/resend-sms';

  constructor(
    private ngZone: NgZone,
    private storageVariable: StorageVariableService,
    private apiClient: ApiV2Service,
    private oneSignalService: OneSignalService,
  ) {
    this.init();
  }

  init() {
    this.storageVariable
      .get<User>(StorageVariables.userInfo)
      .subscribe(async (userData) => {
        let user = new User(userData);
        if (user.isLogged()) {
          const oldToken = (user as any).token;
          if (oldToken) {
            this.loginFromOldToken((user as any).token);
            return;
          }
          this.apiClient.setAuth(user.authToken);
          userData = await this.checkAuth().toPromise();
          user = new User(userData);
          if (!user.isLogged()) {
            this.apiClient.clearAuth();
          } else if (!this.oneSignalService.subscribed) {
            await this.oneSignalService
              .subscribe(user.id);
          }
        } else {
          this.apiClient.clearAuth();
        }

        this.$$user.next(user);
      });
  }

  getAll() {
    const subj = new Subject<User[]>();
    this.apiClient.get(
      `${this.endpointUsers}`,
    )
      .subscribe(
        (data: User[]) => {
          subj.next(data);
          subj.complete();
        }, err => {
          subj.error(err);
          subj.complete();
        },
      );
    return subj.asObservable();
  }

  login(username, password): Observable<boolean> {
    const subj = new Subject<boolean>();
    this.apiClient
      .post(
        `${this.endpointLogin}`,
        { username, password },
      )
      .subscribe(
        (data: User) => {
          if (!data.roles.find(role => role.name === this.merchantRoleName)) {
            if (!this.oneSignalService.subscribed) {
              this.oneSignalService
                .subscribe(null);
            }
            subj.error(new Error('User is not a Merchant'));
          } else {
            if (!this.oneSignalService.subscribed) {
              this.oneSignalService
                .subscribe(data.id);
            }
            this.storageVariable.set(StorageVariables.userInfo, data);
            subj.next(true);
          }
          subj.complete();
        }, err => {
          if (!this.oneSignalService.subscribed) {
            this.oneSignalService
              .subscribe(null);
          }
          subj.error(err);
          subj.complete();
        },
      );
    return subj.asObservable();
  }

  getOneTimeAuthToken() {
    const subj = new Subject<string>();
    this.apiClient
      .post(
        `${this.endpointUsers}/one-time-token`,
        {},
      )
      .subscribe(
        ({ sign }) => {
          subj.next(sign);
          subj.complete();
        }, err => {
          subj.error(err);
          subj.complete();
        },
      );
    return subj.asObservable();
  }

  create(merchant: Merchant) {
    const subj = new Subject<{ success: boolean }>();
    this.apiClient.post(
      this.endpointSignUp,
      merchant,
    )
      .subscribe(
        (data: any) => {
          subj.next(data);
          subj.complete();
        }, err => {
          subj.error(err);
          subj.complete();
        },
      );
    return subj.asObservable();
  }

  confirmSms(email, code) {
    const subj = new Subject<User>();
    this.apiClient
      .post(
        this.endpointConfirmSMS,
        { email, code },
      )
      .subscribe(
        (data: User) => {
          if (!data.roles.find(role => role.name === this.merchantRoleName)) {
            subj.error(new Error('User is not Merchant'));
          } else {
            if (!this.oneSignalService.subscribed) {
              this.oneSignalService
                .subscribe(data.id);
            }
            this.storageVariable.set(StorageVariables.userInfo, data);
            subj.next(data);
          }
          subj.complete();
        }, err => {
          subj.error(err);
          subj.complete();
        },
      );
    return subj.asObservable();
  }

  resendSms(email) {
    const subj = new Subject<boolean>();
    this.apiClient
      .post(
        this.endpointResendSMS,
        { email },
      )
      .subscribe(
        () => {
          subj.next(true);
          subj.complete();
        }, err => {
          subj.error(err);
          subj.complete();
        },
      );
    return subj.asObservable();
  }

  update(user: User) {
    const subj = new Subject<User>();
    this.apiClient.put(
      `${this.endpointUsers}/${user.id}`,
      user,
    )
      .subscribe(
        (data: User) => {
          subj.next(data);
          subj.complete();
        }, err => {
          subj.error(err);
          subj.complete();
        },
      );
    return subj.asObservable();
  }

  removeUser(userId) {
    const subj = new Subject<User>();
    this.apiClient.delete(
      `${this.endpointUsers}/${userId}`,
    )
      .subscribe(
        (data: User) => {
          subj.next(data);
          subj.complete();
        }, err => {
          subj.error(err);
          subj.complete();
        },
      );
    return subj.asObservable();
  }

  getSingle(userId) {
    const subj = new Subject<User>();
    this.apiClient.get(
      `${this.endpointUsers}/${userId}`,
    )
      .subscribe(
        (data: User) => {
          subj.next(data);
          subj.complete();
        }, err => {
          subj.error(err);
          subj.complete();
        },
      );
    return subj.asObservable();
  }

  checkAuth() {
    const subj = new Subject<User>();
    this.apiClient.get(
      `${this.endpointUsers}/me`,
    )
      .subscribe(
        (data: User) => {
          subj.next(data);
          subj.complete();
        }, err => {
          subj.error(err);
          subj.complete();
        },
      );
    return subj.asObservable();
  }

  logout() {
    const subj = new Subject<User>();
    this.apiClient.post(
      `${this.endpointUsers}/logout`,
      {},
    )
      .subscribe(
        (data: User) => {
          if (!this.oneSignalService.subscribed) {
            this.oneSignalService
              .subscribe(null);
          }
          subj.next(data);
          subj.complete();
          this.storageVariable.remove(StorageVariables.userInfo);
        }, err => {
          if (!this.oneSignalService.subscribed) {
            this.oneSignalService
              .subscribe(null);
          }
          subj.error(err);
          subj.complete();
          this.storageVariable.remove(StorageVariables.userInfo);
        },
      );
    return subj.asObservable();
  }

  resetPassword(email) {
    const subj = new Subject<User>();
    this.apiClient.post(
      `${this.endpointUsers}/reset-password`,
      { email },
    )
      .subscribe(
        (data: User) => {
          subj.next(data);
          subj.complete();
        }, err => {
          subj.error(err);
          subj.complete();
        },
      );
    return subj.asObservable();
  }

  changePassword(userId, currentPassword, newPassword) {
    const subj = new Subject();
    this.apiClient.post(
      `${this.endpointUsers}/change-password/${userId}`,
      { currentPassword, newPassword },
    )
      .subscribe(
        (data) => {
          subj.next(data);
          subj.complete();
        }, err => {
          subj.error(err);
          subj.complete();
        },
      );
    return subj.asObservable();
  }

  loginFromOldToken(token: string) {
    const subj = new Subject<User>();
    this.apiClient
      .post(
        // `${this.endpoint}/login-from-old-token`,
        `customers/login-from-old-token`, // dirty hack, but it's no matter, because of old version compatibility
        { token },
      )
      .subscribe(
        (data: User) => {
          if (!this.oneSignalService.subscribed) {
            this.oneSignalService
              .subscribe(data.id);
          }
          this.storageVariable.set(StorageVariables.userInfo, data);
          const user = new User(data);
          subj.next(user);
        }, err => {
          subj.error(err);
        }, () => {
          subj.complete();
        },
      );
    return subj.asObservable();
  }
}

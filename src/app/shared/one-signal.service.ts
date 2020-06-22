import { Injectable } from '@angular/core';
import { OneSignal, OSNotification, OSNotificationOpenedResult } from '@ionic-native/onesignal/ngx';
import { from, Subject } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Platform } from '@ionic/angular';

declare var window: any;

@Injectable({
  providedIn: 'root',
})
export class OneSignalService {

  private _$eventsReceivedThread = new Subject<OSNotification>();
  public $eventsReceivedThread = this._$eventsReceivedThread.asObservable();
  private _$eventsOpenedThread = new Subject<OSNotificationOpenedResult>();
  public $eventsOpenedThread = this._$eventsOpenedThread.asObservable();

  public subscribed = false;
  private oneSignalWeb: any;

  private webInited = false;
  private userId: number;

  constructor(
    private oneSignal: OneSignal,
    private platform: Platform,
  ) {}

  init(appId: string, googleProjectNumber: string, safariWebId) {
    if (this.isWeb()) {
      window.OneSignal = window.OneSignal || [];
      window.OneSignal.push(() => {
        this.oneSignalWeb = window.OneSignal;
        this.oneSignalWeb.init({
          appId,
          allowLocalhostAsSecureOrigin: true,
          notificationClickHandlerAction: 'focus',
          // notificationClickHandlerAction: 'navigate',
          notificationClickHandlerMatch: 'origin',
          welcomeNotification: {
            disabled: true,
          },
          safari_web_id: safariWebId,
        });
        this.oneSignalWeb
          .addListenerForNotificationOpened(event => {
            console.log('addListenerForNotificationOpened', event);
            const openEvent: any = {
              notification: {
                isAppInFocus: false,
                payload: {
                  additionalData: event.data,
                }
              },
            };
            this._$eventsOpenedThread.next(openEvent);
          });
        this.oneSignalWeb.on('notificationDisplay', event => {
          console.log('OneSignal notification displayed:', event);
        });
        this.oneSignalWeb.on('notificationDismiss', event => {
          console.log('OneSignal notification displayed:', event);
        });
        if (this.userId) {
          this.webInited = true;
          this.subscribe(this.userId)
        }
      });
    } else {
      this.oneSignal.startInit(appId, googleProjectNumber);
      this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.None);
      this.oneSignal.handleNotificationReceived().subscribe(async (data) => {
        this._$eventsReceivedThread.next(data);
      });
      this.oneSignal.handleNotificationOpened().subscribe((data) => {
        this._$eventsOpenedThread.next(data);
      });
      this.oneSignal.endInit();
    }
  }

  private isWeb() {
    return this.platform.is('desktop') || this.platform.is('mobileweb');
  }

  async subscribe(userId) {
    console.log('subscribe');
    if (this.isWeb() && !this.webInited) {
      this.userId = userId;
      return;
    } else {
      this.userId = null;
    }
    const currentTags: any = {};
    userId = userId.toString();
    currentTags[this.getEnvironmentRelatedTagName('sg_merchants_user_id')] = userId;
    console.log('tags ::', currentTags, this.oneSignalWeb);
    const oneSignal = this.isWeb() ? this.oneSignalWeb : this.oneSignal;
    try {
      const tags = await oneSignal.getTags();
      if (tags) {
        oneSignal.deleteTags(Object.keys(tags));
      }
      if (userId) {
        oneSignal.setSubscription(true);
        oneSignal.sendTags(currentTags);
        this.subscribed = true;
      } else {
        this.subscribed = false;
        oneSignal.setSubscription(false);
      }
    } catch (e) {
      console.error(e);
    }
  }

  getPermission() {
    return from(this.oneSignal.getPermissionSubscriptionState())
      .pipe(
        take(1),
        map(res => {
          return res.permissionStatus.state === 1 || res.permissionStatus.status === 2;
        }),
      );
  }

  private getEnvironmentRelatedTagName(tag) {
    const prefix = environment.production ? 'prod_' : 'dev_';
    return `${prefix}${tag}`;
  }

}

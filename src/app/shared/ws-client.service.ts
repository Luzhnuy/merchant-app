import { Injectable } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { BehaviorSubject, Observable, Observer, Subject, timer } from 'rxjs';
import { Platform } from '@ionic/angular';
import { take, takeUntil, takeWhile } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UserServiceV2 } from './user-v2.service';

@Injectable({
  providedIn: 'root'
})
export class WsClientService<T> {

  isConnecting = false;

  private isConnected$$ = new BehaviorSubject(false);
  public isConnected$ = this.isConnected$$.asObservable();

  private wsSubj: WebSocketSubject<any>;
  private subscriptions: Map<string, { data: any; subj: Subject<any> }> = new Map();

  private stopListen$$ = new Subject();

  constructor(
    private userService: UserServiceV2,
    private platform: Platform,
  ) {}

  listen(eventName: string, data: { [key: string]: any } = {}, registered: Observer<true> = null): Observable<T> {
    let subj;
    if (this.subscriptions.has(eventName)) {
      subj = this.subscriptions.get(eventName).subj;
    } else {
      subj = new Subject<T>();
      this.subscriptions.set(eventName, {
        data,
        subj,
      });
    }
    if (this.isConnected$$.getValue()) {
      this.registerEventSubscription(eventName, data, registered);
    } else {
      this.connect();
    }
    return subj.asObservable();
  }

  stopListen(eventName) {
    if (this.subscriptions.has(eventName)) {
      const subj = this.subscriptions.get(eventName).subj;
      subj.complete();
      this.subscriptions.delete(eventName);
    }
    if (this.subscriptions.size === 0 && this.wsSubj) {
      this.wsSubj.complete();
      this.stopListen$$.next();
    }
  }

  private async connect() {
    if (this.isConnecting) {
      return;
    }
    const hasError = new Subject();
    this.isConnecting = true;
    this.wsSubj = new WebSocketSubject(environment.wsUrl);
    this.wsSubj.subscribe((message: {
      event: string,
      data: T,
    }) => {
      const eventName = message.event;
      let subj;
      if (this.subscriptions.has(eventName)) {
        subj = this.subscriptions.get(eventName).subj;
        subj.next(message.data);
      }
    }, e => {
      hasError.next();
      this.isConnecting = false;
      this.isConnected$$.next(false);
      subscription.unsubscribe();
      this.wsSubj.complete();
      setTimeout(() => {
        this.connect();
      }, 1500);
    }, () => {
      this.isConnecting = false;
      this.isConnected$$.next(false);
    });

    const subscription = timer(500)
      .subscribe(async () => {
        await this.registerEventSubscriptions();
        this.isConnected$$.next(true);
        this.isConnecting = false;
        this.platform
          .resume
          .pipe(
            take(1),
            takeUntil(hasError),
            takeUntil(this.stopListen$$),
          )
          .subscribe(() => {
            this.connect();
          });
        this.platform
          .pause
          .pipe(
            take(1),
            takeWhile(() => this.isConnected$$.getValue()),
          )
          .subscribe(() => {
            this.wsSubj.complete();
          });
      });
  }

  private registerEventSubscription(
    eventName: string,
    data: { [key: string]: any } = {},
    registered: Observer<true> = null,
  ) {
    this.userService
      .getOneTimeAuthToken()
      .subscribe(token => {
        data.source = environment.wsSource;
        data.token = token;
        this.wsSubj.next({ event: eventName, data });
        if (registered) {
          setTimeout(() => {
            registered.next(true);
            registered.complete();
          }, 100);
        }
      });
  }

  private async registerEventSubscriptions() {
    for (const [key, value] of this.subscriptions.entries()) {
      const subscribed = new Subject<boolean>();
      this.registerEventSubscription(key, value.data, subscribed);
      await subscribed.toPromise();
    }
  }
}





// import { Injectable } from '@angular/core';
// import { WebSocketSubject } from 'rxjs/webSocket';
// import { BehaviorSubject, Observable, Subject, timer } from 'rxjs';
// import { environment } from '../../environments/environment';
// import { UserServiceV2 } from './user-v2.service';
//
// @Injectable({
//   providedIn: 'root'
// })
// export class WsClientService {
//
//   isConnecting = false;
//
//   private isConnected$$ = new BehaviorSubject(false);
//   public isConnected$ = this.isConnected$$.asObservable();
//
//   private wsSubj: WebSocketSubject<any>;
//   private subscriptions: Map<string, { data: any; subj: Subject<any> }> = new Map();
//
//   constructor(
//     private userService: UserServiceV2,
//   ) {}
//
//   listen<T>(eventName: string, data: { [key: string]: any } = {}): Observable<T> {
//     let subj;
//     if (this.subscriptions.has(eventName)) {
//       subj = this.subscriptions.get(eventName).subj;
//     } else {
//       subj = new Subject<T>();
//       this.subscriptions.set(eventName, {
//         data,
//         subj,
//       });
//     }
//     if (this.isConnected$$.getValue()) {
//       this.userService
//         .getOneTimeAuthToken()
//         .subscribe(token => {
//           data.source = environment.wsSource;
//           data.token = token;
//           this.wsSubj.next({ event: eventName, data });
//         });
//     } else {
//       this.connect<T>();
//     }
//     return subj.asObservable();
//   }
//
//   stopListen(eventName) {
//     if (this.subscriptions.has(eventName)) {
//       const subj = this.subscriptions.get(eventName).subj;
//       subj.complete();
//       this.subscriptions.delete(eventName);
//     }
//     if (this.subscriptions.size === 0 && this.wsSubj) {
//       this.wsSubj.unsubscribe();
//       this.isConnected$$.next(false);
//     }
//   }
//
//   private connect<T>() {
//     if (this.isConnecting) {
//       return;
//     }
//     this.isConnecting = true;
//     this.wsSubj = new WebSocketSubject(environment.wsUrl);
//     this.wsSubj.subscribe((message: {
//       event: string,
//       data: T,
//     }) => {
//       const eventName = message.event;
//       let subj;
//       if (this.subscriptions.has(eventName)) {
//         subj = this.subscriptions.get(eventName).subj;
//       }
//       subj.next(message.data);
//     }, e => {
//       this.isConnecting = false;
//       this.isConnected$$.next(false);
//       subscription.unsubscribe();
//       setTimeout(() => {
//         this.connect();
//       }, 1500);
//     });
//     const timer$ = timer(1000);
//     const subscription = timer$
//       .subscribe(() => {
//         this.isConnected$$.next(true);
//         this.isConnecting = false;
//         if (this.subscriptions.size) {
//           this.subscriptions.forEach((value, key) => {
//             this.listen(key, value.data);
//           });
//         }
//       });
//   }
// }

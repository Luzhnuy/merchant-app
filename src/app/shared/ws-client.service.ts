import { Injectable } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { BehaviorSubject, Observable, Subject, timer } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserServiceV2 } from './user-v2.service';

@Injectable({
  providedIn: 'root'
})
export class WsClientService {

  isConnecting = false;

  private isConnected$$ = new BehaviorSubject(false);
  public isConnected$ = this.isConnected$$.asObservable();

  private wsSubj: WebSocketSubject<any>;
  private subscriptions: Map<string, { data: any; subj: Subject<any> }> = new Map();

  constructor(
    private userService: UserServiceV2,
  ) {}

  listen<T>(eventName: string, data: { [key: string]: any } = {}): Observable<T> {
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
      this.userService
        .getOneTimeAuthToken()
        .subscribe(token => {
          data.source = environment.wsSource;
          data.token = token;
          this.wsSubj.next({ event: eventName, data });
        });
    } else {
      this.connect<T>();
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
      this.wsSubj.unsubscribe();
      this.isConnected$$.next(false);
    }
  }

  private connect<T>() {
    if (this.isConnecting) {
      return;
    }
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
      }
      subj.next(message.data);
    }, e => {
      this.isConnecting = false;
      this.isConnected$$.next(false);
      subscription.unsubscribe();
      setTimeout(() => {
        this.connect();
      }, 1500);
    });
    const timer$ = timer(1000);
    const subscription = timer$
      .subscribe(() => {
        this.isConnected$$.next(true);
        this.isConnecting = false;
        if (this.subscriptions.size) {
          this.subscriptions.forEach((value, key) => {
            this.listen(key, value.data);
          });
        }
      });
  }
}

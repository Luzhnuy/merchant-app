import {Injectable} from '@angular/core';
import {from, Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StorageVariableV2Service {
  private subscriptions: Map<string, Subject<any>> = new Map();

  constructor(
    // private zone: NgZone,
  ) {

  }

  get<T>(key: string): Observable<T> {
    let subj = this.subscriptions.get(key);
    if (!subj) {
      subj = new Subject<T>();
      this.subscriptions.set(key, subj);
    }
    const promise = new Promise(resolve => {
      const result = localStorage.getItem(key);
      if (result === null) {
        resolve(null);
      } else {
        try {
          const res = JSON.parse(result) as T;
          resolve(res);
        } catch {
          resolve(result);
        }
      }
    });
    promise.then((data: any) => {
      subj.next(data);
    });

    return subj.asObservable();
  }

  set(key: string, data: any, silent = false) {
    return from(new Promise((resolve, reject) => {
      localStorage.setItem(key, JSON.stringify(data));
      resolve(data);
      if (!silent && this.subscriptions.has(key)) {
        this.subscriptions.get(key).next(data);
      }
    }));
  }

  remove(key: string) {
    return from(new Promise((resolve, reject) => {
      localStorage.removeItem(key);
      if (this.subscriptions.has(key)) {
        this.subscriptions.get(key).next(null);
      }
      resolve();
    }));
  }
}

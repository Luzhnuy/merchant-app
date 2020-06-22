import { Injectable, NgZone } from '@angular/core';
import { from, Observable, ReplaySubject } from 'rxjs';
import { isArray } from 'util';

@Injectable({
  providedIn: 'root',
})
export class StorageCollectionService {
  private subscriptionsAll: Map<string, ReplaySubject<any[]>> = new Map();
  private subscriptionsRecords: Map<string, ReplaySubject<any>> = new Map();
  private collections: Map<string, any[]> = new Map();

  constructor(
    private zone: NgZone,
  ) {

  }

  get(key: string, id: string, primaryField = 'id'): Observable<any> {
    const subsrKey = this.getSubscrRecordKey(key, id);
    let subj = this.subscriptionsRecords.get(subsrKey);
    if (!subj) {
      subj = new ReplaySubject<any>(1);
      this.subscriptionsRecords.set(subsrKey, subj);
    }
    const collection = this.collections.get(key);
    if (collection) {
      const colItem = collection.find(item => item[primaryField].toString() === id.toString());
      subj.next(colItem);
    }
    return subj.asObservable();
  }

  has(key: string, id: string, primaryField = 'id'): boolean {
    const subscrKey = this.getSubscrRecordKey(key, id);
    return this.subscriptionsRecords.has(subscrKey);
  }

  all<T>(key: string): Observable<any[]> {
    let subj = this.subscriptionsAll.get(key);
    if (!subj) {
      subj = new ReplaySubject<any[]>(1);
      this.subscriptionsAll.set(key, subj);
      if (this.collections.has(key)) {
        subj.next(this.collections.get(key));
      }
    }
    return subj.asObservable();
  }

  set(key: string, data: any, primaryField = 'id', silent = false) {
    let collection: any[] = this.collections.get(key);
    if (!collection) {
      collection = [] as any[];
    }
    return from(new Promise((resolve, reject) => {
      if (!isArray(data)) {
        data = [data];
      }
      (data as Array<any>).forEach(dataItem => {
        const curItem = dataItem;
        let found = false;
        collection.forEach((item, idx) => {
          if (item[primaryField] === curItem[primaryField]) {
            collection[idx] = curItem;
            found = true;
          }
        });
        if (!found) {
          collection.push(curItem);
        }
      });
      this.collections.set(key, collection);
      this.zone.run(() => {
        resolve(true);
        if (!silent) {
          if (this.subscriptionsAll.has(key)) {
            this.subscriptionsAll.get(key).next(this.collections.get(key));
          }
          (data as Array<any>).forEach(dataItem => {
            const subscrRecKey = this.getSubscrRecordKey(key, dataItem[primaryField]);
            if (this.subscriptionsRecords.has(subscrRecKey)) {
              this.subscriptionsRecords.get(subscrRecKey).next(dataItem);
            }
          });
        }
      });
    }));
  }

  unset(key) {
    if (this.subscriptionsAll.has(key)) {
      this.collections.set(key, null);
      this.subscriptionsAll.get(key).complete();
    }
  }

  remove(key: string, id: string, primaryField = 'id') {
    let collection: any[] = this.collections.get(key);
    if (!collection) {
      collection = [];
    }
    return from(new Promise((resolve, reject) => {
      let foundIdx = -1;
      collection.forEach((item, idx) => {
        if (item[primaryField].toString() === id) {
          foundIdx = idx;
        }
      });
      if (foundIdx > -1) {
        collection.splice(foundIdx, 1);
      }
      this.collections.set(key, collection);
      resolve(true);
      if (this.subscriptionsAll.has(key)) {
        this.subscriptionsAll.get(key).next(this.collections.get(key));
      }
      const subscrRecKey = this.getSubscrRecordKey(key, id);
      if (this.subscriptionsRecords.has(subscrRecKey)) {
        this.subscriptionsRecords.get(subscrRecKey).complete();
        this.subscriptionsRecords.delete(subscrRecKey);
      }
    }));
  }

  private getSubscrRecordKey(key, id) {
    return `${key}---${id}`;
  }
}

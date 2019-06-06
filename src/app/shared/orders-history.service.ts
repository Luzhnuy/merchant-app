import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Order } from './order';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserService } from './user.service';
import { ApiService } from './api.service';
import { HelperService } from './helper.service';

@Injectable({
  providedIn: 'root'
})
export class OrdersHistoryService {

  private _orders: BehaviorSubject<Order[]> = new BehaviorSubject([]);
  public readonly orders: Observable<Order[]> = this._orders.asObservable();
  private _curOrder: BehaviorSubject<Order> = new BehaviorSubject(null);
  public readonly currentOrder: Observable<Order> = this._curOrder.asObservable();

  private interval;
  private currentOrderSelected = false;

  private readonly URL_HISTORY = 'marchands/merchanthistory';
  private readonly URL_CURRENT = 'marchands/merchantorders';

  constructor(
    private httpClient: HttpClient,
    private userService: UserService,
    private apiService: ApiService,
    private helperService: HelperService,
  ) {}

  loadHistory() {

    return this.httpClient
      .get(this.apiService.getUrl(`${this.URL_HISTORY}/${this.userService.user.token}`))
      .pipe(
        map(
          (response: { currentPage: number; data: any; }) => {
            return Object.keys(response.data).map(key => {
              const orderData = response.data[key];
              orderData.items = Object.keys(orderData.items).map(itemKey => orderData.items[itemKey]);
              orderData.created = this.helperService.fixDateStrFormatForSafari(orderData.created);
              orderData.lastUpdated = this.helperService.fixDateStrFormatForSafari(orderData.lastUpdated);
              orderData.pickupTime = this.helperService.fixDateStrFormatForSafari(orderData.pickupTime, false);
              return new Order(orderData);
            });
          }
        )
      );
  }

  setCurrentOrder(order: Order | null) {
    this._curOrder.next(order);
  }

  startLoadingCurrentOrders() {
    clearInterval(this.interval);
    this.loadOrders();
    this.interval = setInterval(() => {
      this.loadOrders();
    }, 10000);
  }

  stopLoadingCurrentOrders() {
    clearInterval(this.interval);
  }

  mergeOrders(initialOrders: Order[], newOrders: Order[]) {
    const allNewOrderIdAssoc = newOrders.reduce((res, order) => {
      res[order.id] = order;
      return res;
    }, <any>{});
    const oldOrdersIds: string[] = [];
    const absentOrdersIdx: number[] = [];
    initialOrders.forEach(
      (order, idx) => {
        if (allNewOrderIdAssoc[order.id]) {
          this.mergeOrder(order, allNewOrderIdAssoc[order.id]);
          oldOrdersIds.push(order.id);
        } else {
          absentOrdersIdx.push(idx);
        }
      }
    );
    absentOrdersIdx.forEach(idx => initialOrders.splice(idx, 1));
    newOrders
      .reduce((orders, order) => {
        if (oldOrdersIds.indexOf(order.id) === -1) {
          orders.unshift(order);
        }
        return orders;
      }, [])
      .forEach(order => {
        initialOrders.unshift(order);
      });
    return initialOrders;
  }

  mergeOrder(order1: Order, order2: Order) {
    order1.id = order2.id;
    order1.pickupTime = order2.pickupTime;
    order1.lastUpdated = order2.lastUpdated;
    order1.currentStatus = order2.currentStatus;
    order1.deliveryFee = order2.deliveryFee;
    order1.driver = order2.driver;
  }

  private loadOrders() {
    this.httpClient
      .get(this.apiService.getUrl(`${this.URL_CURRENT}/${this.userService.user.token}`))
      .pipe(
        map(
          (response: { currentPage: number; data: any; }) => {
            return Object.keys(response.data).map(key => {
              const orderData = response.data[key];
              orderData.items = orderData.items ? Object.keys(orderData.items).map(itemKey => orderData.items[itemKey]) : [];
              orderData.created = this.helperService.fixDateStrFormatForSafari(orderData.created);
              orderData.lastUpdated = this.helperService.fixDateStrFormatForSafari(orderData.lastUpdated);
              orderData.pickupTime = this.helperService.fixDateStrFormatForSafari(orderData.pickupTime, false);
              return new Order(orderData);
            });
          }
        )
      ).subscribe(
      orders => {
        if (!this.currentOrderSelected && orders.length) {
          this.currentOrderSelected = true;
          this._curOrder.next(orders[0]);
        }
        this._orders.next(this.mergeOrders(this._orders.getValue(), orders));
      }
    );
  }
}

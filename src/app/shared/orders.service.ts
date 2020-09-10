import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import { UserServiceV2 } from './user-v2.service';
import { ApiV2Service } from './api-v2.service';
import { EntitiesService } from './entities.service';
import { HelperService } from './helper.service';
import { ErrorHandlerService } from './error-handler.service';
import { OrderSource, OrderStatus, OrderType, OrderV2 } from './order-v2';
import { OrderPrepareData, OrderPrepareRequestData } from './order-interfaces';
import { WsClientService } from './ws-client.service';
import { StorageCollectionService } from './storage-collection.service';
import { NativeAudio } from '@ionic-native/native-audio/ngx';

export class OrdersSearchParams {
  page?: number
  limit?: number;
  query?: string;
  range?: string[];
  statuses?: OrderStatus[];
  orderBy?: keyof OrderV2;
  order?: 'DESC' | 'ASC' | 'desc' | 'asc';
}

@Injectable({
  providedIn: 'root',
})
export class OrdersService extends EntitiesService<OrderV2> {

  protected readonly endpoint = 'orders';
  protected readonly endpointPrepareOrder = 'orders/prepare-order';
  protected readonly endpointMinTripCount = 'price-calculator/min-trip-count';

  isWatching: boolean;

  private readonly SubEventName = 'orders-events';
  private orders: OrderV2[];

  private stopWatch$$ = new EventEmitter();

  private $$currentOrder: BehaviorSubject<OrderV2> = new BehaviorSubject<OrderV2>(null);
  public $currentOrder: Observable<OrderV2> = this.$$currentOrder.asObservable();

  private newExternalOrder$$ = new Subject<OrderV2>();
  public newExternalOrder$ = this.newExternalOrder$$.asObservable();

  private watchedOrderIds: number[];

  constructor(
    protected readonly apiClient: ApiV2Service,
    private userService: UserServiceV2,
    public helper: HelperService,
    public errorHandler: ErrorHandlerService,
    public readonly wsClient: WsClientService<OrderV2>,
    private storageCollection: StorageCollectionService,
    private nativeAudio: NativeAudio,
  ) {
    super(helper, errorHandler);
  }

  public createTrip(orders: OrderV2[]) {
    const subj = new Subject<OrderV2[]>();
    this.apiClient.post(
      `${this.endpoint}/trip`,
      orders,
    )
      .subscribe(
        (data: OrderV2[]) => {
          subj.next(data);
          subj.complete();
        }, err => {
          this.helper.showError(
            this.errorHandler.handleError(err)
          );
          subj.error(err);
          subj.complete();
        },
      );
    return subj.asObservable();
  }

  public getMinTripOrdersCount() {
    const subj = new Subject<number>();
    this.apiClient
      .get(
        this.endpointMinTripCount,
      )
      .subscribe(
        (resp: number) => {
          subj.next(resp);
          subj.complete();
        }, err => {
          subj.error(err);
          subj.complete();
        }
      );
    return subj.asObservable();
  }

  public setCurrentOrder(order: OrderV2) {
    this.$$currentOrder.next(order);
  }

  updateStatus(
    id: number,
    status: OrderStatus,
    cancellationReason?: string,
  ) {
    const subj = new Subject<OrderV2>();
    this.apiClient
      .put(
        `${this.endpoint}/status/${id}`,
        {
          id,
          status,
          cancellationReason,
        }
      )
      .subscribe(
        (data: OrderV2) => {
          subj.next(new OrderV2(data));
          subj.complete();
        }, err => {
          subj.error(err);
          subj.complete();
        },
      );
    return subj.asObservable();
  }

  public prepareOrder(data: OrderPrepareRequestData) {
    const subj = new Subject<OrderPrepareData>();
    this.apiClient
      .post(
        this.endpointPrepareOrder,
        data
      )
      .subscribe(
        (resp: OrderPrepareData) => {
          subj.next(resp);
          subj.complete();
        }, err => {
          subj.error(err);
          subj.complete();
        }
      );
    return subj.asObservable();
  }

  async startWatch() {
    if (this.isWatching) {
      return;
    }
    this.isWatching = true;
    this.watch();
  }

  async stopWatch() {
    this.isWatching = null;
    this.orders = null;
    this.wsClient.stopListen(this.SubEventName);
    this.storageCollection.unset(this.SubEventName);
    this.stopWatch$$.emit();
  }

  async loadHistory() {
    const startDate = new Date();
    const endDate = new Date();
    startDate.setUTCMonth(endDate.getUTCMonth() - 6);
    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(24, 0, 0, 0);
    const searchParams: OrdersSearchParams = {
      page: 0,
      limit: 250,
      orderBy: 'id',
      order: 'DESC',
      statuses: [OrderStatus.Completed, OrderStatus.Cancelled],
      range: [
        startDate.toISOString(),
        endDate.toISOString(),
      ],
    };
    try {
      return await this.load(searchParams).toPromise();
    } catch (e) {
      console.error(e);
    }
  }

  async loadAll() {
    const searchParams: OrdersSearchParams = {
      page: 0,
      limit: 250,
      orderBy: 'scheduledAt',
      order: 'ASC',
      statuses: [OrderStatus.Received, OrderStatus.Accepted, OrderStatus.OnWay],
    };
    try {
      this.orders = await this.load(searchParams).toPromise();
      if (!this.watchedOrderIds) {
        setTimeout(() => {
          this.updateSoundState();
        }, 6000);
        this.watchedOrderIds = this.orders.map(order => order.id);
      } else {
        const newOrdersIds: number[] = this.orders.map(order => order.id);
        this.watchedOrderIds
          .forEach(oId => {
            const idx = newOrdersIds.indexOf(oId);
            if (idx > -1) {
              newOrdersIds.splice(idx, 1);
            }
          });
        if (newOrdersIds.length) {
          this.orders
            .forEach(order => {
              if (newOrdersIds.indexOf(order.id) > -1) {
                order.isNew = true;
                this.newExternalOrder$$
                  .next(order);
              }
            });
          setTimeout(() => {
            this.updateSoundState();
          }, 6000);
        }
      }
    } catch (e) {
      console.error(e);
      // TODO handle error correctly
      this.isWatching = false;
    }
    this.storageCollection.set(this.SubEventName, this.orders);
  }

  getAll(): Observable<OrderV2[]> {
    return this.storageCollection
      .all(this.SubEventName);
  }

  getSingle(id): Observable<OrderV2> {
    if (!this.storageCollection.has(this.SubEventName, id)) {
      return super.getSingle(id);
    }
    return this.storageCollection.get(this.SubEventName, id);
  }

  getReportLink(query: any) {
    const searchParams = new URLSearchParams(query).toString();
    return this.apiClient.getUrl(`${this.endpoint}/reports?${searchParams}`);
  }

  getInvoiceLink(query: any) {
    const searchParams = new URLSearchParams(query).toString();
    return this.apiClient.getUrl(`${this.endpoint}/invoice?${searchParams}`);
  }

  getColorByStatus(status: OrderStatus) {
    switch (status) {
      case OrderStatus.Completed:
        return 'light';
      case OrderStatus.OnWay:
        return 'warning';
      case OrderStatus.Cancelled:
        return 'danger';
      case OrderStatus.Received:
        return 'success';
      case OrderStatus.Accepted:
        return 'secondary';
    }
  }

  viewOrder(orderId: number) {
    if (this.watchedOrderIds && this.watchedOrderIds.indexOf(orderId) === -1) {
      this.watchedOrderIds.push(orderId);
    }
    if (this.orders) {
      const order = this.orders.find(o => o.id === orderId);
      if (order && order.isNew) {
        order.isNew = false;
        this.storageCollection.set(this.SubEventName, order);
      }
      this.updateSoundState();
    }
  }

  sendEmail(order: OrderV2) {
    const subj = new Subject<number>();
    this.apiClient
      .get(
        `${this.endpoint}/send-receipt/${order.id}`,
      )
      .subscribe(
        (data: number) => {
          subj.next(data);
          subj.complete();
        }, err => {
          subj.error(err);
          subj.complete();
        },
      );
    return subj.asObservable();
  }

  private load(searchParams) {
    return super.getAll(searchParams)
      .pipe(
        map(orders => orders.reduce((res, orderData) => {
          const order = new OrderV2(orderData);
          res.push(order);
          return res;
        }, [])),
      );
  }

  private watch() {
    this.wsClient
      .isConnected$
      .pipe(
        takeUntil(this.stopWatch$$)
      )
      .subscribe(isConnected => {
        if (isConnected) {
          this.loadAll();
        }
      });
    this.wsClient
      .listen(this.SubEventName)
      .subscribe((orderData) => {
        let order = this.orders.find(o => o.id === orderData.id);
        if (!order) {
          order = new OrderV2(orderData);
          if (order.source !== OrderSource.Merchant) {
            order.isNew = true;
            this.newExternalOrder$$
              .next(order);
          }
          this.orders.push(order);
          this.updateSoundState();
        } else {
          Object.assign(order, orderData);
        }
        this.storageCollection.set(this.SubEventName, this.orders);
        if ([OrderStatus.Cancelled, OrderStatus.Completed].indexOf(order.status) > -1) {
          this.storageCollection.remove(this.SubEventName, order.id.toString());
          this.getAll().pipe(take(1)).subscribe(orders => {
            this.orders = orders;
          });
        }
      });
  }

  private updateSoundState() {
    if (this.orders.find(o => o.isNew)) {
      this.putSoundOn();
    } else {
      this.putSoundOff();
    }
  }

  putSoundOn() {
    this.nativeAudio.preloadSimple('newMenuOrder', 'assets/mp3/done-for-you.mp3').then(() => {
      this.nativeAudio.loop('newMenuOrder')
        .then(() => {
        }, (e) => {
          console.error(e);
          (document.getElementById('new-menu-order-sound') as any).play();
        });
    }, (e) => {
      console.error(e);
      (document.getElementById('new-menu-order-sound') as any).play();
    });
  }

  private putSoundOff() {
    this.nativeAudio
      .stop('newMenuOrder')
      .then(() => {}, (e) => {
        console.error(e);
        (document.getElementById('new-menu-order-sound') as any).pause();
      });
  }

}

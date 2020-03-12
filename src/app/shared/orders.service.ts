import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import { UserServiceV2 } from './user-v2.service';
import { ApiV2Service } from './api-v2.service';
import { EntitiesService } from './entities.service';
import { HelperService } from './helper.service';
import { ErrorHandlerService } from './error-handler.service';
import { OrderStatus, OrderV2 } from './order-v2';
import { OrderPrepareData, OrderPrepareRequestData } from './order-interfaces';
import { WsClientService } from './ws-client.service';
import { StorageCollectionService } from './storage-collection.service';

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

  isWatching: boolean;

  private readonly SubEventName = 'orders-events';
  private orders: OrderV2[];

  private stopWatch$$ = new EventEmitter();

  private $$currentOrder: BehaviorSubject<OrderV2> = new BehaviorSubject<OrderV2>(null);
  public $currentOrder: Observable<OrderV2> = this.$$currentOrder.asObservable();

  constructor(
    protected readonly apiClient: ApiV2Service,
    private userService: UserServiceV2,
    public helper: HelperService,
    public errorHandler: ErrorHandlerService,
    public readonly wsClient: WsClientService,
    private storageCollection: StorageCollectionService,
  ) {
    super(helper, errorHandler);
  }

  public setCurrentOrder(order: OrderV2) {
    this.$$currentOrder.next(order);
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
    return this.storageCollection.get(this.SubEventName, id);
  }

  getReportLink(query: any) {
    const searchParams = new URLSearchParams(query).toString();
    return this.apiClient.getUrl(`${this.endpoint}/reports?${searchParams}`);
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
      .listen<OrderV2>(this.SubEventName)
      .subscribe((orderData) => {
        let order = this.orders.find(o => o.id === orderData.id);
        if (!order) {
          order = new OrderV2(orderData);
          this.orders.push(order);
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

}

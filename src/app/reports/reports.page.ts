import { Component, OnInit } from '@angular/core';
import { OrdersService } from '../shared/orders.service';
import { OrderType } from '../shared/order-v2';
import { UserServiceV2 } from '../shared/user-v2.service';
import { take } from 'rxjs/operators';

enum HumanTypes {
  Booking = 'Booking',
  App = 'App',
  All = 'All',
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class ReportsPage implements OnInit {

  dateRange: Date[] = [];
  maxDate = new Date();

  reportTypes: HumanTypes[] = [ HumanTypes.Booking, HumanTypes.App, HumanTypes.All];
  selectedType: HumanTypes = HumanTypes.Booking;
  invalid = true;
  typesAssoc: {
    [key: string]: OrderType[];
  } = {
    [HumanTypes.Booking]: [OrderType.Booking],
    [HumanTypes.App]: [OrderType.Menu],
    [HumanTypes.All]: [OrderType.Booking, OrderType.Menu],
  };

  constructor(
    private ordersService: OrdersService,
    private userServiceV2: UserServiceV2,
  ) { }

  ngOnInit() {
  }

  async onDateRangeChanged() {
    if (this.dateRange && this.dateRange.length) {
      this.invalid = false;
    } else {
      this.invalid = true;
    }
  }

  async download() {
    const startDate = new Date(this.dateRange[0].getTime());
    const endDate = new Date(this.dateRange[1].getTime());
    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(24, 0, 0, 0);
    const token = await this.userServiceV2.getOneTimeAuthToken().toPromise();
    const params = {
      token,
      limit: 9999,
      page: 0,
      range: [
        startDate.toISOString(),
        endDate.toISOString(),
      ],
      types: this.typesAssoc[this.selectedType],
    };
    window.open(this.ordersService.getReportLink(params), '_blank');
  }

}

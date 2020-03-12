import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { OrderV2 } from '../shared/order-v2';
import { OrdersService } from '../shared/orders.service';
import { takeUntil } from 'rxjs/operators';

declare var google: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {

  curOrder: OrderV2;
  private detroyed$: EventEmitter<boolean> = new EventEmitter();

  constructor(
    public ordersService: OrdersService,
  ) {}

  ngOnInit() {
    this.ordersService
      .$currentOrder
      .pipe(
        takeUntil(this.detroyed$)
      )
      .subscribe(order => {
        this.curOrder = order;
        setTimeout(() => {
          this.drawMap();
        }, 1000);
      });
  }

  ngOnDestroy() {
    this.detroyed$.emit(true);
  }

  drawMap() {
    if (this.curOrder) {
      const mapProp = {
        center: new google.maps.LatLng(51.508742, -0.120850),
        zoom: 9,
      };
      const map = new google.maps.Map(document.getElementById('googleMap'), mapProp);
      const directionsService = new google.maps.DirectionsService();
      const directionsDisplay = new google.maps.DirectionsRenderer();
      directionsDisplay.setMap(map);
      const request = {
        origin: this.curOrder.metadata.pickUpAddress,
        destination: this.curOrder.metadata.dropOffAddress,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
      };
      directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(response);
        }
      });
    } else {
      // TODO remove direction
    }
  }
}

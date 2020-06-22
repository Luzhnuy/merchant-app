import { Component, Input, OnInit } from '@angular/core';
import { OrderV2 } from '../../order-v2';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss'],
})
export class OrderDetailsComponent implements OnInit {

  @Input() order: OrderV2;

  constructor() { }

  ngOnInit() {}

  print() {
    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = ua.indexOf('android') > -1;

    if (isAndroid) {
      const url = 'http://api.snapgrabdelivery.com/merchants/print.html?name='
        + this.order.metadata.dropOffTitle
        + '&address=' + this.order.metadata.dropOffAddress
        + '&phone=' + this.order.metadata.dropOffPhone
        + '&order='
        + this.order.orderItems.join('__');
      window.open(url, 'window', 'toolbar=no, menubar=no, resizable=yes');
    } else {
      const html = `
        <div id="print-html" style="width: 100%; height: 100%; padding: 20px;">
            <img src="img/logo-print.png" style="width: 100px;"> <br><br>
            <strong>Name: </strong>${this.order.metadata.dropOffTitle}<br>
            <strong>Address: </strong>${this.order.metadata.dropOffAddress}<br>
            <strong>Phone: </strong>${this.order.metadata.dropOffPhone}<br>
            <br>
            <table class="table">
                <thead>
                    <tr>
                        <th style="text-align: left;"> Order</th>
                    </tr>
                </thead>
                <tbody>
                    <tr ng-repeat="item in selectjob.items" class="ng-scope">
                        <td class="ng-binding">${this.order.metadata.description}</td>
                    </tr>
                </tbody>
            </table>
        </div>
      `;
      const createElementFromHTML = (htmlString) => {
        const div = document.createElement('div');
        div.innerHTML = htmlString.trim();
        return div.firstChild;
      };
      const body = document.getElementsByTagName('body')[0];
      const appRoot = (document as any).getElementsByTagName('app-root')[0];
      body.append(createElementFromHTML(html));
      appRoot.style.display = 'none';

      window.print();
      const printHtml = document.getElementById('print-html');
      printHtml.remove();
      appRoot.style.display = '';
    }
    return false;
  }

  getTrackingUrl(ordder: OrderV2) {
    return environment.trackingUrlBaseUrl + ordder.uuid;
  }

}

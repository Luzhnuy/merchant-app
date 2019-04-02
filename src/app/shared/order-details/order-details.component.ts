import { Component, Input, OnInit } from '@angular/core';
import { Order } from '../order';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss'],
})
export class OrderDetailsComponent implements OnInit {

  @Input() order: Order;

  constructor() { }

  ngOnInit() {}

  print() {
    // TODO check Android correctly
    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = ua.indexOf('android') > -1; //&& ua.indexOf("mobile");

    if (isAndroid) {

      const url = 'http://api.snapgrabdelivery.com/merchants/print.html?name='
        + this.order.dropoffLocation.name
        + '&address=' + this.order.dropoffLocation.address
        + '&phone=' + this.order.dropoffLocation.phone
        + '&order='
        + this.order.items.join('__');

      window.open(url, 'window', 'toolbar=no, menubar=no, resizable=yes');
    } else {

      const html = `
        <div id="print-html" style="width: 100%; height: 100%; padding: 20px;">
            <img src="img/logo-print.png" style="width: 100px;"> <br><br>
            <strong>Name: </strong>${this.order.dropoffLocation.name}<br>
            <strong>Address: </strong>${this.order.dropoffLocation.address}<br>
            <strong>Phone: </strong>${this.order.dropoffLocation.phone}<br>
            <br>
            <table class="table">
                <thead>
                    <tr>
                        <th style="text-align: left;"> Order</th>
                    </tr>
                </thead>
                <tbody>`
                + this.order.items.map(item => {
                  return `
                    <tr ng-repeat="item in selectjob.items" class="ng-scope">
                        <td class="ng-binding">${item}</td>
                    </tr>
                  `;
                }).join('')
                + `</tbody>
            </table>
        </div>
      `;

      const createElementFromHTML = (htmlString) => {
        const div = document.createElement('div');
        div.innerHTML = htmlString.trim();
        return div.firstChild;
      };
      const body = document.getElementsByTagName('body')[0];
      const appRoot = <any>document.getElementsByTagName('app-root')[0];
      body.append(createElementFromHTML(html));
      appRoot.style.display = 'none';

      window.print();
      const printHtml = document.getElementById('print-html');
      printHtml.remove();
      appRoot.style.display = '';
    }
    return false;
  }

}

import { Component, OnInit } from '@angular/core';
import { OrderStatus, OrderType, OrderV2 } from '../shared/order-v2';
import { OrdersService } from '../shared/orders.service';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { OptionsService } from '../shared/options.service';
import { MenuOption } from '../shared/menu-option';
import { MenuSubOption } from '../shared/menu-sub-option';
import { HelperService } from '../shared/helper.service';
import { Platform } from '@ionic/angular';
import DomToImage from 'dom-to-image';

declare var cordova: any;

@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
})
export class OrderPage implements OnInit {

  order: OrderV2;

  trackUrl: string;
  isActive: boolean;

  options: MenuOption[];

  OrderStatus = OrderStatus;
  OrderType = OrderType;

  constructor(
    private ordersService: OrdersService,
    private activatedRoute: ActivatedRoute,
    private optionsService: OptionsService,
    private helper: HelperService,
    private platform: Platform,
  ) {}

  ngOnInit() {
    // setInterval(() => {
    //   this.ordersService.putSoundOn();
    // }, 10000);
  }

  async ionViewWillEnter() {
    const orderId = parseInt(this.activatedRoute.snapshot.params.id, 10);
    this.ordersService
      .viewOrder(orderId);
    await this.helper.stopLoading();
    try {
      this.options = await this.optionsService
        .getAll()
        .toPromise();
      const subOptions = this.options.reduce((res: MenuSubOption[], option) => {
        return [ ...res, ...option.subOptions];
      }, []);
      this.order = await this.ordersService
        .getSingle(orderId)
        .toPromise();
      this.order
        .orderItems
        .forEach(orderItem => {
          if (orderItem.subOptionIds) {
            orderItem.subOptions = orderItem.subOptionIds
              .map(subOptionId => subOptions.find(subOption => subOption.id === subOptionId));
          }
        });
      this.trackUrl = this.getTrackingUrl(this.order);
      this.isActive = [ OrderStatus.Completed, OrderStatus.Cancelled ].indexOf(this.order.status) === -1;
    } finally {
      await this.helper.stopLoading();
    }
  }

  async print() {
    let html = `
      <div id="print-html" style="width: 100%; height: 100%; padding: 20px;">
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
              <tbody>`;
    if (this.order.type === OrderType.Menu) {
      html += this.order
        .orderItems
        .reduce((res, orderItem) => {
          const price = orderItem.price.toFixed(2);
          res += `<tr>
                  <td>
                    ${ orderItem.quantity } x ${ orderItem.description }
                  </td>`;
          res += `<td style="text-align: right">
                    CA$${ price }
                  </td>`;
          res += `</tr>`;
          if (orderItem.subOptionIds) {
            orderItem.subOptions.reduce((res2, subOption) => {
              const price2 = orderItem.price ? orderItem.price.toFixed(2) : null;
              res += `<tr>
                        <td><small>${ subOption.title }</small></td>
                        <td style="text-align: right">
                          <small>`;
              if (price2) {
                res += 'CA$' + price2;
              }
              res += `
                          </small>
                        </td>
                      </tr>`;
              return res2;
            }, '');
          }
          return res;
        }, '');
    } else {
      html += `<tr>
                 <td>`;
      html += this.order.metadata.description;
      html += `  </td>
               </tr>`;
    }
    html += `</tbody>
          </table>
        </div>`;
    const createElementFromHTML = (htmlString) => {
      const div = document.createElement('div');
      div.innerHTML = htmlString.trim();
      return div.firstChild;
    };
    const body = document.getElementsByTagName('body')[0];
    const appRoot = document.getElementsByTagName('app-root')[0] as any;
    body.append(createElementFromHTML(html));
    appRoot.style.display = 'none';
    setTimeout(async () => {
      const printDT = new Date();
      if (this.platform.is('cordova')) {
        const dataUrl = await DomToImage.toPng(body);
        try {
          await cordova.plugins.printer.print(`<img src="${dataUrl}" />`);
        } catch (e) {
          console.log(e);
        }
      } else {
        window.print();
      }
      const now = new Date();
      const printing = new Promise((resolve, reject) => {
        if (now.getTime() - printDT.getTime() < 150) {
          let beforePrintFired = false;
          const afterprintListener = (event) => {
            resolve(true);
            window.removeEventListener('afterprint', afterprintListener);
          }
          const beforeprintListener = (event) => {
            beforePrintFired = true;
            window.removeEventListener('beforeprint', beforeprintListener);
          }
          const focusListener = (event) => {
            if (!beforePrintFired) {
              resolve(true);
              window.removeEventListener('afterprint', afterprintListener);
              window.removeEventListener('beforeprint', beforeprintListener);
            }
            window.removeEventListener('focus', focusListener);
          }
          window.addEventListener('focus', focusListener);
          window.addEventListener('beforeprint', beforeprintListener);
          window.addEventListener('afterprint', afterprintListener);
        } else {
          resolve(true);
        }
      });
      await printing;
      const printHtml = document.getElementById('print-html');
      printHtml.remove();
      appRoot.style.display = '';
    }, 10);
    return false;
  }

  getTrackingUrl(order: OrderV2) {
    return environment.trackingUrlBaseUrl + order.uuid;
  }

  async sendReceipt(order: OrderV2) {
    try {
      await this.ordersService
        .sendEmail(order)
        .toPromise();
      this.helper.showToast('Receipt sent');
    } catch (e) {
      this.helper.showError('There was something wrong, receipt not sent');
    }
  }
}

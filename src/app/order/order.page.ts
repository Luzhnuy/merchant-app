import { Component, OnInit } from '@angular/core';
import { OrderStatus, OrderType, OrderV2 } from '../shared/order-v2';
import { OrdersService } from '../shared/orders.service';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { OptionsService } from '../shared/options.service';
import { MenuOption } from '../shared/menu-option';
import { MenuSubOption } from '../shared/menu-sub-option';
import { HelperService } from '../shared/helper.service';
import { AlertController, Platform } from '@ionic/angular';
import DomToImage from 'dom-to-image';
import { ErrorHandlerService } from '../shared/error-handler.service';

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

  subOptions: MenuSubOption[];

  get showCancelOrder() {
    return [OrderStatus.Received, OrderStatus.Accepted, OrderStatus.OnWay]
      .indexOf(this.order.status) !== -1;
  }

  constructor(
    private ordersService: OrdersService,
    private activatedRoute: ActivatedRoute,
    private optionsService: OptionsService,
    private helper: HelperService,
    private platform: Platform,
    private alertController: AlertController,
    private errorHandlerService: ErrorHandlerService,
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
      this.subOptions = this.options.reduce((res: MenuSubOption[], option) => {
        return [ ...res, ...option.subOptions];
      }, []);
      await this.initOrder(orderId);
    } finally {
      await this.helper.stopLoading();
    }
  }

  private async initOrder(orderId: number) {
    this.order = await this.ordersService
      .getSingle(orderId)
      .toPromise();
    this.order
      .orderItems
      .forEach(orderItem => {
        if (orderItem.subOptionIds) {
          orderItem.subOptions = orderItem.subOptionIds
            .map(subOptionId => this.subOptions.find(subOption => subOption.id === subOptionId));
        }
      });
    this.trackUrl = this.getTrackingUrl(this.order);
    this.isActive = [ OrderStatus.Completed, OrderStatus.Cancelled ].indexOf(this.order.status) === -1;
  }

  async cancelOrder() {
    const alert = await this.alertController.create({
      message: 'Are you sure you want to cancel order?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Yes',
          handler: async () => {
            await this.helper.showLoading();
            try {
              await this.ordersService
                .updateStatus(
                  this.order.id,
                  OrderStatus.Cancelled,
                  'Cancelled by Merchant',
                )
                .toPromise();
              await this.initOrder(this.order.id);
            } catch (e) {
              await this.helper
                .showError(this.errorHandlerService.handleError(e));
            } finally {
              await this.helper.stopLoading();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  private isSafari() {
    return navigator.vendor.match(/apple/i);
  }

  async print() {
    const { maxWidth, maxHeight } = this.isSafari() ?
      { maxWidth: '210mm', maxHeight: '297mm' } : { maxWidth: '100%', maxHeight: '100%' };
    let html = `
      <div id="print-html" style="background: #fff; max-width: ${ maxWidth }; max-height: ${ maxHeight }; width: 100%; height: 100%; padding: 20px;">
          <table style="width: 100%; margin-top: 36px;">
            <tr>
              <td style="text-align: center;">
                <img  style="width: 148px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAABACAYAAAAkn/rnAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAaGVYSWZNTQAqAAAACAAEAQYAAwAAAAEAAgAAARIAAwAAAAEAAQAAASgAAwAAAAEAAgAAh2kABAAAAAEAAAA+AAAAAAADoAEAAwAAAAEAAQAAoAIABAAAAAEAAADwoAMABAAAAAEAAABAAAAAAEfQp+QAAALjaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA1LjQuMCI+CiAgIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICAgICAgICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICAgICAgICAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyI+CiAgICAgICAgIDx0aWZmOlBob3RvbWV0cmljSW50ZXJwcmV0YXRpb24+MjwvdGlmZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICAgICA8dGlmZjpDb21wcmVzc2lvbj4xPC90aWZmOkNvbXByZXNzaW9uPgogICAgICAgICA8dGlmZjpSZXNvbHV0aW9uVW5pdD4yPC90aWZmOlJlc29sdXRpb25Vbml0PgogICAgICAgICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+NjQ8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpDb2xvclNwYWNlPjE8L2V4aWY6Q29sb3JTcGFjZT4KICAgICAgICAgPGV4aWY6UGl4ZWxYRGltZW5zaW9uPjI0MDwvZXhpZjpQaXhlbFhEaW1lbnNp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"/>
              </td>
            </tr>
          </table>
          <hr/>
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
      if (this.platform.is('ios')) {
        setTimeout(() => {
          const printHtml = document.getElementById('print-html');
          printHtml.remove();
          appRoot.style.display = '';
        }, 100);
      } else {
        const printHtml = document.getElementById('print-html');
        printHtml.remove();
        appRoot.style.display = '';
      }
    }, 150);
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

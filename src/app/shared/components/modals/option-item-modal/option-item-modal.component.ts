import { Component, Input, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MenuOption } from '../../../menu-option';
import { ErrorHandlerService } from '../../../error-handler.service';
import { MerchantV2 } from '../../../merchant-v2';
import { MenuItemOption } from '../../../menu-item-option';
import { MenuItem } from '../../../menu-item';
import { ItemOptionService } from '../../../item-option.service';
import { forkJoin, of } from 'rxjs';
import { MenuCategory } from '../../../menu-category';

@Component({
  selector: 'app-option-item-modal',
  templateUrl: './option-item-modal.component.html',
  styleUrls: ['./option-item-modal.component.scss'],
})
export class OptionItemModalComponent implements OnInit {

  @Input() option: MenuOption;
  @Input() merchant: MerchantV2;
  @Input() categories: MenuCategory[];

  public itemOptions: MenuItemOption[];
  public items: MenuItem[];

  apiError: string;
  showLoading = true;

  private changes: MenuItemOption[] = [];

  constructor(
    private itemOptionService: ItemOptionService,
    private errorHandler: ErrorHandlerService,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
    this.itemOptionService
      .getAll({
        optionId: this.option.id,
      })
      .subscribe(ios => {
        this.itemOptions = ios;
      }, err => {
        this.apiError = this.errorHandler
          .handleError(err);
      }, () => {
        this.showLoading = false;
      });
    this.items = this.categories
      .reduce((res: any[], cat) => {
        return [...res, ...cat.items];
      }, []);
  }

  setCount(item: MenuItem, count: number) {
    let isChanges = true;
    let itemOption: MenuItemOption;
    itemOption = this.changes
      .find(io => io.itemId === item.id);
    if (!itemOption) {
      isChanges = false;
      itemOption = this.itemOptions
        .find(io => io.itemId === item.id);
    }
    if (!itemOption) {
      itemOption = new MenuItemOption({
        id: null,
        itemId: item.id,
        optionId: this.option.id,
        merchantId: this.option.merchantId,
        count,
      });
      this.itemOptions.push(itemOption);
    } else {
      itemOption.count = count;
    }
    if (!isChanges) {
      this.changes
        .push(itemOption);
    }
  }

  getItemOption(item: MenuItem) {
    let isChanges = true;
    let itemOption: MenuItemOption;
    itemOption = this.changes
      .find(io => io.itemId === item.id);
    if (!itemOption) {
      isChanges = false;
      itemOption = this.itemOptions
        .find(io => io.itemId === item.id);
    }
    if (!itemOption) {
      itemOption = new MenuItemOption({
        id: null,
        itemId: item.id,
        optionId: this.option.id,
        count: -1,
        merchantId: this.option.merchantId,
      });
    }
    return itemOption;
  }

  async save() {
    this.showLoading = true;
    try {
      const result = await forkJoin(
        this.changes
          .map(io => {
            if (io.count === -1) {
              if (io.id) {
                return this.itemOptionService
                  .remove(io.id);
              } else {
                return of(null);
              }
            } else {
              if (io.id) {
                return this.itemOptionService
                  .update(io);
              } else {
                return this.itemOptionService
                  .create(io);
              }
            }
          })
      ).toPromise();
      this.modalController.dismiss(true);
    } catch (e) {
      this.apiError = this.errorHandler.handleError(e);
    } finally {
      this.showLoading = false;
    }
  }

  cancel() {
    this.modalController.dismiss();
  }

  getIconName(itemOption: MenuItemOption, type: 'required' | 'optional') {
    if (itemOption.count === -1) {
      return 'radio-button-off-outline';
    } else if (type === 'required') {
      return 'radio-button-on-outline';
    } else {
      return 'checkmark-circle-outline';
    }
  }

  toggleItemOption(itemOption: MenuItemOption) {
    if (itemOption.count === -1) {
      itemOption.count = 0;
    } else if (itemOption.count === 0) {
      itemOption.count = 1;
    } else {
      itemOption.count = -1;
    }
  }
}

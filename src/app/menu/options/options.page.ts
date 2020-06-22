import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MerchantsService } from '../../shared/merchants.service';
import { MerchantV2 } from '../../shared/merchant-v2';
import { takeUntil } from 'rxjs/operators';
import { OptionsService } from '../../shared/options.service';
import { MenuOption } from '../../shared/menu-option';
import { OptionModalComponent } from '../../shared/components/modals/option-modal/option-modal.component';
import { SubOptionModalComponent } from '../../shared/components/modals/sub-option-modal/sub-option-modal.component';
import { MenuSubOption } from '../../shared/menu-sub-option';
import { CategoriesV2Service } from '../../shared/categories-v2.service';
import { MenuCategory } from '../../shared/menu-category';

@Component({
  selector: 'app-options',
  templateUrl: './options.page.html',
  styleUrls: ['./options.page.scss'],
})
export class OptionsPage implements OnInit, OnDestroy {

  merchant: MerchantV2;
  options: MenuOption[];
  categories: MenuCategory[];

  $destroyed = new EventEmitter<any>();

  constructor(
    private optionsService: OptionsService,
    private modalController: ModalController,
    private merchantsService: MerchantsService,
    private categoriesV2Service: CategoriesV2Service,
  ) { }

  ngOnInit() {
    this.categoriesV2Service
      .$categories
      .pipe(takeUntil(this.$destroyed))
      .subscribe(categories => this.categories = categories);
    this.merchantsService
      .$merchant
      .pipe(takeUntil(this.$destroyed))
      .subscribe(merchant => {
        this.merchant = merchant;
      });
    this.loadOptions();
  }

  loadOptions() {
    this.optionsService
      .getAll()
      .subscribe(options => {
        this.options = options;
      });
  }

  async ngOnDestroy() {
    this.$destroyed.emit();
  }

  async showOptionModal(o: MenuOption = null) {
    const modal = await this.modalController.create({
      component: OptionModalComponent,
      componentProps: {
        merchantId: this.merchant.id,
        option: o,
      }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      this.loadOptions();
    }
    return data;
  }

  async showSubOptionModal(so: MenuSubOption = null) {
    const modal = await this.modalController.create({
      component: SubOptionModalComponent,
      componentProps: {
        merchantId: this.merchant.id,
        options: this.options,
        subOption: so,
      }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      this.loadOptions();
    }
    return data;
  }

  async onSave() {
    this.loadOptions();
  }

  onDelete() {
    this.loadOptions();
  }

}

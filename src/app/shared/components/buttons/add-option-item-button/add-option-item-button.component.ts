import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MerchantV2 } from '../../../merchant-v2';
import { MenuOption } from '../../../menu-option';
import { OptionItemModalComponent } from '../../modals/option-item-modal/option-item-modal.component';
import { MenuCategory } from '../../../menu-category';

@Component({
  selector: 'app-add-option-item-button',
  templateUrl: './add-option-item-button.component.html',
  styleUrls: ['./add-option-item-button.component.scss'],
})
export class AddOptionItemButtonComponent implements OnInit {

  @Input() option: MenuOption;
  @Input() merchant: MerchantV2;
  @Input() categories: MenuCategory[];

  constructor(
    private modalController: ModalController,
  ) { }

  ngOnInit() {}

  async showModal() {
    const modal = await this.modalController.create({
      component: OptionItemModalComponent,
      componentProps: {
        merchant: this.merchant,
        option: this.option,
        categories: this.categories,
      }
    });
    return await modal.present();
  }

}

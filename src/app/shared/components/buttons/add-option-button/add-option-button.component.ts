import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CategoryModalComponent } from '../../modals/category-modal/category-modal.component';
import { MenuOption } from '../../../menu-option';
import { MerchantV2 } from '../../../merchant-v2';
import { OptionModalComponent } from '../../modals/option-modal/option-modal.component';

@Component({
  selector: 'app-add-option-button',
  templateUrl: './add-option-button.component.html',
  styleUrls: ['./add-option-button.component.scss'],
})
export class AddOptionButtonComponent implements OnInit {

  @Input() merchant: MerchantV2;
  @Input() option: MenuOption = null;
  @Output() save = new EventEmitter<MenuOption>();

  constructor(
    private modalController: ModalController,
  ) { }

  ngOnInit() {}

  async showModal() {
    const modal = await this.modalController.create({
      component: OptionModalComponent,
      componentProps: {
        merchantId: this.merchant.id,
        option: this.option,
      }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      this.save.emit(data);
    }
    return data;
  }

}

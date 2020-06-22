import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MerchantV2 } from '../../../merchant-v2';
import { MenuSubOption } from '../../../menu-sub-option';
import { SubOptionModalComponent } from '../../modals/sub-option-modal/sub-option-modal.component';
import { MenuOption } from '../../../menu-option';

@Component({
  selector: 'app-add-sub-option-button',
  templateUrl: './add-sub-option-button.component.html',
  styleUrls: ['./add-sub-option-button.component.scss'],
})
export class AddSubOptionButtonComponent implements OnInit {

  @Input() options: MenuOption[];
  @Input() optionId: number;
  @Input() subOption: MenuSubOption = null;
  @Input() merchant: MerchantV2;
  @Output() save = new EventEmitter<MenuSubOption>();

  constructor(
    private modalController: ModalController,
  ) { }

  ngOnInit() {}

  async showModal() {
    const modal = await this.modalController.create({
      component: SubOptionModalComponent,
      componentProps: {
        merchantId: this.merchant.id,
        options: this.options,
        optionId: this.optionId,
        subOption: this.subOption,
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

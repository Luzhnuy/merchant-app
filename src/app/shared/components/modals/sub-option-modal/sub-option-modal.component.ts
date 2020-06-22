import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HelperService } from '../../../helper.service';
import { ErrorHandlerService } from '../../../error-handler.service';
import { MenuSubOption } from '../../../menu-sub-option';
import { MenuOption } from '../../../menu-option';
import { MenuItem } from '../../../menu-item';
import { SubOptionsService } from '../../../sub-options.service';

@Component({
  selector: 'app-sub-option-modal',
  templateUrl: './sub-option-modal.component.html',
  styleUrls: ['./sub-option-modal.component.scss'],
})
export class SubOptionModalComponent implements OnInit {

  @Input() items: MenuItem[];
  @Input() options: MenuOption[];
  @Input() optionId?: number;
  @Input() merchantId: number;
  @Input() subOption: MenuSubOption;

  constructor(
    private modalController: ModalController,
    private helper: HelperService,
    private errorHandlerService: ErrorHandlerService,
    private subOptionsService: SubOptionsService,
  ) { }

  ngOnInit() {
    if (!this.subOption) {
      this.subOption = new MenuSubOption({
        optionId: this.optionId,
        merchantId: this.merchantId,
        enabled: true,
      });
    }
  }

  async save() {
    let subOption;
    try {
      if (this.subOption.id) {
        subOption = await this.subOptionsService
          .update(this.subOption)
          .toPromise();
      } else {
        subOption = await this.subOptionsService
          .create(this.subOption)
          .toPromise();
      }
      await this.helper.showToast('Option was saved successfully');
      this.modalController.dismiss(subOption);
    } catch (e) {
      await this.helper.showError(
        this.errorHandlerService
          .handleError(e)
      );
    }
  }

  cancel() {
    this.modalController.dismiss();
  }

}

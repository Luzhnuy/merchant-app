import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MenuOption } from '../../../menu-option';
import { OptionsService } from '../../../options.service';
import { HelperService } from '../../../helper.service';
import { ErrorHandlerService } from '../../../error-handler.service';

@Component({
  selector: 'app-option-modal',
  templateUrl: './option-modal.component.html',
  styleUrls: ['./option-modal.component.scss'],
})
export class OptionModalComponent implements OnInit {

  @Input() merchantId: number;
  @Input() option: MenuOption;

  constructor(
    private modalController: ModalController,
    private helper: HelperService,
    private errorHandlerService: ErrorHandlerService,
    private optionsService: OptionsService,
  ) { }

  ngOnInit() {
    if (!this.option) {
      this.option = new MenuOption({
        merchantId: this.merchantId,
        enabled: true,
      });
    }
  }

  async save() {
    let option;
    try {
      if (this.option.id) {
        option = await this.optionsService
          .update(this.option)
          .toPromise();
      } else {
        option = await this.optionsService
          .create(this.option)
          .toPromise();
      }
      await this.helper.showToast('Category was saved successfully');
      this.modalController.dismiss(option);
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

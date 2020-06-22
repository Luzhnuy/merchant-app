import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { CategoriesV2Service } from '../../../categories-v2.service';
import { MerchantsService } from '../../../merchants.service';
import { OptionsService } from '../../../options.service';
import { MerchantV2 } from '../../../merchant-v2';
import { MenuOption } from '../../../menu-option';

@Component({
  selector: 'app-delete-option-button',
  templateUrl: './delete-option-button.component.html',
  styleUrls: ['./delete-option-button.component.scss'],
})
export class DeleteOptionButtonComponent implements OnInit {

  @Input() option: MenuOption;
  @Output() delete = new EventEmitter();

  constructor(
    private alertController: AlertController,
    private optionsService: OptionsService,
  ) { }

  ngOnInit() {}

  async onDelete() {
    const alert = await this.alertController.create({
      header: `Are you sure you want to delete category ${this.option.title}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Yes',
          handler: () => {
            this.optionsService
              .remove(this.option.id)
              .subscribe(() => {
                this.delete.emit();
              });
          }
        }
      ]
    });

    await alert.present();
  }

}

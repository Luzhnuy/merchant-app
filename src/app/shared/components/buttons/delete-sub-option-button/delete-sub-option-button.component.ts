import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { SubOptionsService } from '../../../sub-options.service';
import { MenuSubOption } from '../../../menu-sub-option';

@Component({
  selector: 'app-delete-sub-option-button',
  templateUrl: './delete-sub-option-button.component.html',
  styleUrls: ['./delete-sub-option-button.component.scss'],
})
export class DeleteSubOptionButtonComponent implements OnInit {

  @Input() subOption: MenuSubOption;
  @Output() delete = new EventEmitter();

  constructor(
    private alertController: AlertController,
    private subOptionsService: SubOptionsService,
  ) { }

  ngOnInit() {}

  async onDelete() {
    const alert = await this.alertController.create({
      header: `Are you sure you want to delete option ${this.subOption.title}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Yes',
          handler: () => {
            this.subOptionsService
              .remove(this.subOption.id)
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

import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CategoryModalComponent } from '../../category-modal/category-modal.component';

@Component({
  selector: 'app-add-category-button',
  templateUrl: './add-category-button.component.html',
  styleUrls: ['./add-category-button.component.scss'],
})
export class AddCategoryButtonComponent implements OnInit {

  @Input() accountId: string;

  constructor(
    private modalController: ModalController,
  ) { }

  ngOnInit() {}

  async showModal() {
    const modal = await this.modalController.create({
      component: CategoryModalComponent,
      componentProps: {
        accountId: this.accountId,
        data: null,
      }
    });
    return await modal.present();
  }

}

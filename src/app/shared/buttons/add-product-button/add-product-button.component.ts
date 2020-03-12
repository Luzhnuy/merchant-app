import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ProductModalComponent } from '../../product-modal/product-modal.component';

@Component({
  selector: 'app-add-product-button',
  templateUrl: './add-product-button.component.html',
  styleUrls: ['./add-product-button.component.scss'],
})
export class AddProductButtonComponent implements OnInit {

  @Input() accountId: string;
  @Input() categoryId: string;

  constructor(
    private modalController: ModalController,
  ) { }

  ngOnInit() {}

  async showModal() {
    const modal = await this.modalController.create({
      component: ProductModalComponent,
      componentProps: {
        accountId: this.accountId,
        categoryId: this.categoryId,
        data: null,
      }
    });
    return await modal.present();
  }

}

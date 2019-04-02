import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ProductModalComponent } from '../../product-modal/product-modal.component';

@Component({
  selector: 'app-add-product-button-big',
  templateUrl: './add-product-button-big.component.html',
  styleUrls: ['./add-product-button-big.component.scss'],
})
export class AddProductButtonBigComponent implements OnInit {

  @Input() accountId: string;

  constructor(
    private modalController: ModalController,
  ) { }

  ngOnInit() {}

  async showModal() {
    const modal = await this.modalController.create({
      component: ProductModalComponent,
      componentProps: {
        accountId: this.accountId,
        data: null,
      }
    });
    return await modal.present();
  }

}

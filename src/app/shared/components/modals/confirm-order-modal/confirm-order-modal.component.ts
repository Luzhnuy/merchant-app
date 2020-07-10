import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { OrderType } from '../../../order-v2';

@Component({
  selector: 'app-confirm-order-modal',
  templateUrl: './confirm-order-modal.component.html',
  styleUrls: ['./confirm-order-modal.component.scss'],
})
export class ConfirmOrderModalComponent implements OnInit {

  @Input() type: OrderType;
  @Input() startTime: Date;
  @Input() endTime: Date;
  @Input() address: string;

  OrderType = OrderType;

  constructor(
    private modalController: ModalController,
  ) { }

  ngOnInit() {}

  confirm() {
    this.modalController.dismiss(true);
  }

  closeModal() {
    this.modalController.dismiss();
  }

}

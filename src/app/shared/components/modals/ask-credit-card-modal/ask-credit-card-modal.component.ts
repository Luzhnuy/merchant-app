import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PaymentCard } from '../../../payment-card';

@Component({
  selector: 'app-ask-credit-card-modal',
  templateUrl: './ask-credit-card-modal.component.html',
  styleUrls: ['./ask-credit-card-modal.component.scss'],
})
export class AskCreditCardModalComponent implements OnInit {

  @Input() card: PaymentCard;

  constructor(
    private modalController: ModalController,
  ) { }

  ngOnInit() {}

  // onCreditCardChange(customer: StripeCustomer) {
  onCreditCardChange(card: PaymentCard) {
    this.modalController.dismiss(card);
  }

  closeModal() {
    this.modalController.dismiss();
  }

}

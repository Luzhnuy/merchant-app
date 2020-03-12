import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { AskCreditCardModalComponent } from '../shared/ask-credit-card-modal/ask-credit-card-modal.component';
import { PaymentCardsService } from '../shared/payment-cards.service';
import { PaymentCard } from '../shared/payment-card';

@Component({
  selector: 'app-credit-card',
  templateUrl: './credit-card.page.html',
  styleUrls: ['./credit-card.page.scss'],
})
export class CreditCardPage implements OnInit {

  imageName: string;
  card: PaymentCard;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private paymentCardsService: PaymentCardsService,
  ) {}

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.loadCard();
  }

  async openEditCardModal() {
      const modal = await this.modalController.create({
        component: AskCreditCardModalComponent,
        componentProps: {
          card: this.card,
        }
      });
      await modal.present();
      const { data } = await modal.onDidDismiss();
      if (data) {
        this.loadCard();
      }
  }

  private loadCard() {
    this.paymentCardsService
      .getAll()
      .subscribe(cards => {
        if (cards.length) {
          this.card = new PaymentCard(cards[0]);
          this.imageName = this.getSrc();
        }
      });
  }

  private getSrc() {
    switch (this.card.brand) {
      case 'Visa':
        return 'visa.png';
      case 'MasterCard':
        return 'mastercard.png';
      case 'American Express':
        return 'amex.png';
      default:
        return 'card_pay.png';
    }
  }

}


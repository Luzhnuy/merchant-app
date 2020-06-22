import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HelperService } from '../../helper.service';
import { PaymentCardsService } from '../../payment-cards.service';
import { PaymentCard } from '../../payment-card';
import { MerchantsService } from '../../merchants.service';
import { MerchantV2 } from '../../merchant-v2';
import { PaymentCardCredentials } from '../../payment-card-credentials';
import { ErrorHandlerService } from '../../error-handler.service';

@Component({
  selector: 'app-edit-credit-card',
  templateUrl: './edit-credit-card.component.html',
  styleUrls: ['./edit-credit-card.component.scss'],
})
export class EditCreditCardComponent implements OnInit {

  @Input() card: PaymentCard = null;
  @Output('cardChanged') cardChanged = new EventEmitter<PaymentCard>();

  holderName: string;
  cardNumber: string;
  month: string;
  year: string;
  cvv: string;

  private merchant: MerchantV2;

  constructor(
    private helper: HelperService,
    private paymentCardsService: PaymentCardsService,
    private merchantsService: MerchantsService,
    private errorHandlerService: ErrorHandlerService,
  ) { }

  ngOnInit() {
    this.merchantsService
      .$merchant
      .subscribe(merchant => {
        this.holderName = merchant.name;
        this.merchant = merchant;
      });
  }

  async updateCreditCard() {
    const data: PaymentCardCredentials = new PaymentCardCredentials({
      name: this.holderName,
      number: parseInt(this.cardNumber.split(' ').join(''), 10),
      month: this.month,
      year: this.year,
      cvc: this.cvv,
    });
    if (this.card && this.card.id) {
      this.paymentCardsService
        .save(data)
        .subscribe((card) => {
          this.cardChanged.emit(card);
          this.showSuccess();
        }, e => {
          this.showError(
            this.errorHandlerService.handleError(e),
          );
        });
    } else {
      this.paymentCardsService
        .save(data)
        .subscribe((card) => {
          this.cardChanged.emit(card);
          this.showSuccess();
        }, e => {
          this.showError(
            this.errorHandlerService.handleError(e),
          );
        });
    }
  }

  private showError(message = 'Credit card was not saved. Please, try later or contact us') {
    this.helper.showError(message);
  }

  private showSuccess() {
    this.helper.showToast('Credit card saved successfully');
  }

}

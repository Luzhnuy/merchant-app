import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';
import { CalendarModal, CalendarModalOptions, CalendarResult } from 'ion2-calendar';
import { ModalController } from '@ionic/angular';
import { DatePipe } from '@angular/common';

class DateRange {
  from: Date;
  to: Date;
}

@Directive({
  selector: '[appSgDateRange]'
})
export class SgDateRangeDirective {

  @Output() rangeChange = new EventEmitter();

  constructor(
    private el: ElementRef,
    private modalController: ModalController,
    private datePipe: DatePipe,
  ) { }

  @HostListener('click')
  async onMouseEnter() {
    const data: DateRange  = await this.openCalendar();
    if (data) {
      this.rangeChange
        .emit([data.from, data.to])
      this.el
        .nativeElement
        .value = this.formatInputValue(data);
    }
  }

  private formatInputValue(data: DateRange) {
    return this.datePipe.transform(data.from, 'shortDate')
    + '-'
    + this.datePipe.transform(data.to, 'shortDate')
  }

  private async openCalendar() {
    const to = new Date();
    const from = new Date();
    from.setMonth(to.getMonth() - 3);
    const options: CalendarModalOptions = {
      pickMode: 'range',
      title: '',
      to,
      from,
      defaultScrollTo: to,
    };
    const myCalendar = await this.modalController.create({
      component: CalendarModal,
      componentProps: { options }
    });
    await myCalendar.present();
    const event: any = await myCalendar.onDidDismiss();
    if (event.data) {
      return {
        from: event.data.from.dateObj,
        to: event.data.to.dateObj,
      };
    } else {
      return null;
    }
  }

}

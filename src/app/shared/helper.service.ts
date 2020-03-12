import { Injectable } from '@angular/core';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  private loading;

  constructor(
    private loadingController: LoadingController,
    private toastController: ToastController,
    private modalController: ModalController,
  ) { }

  async showLoading(message = 'Loading...', duration = 3000) {
    await this.stopLoading();
    this.loading = await this.loadingController.create({
      message: message,
      duration: duration
    });
    await this.loading.present();
  }

  async stopLoading() {
    if (this.loading) {
      const loading = this.loading;
      this.loading = null;
      await loading.dismiss();
    }
  }

  async showError(message, color = 'danger', position: 'top' | 'middle' | 'bottom' = 'top', duration = 5000) {
    return await this.showToast(message, color, position, duration);
  }

  async showToast(message, color = 'success', position: 'top' | 'middle' | 'bottom' = 'top', duration = 3000) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      color: color,
      position: position,
    });
    toast.present();
    return toast;
  }

  fixDateStrFormatForSafari(datestr, addZeroTimezone = true) {
    if (datestr) {
      datestr += addZeroTimezone ? '+00:00' : '';
      return datestr.replace(' ', 'T');
    } else {
      return datestr;
    }
  }

  leadWithZero(number) {
    return ('0' + number).slice(-2);
  }

}

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

  async showLoading(message = 'Loading...', duration = 2000) {
    this.stopLoading();
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

  async showError(message, color = 'danger', position: 'top' | 'middle' | 'bottom' = 'top', duration = 2500) {
    return await this.showToast(message, color, position, duration);
  }

  async showToast(message, color = 'success', position: 'top' | 'middle' | 'bottom' = 'top', duration = 2500) {
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
    datestr += addZeroTimezone ? '+00:00' : '';
    return datestr.replace(' ', 'T');
  }

}

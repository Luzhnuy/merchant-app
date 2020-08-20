import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { PrintService } from '../shared/bt-print.service';
import { HelperService } from '../shared/helper.service';
import { StorageVariableV2Service as StorageVariableService } from '../shared/storage-variable-v2.service';
import { StorageVariablesV2Enum as StorageVariables } from '../shared/storage-variables-v2.enum';

@Component({
  selector: 'select-bt-printer',
  templateUrl: './select-bt-printer.page.html',
  styleUrls: ['./select-bt-printer.page.scss'],
})
export class SelectBtPrinterPage {

  bluetoothList:any=[];
  selectedPrinter:any;
  
  constructor(
      private printService:PrintService, 
      private modalController: ModalController,
      private helper: HelperService,
      private storageVariable: StorageVariableService
   ) {}


   ionViewWillEnter() {
    
   }
   
   findBtDevices() {    
    this.printService.searchBtDevices()
      .then((res: any) => {
        console.log(res);
        this.bluetoothList = res;
  
      }).catch((error: any) => {            
          this.helper.showError(error);
      });    
   }

   selectPrinter(printerName:string, modelName:string) {
     this.selectedPrinter= printerName;
 
     //this.storageVariable.set(StorageVariables.btPrinterName, printerName);
     //this.storageVariable.set(StorageVariables.btPrinterModel, modelName);
     localStorage.setItem(StorageVariables.btPrinterName, printerName);
     localStorage.setItem(StorageVariables.btPrinterModel, modelName);
   }

   async closeModal() {    
    await this.modalController.dismiss({data:true});
  }  
}

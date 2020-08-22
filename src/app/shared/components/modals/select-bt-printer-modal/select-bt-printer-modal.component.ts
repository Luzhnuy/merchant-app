import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PrintService } from '../../../bt-print.service';
import { HelperService } from '../../../helper.service';
import { StorageVariableV2Service as StorageVariableService } from '../../../storage-variable-v2.service';
import { StorageVariablesV2Enum as StorageVariables } from '../../../storage-variables-v2.enum';

@Component({
  selector: 'select-bt-printer-modal',
  templateUrl: './select-bt-printer-modal.component.html',
  styleUrls: ['./select-bt-printer-modal.component.scss'],
})
export class SelectBtPrinterModalComponent {

  bluetoothList:any=[];
  selectedPrinter:any;
  
  constructor(
      private printService:PrintService, 
      private modalController: ModalController,
      private helper: HelperService,
      private storageVariable: StorageVariableService
   ) {}
   
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

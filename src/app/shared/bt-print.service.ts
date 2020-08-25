import { Injectable } from '@angular/core';
import { StarPRNT } from '@ionic-native/star-prnt/ngx';
import { HelperService } from './helper.service';
import DomToImage from 'dom-to-image';
import { File } from '@ionic-native/file/ngx';

declare let cordova: any;

@Injectable({
  providedIn: 'root'
})

export class PrintService {

  constructor(public file: File, private starprnt: StarPRNT, private helper: HelperService) { }

  searchBtDevices()
  {
    return this.starprnt.portDiscovery('Bluetooth');   
  }

  connect(printerName:string)
  {
    return this.starprnt.connect(printerName, 'StarGraphic', false);  
  }

  disconnect()
  {    
    return this.starprnt.disconnect();
  }

  prepareImgFile(dirName, filename, blob) {
    var folderpath = "file:///storage/emulated/0";
    return new Promise((resolve, reject) => {
        this.file.resolveDirectoryUrl(folderpath).then((dirEntry) => {
          dirEntry.getDirectory(dirName, { create: true }, function (dir) {
                dir.getFile(filename, { create: true, exclusive: false }, function (fileEntry) {
                    fileEntry.createWriter(function (fileWriter) {
                        fileWriter.write(blob);
                        resolve(folderpath + fileEntry.fullPath);
                    });
                }, reject);
            }, reject);
        }, reject);
    });
  }

  print(printerName:string, fileUri:string)
  {
    
    var imageObj = {
      uri: fileUri,
      width: 576, // options: 384 = 2", 576 = 3", 832 = 4"
      cutReceipt:true, // Defaults to true
      openCashDrawer:false // Defaults to true
    };

    this.starprnt.printImage(printerName, 'StarGraphic', imageObj)
      .then(result => {
        this.helper.showToast("Print Success");
      }).catch(error => {
        this.helper.showError("Print error " + error); 
    })
  
    /*
    var rasterObj = {
        text : htmlData,
        fontSize: 25,       //Defaults to 25
        paperWidth: 576,    // options: 384 = 2", 576 = 3", 832 = 4"
        cutReceipt:true, // Defaults to true
        openCashDrawer:false // Defaults to true
    };

    this.starprnt.printRasterReceipt(printerName, 'StarGraphic', rasterObj)
      .then(result => {
        this.helper.showToast("Print Success");
      }).catch(error => {
        this.helper.showError("Print error " + error); 
      })*/
      
  }

  async printWeb(htmlData) {    
    let passprnt_uri = "starpassprnt://v1/print/nopreview?";  

    passprnt_uri += "size=" + 3;
    passprnt_uri += "&popup=" + "enable";
    passprnt_uri += "&html=" + encodeURIComponent(htmlData);
    //passprnt_uri += "&url=" + encodeURIComponent("https://eazy4busy.com/passprnt/resource/myphoto.pdf");
    let back_url = window.location.href;
    passprnt_uri += "&back=" + encodeURIComponent(back_url);
   
    //console.log(passprnt_uri);
    location.href = passprnt_uri;
  }
}

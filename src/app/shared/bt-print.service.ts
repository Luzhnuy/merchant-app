import { Injectable } from '@angular/core';
import { StarPRNT } from '@ionic-native/star-prnt/ngx';
import { HelperService } from './helper.service';
import DomToImage from 'dom-to-image';
import { File } from '@ionic-native/file/ngx';
import html2canvas from 'html2canvas';

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

  print(printerName:string, htmlData:string)
  {         
    var dirName = "bt-print"
    var filename = "test.png";

    var iframe=document.createElement('iframe');
    document.body.appendChild(iframe);
    var iframedoc = iframe.contentDocument || iframe.contentWindow.document;
    iframedoc.body.innerHTML = htmlData;
    
    let outerthis = this;        
    html2canvas(iframedoc.body, {scrollY: -window.scrollY}).then(function(canvas) {
      canvas.toBlob(function(blob) {          
        outerthis.prepareImgFile(dirName, filename, blob).then(function(fileFullPath:string) { 
          
          var imageObj = {
            uri: fileFullPath,
            width: 576, // options: 384 = 2", 576 = 3", 832 = 4"
            cutReceipt:true, // Defaults to true
            openCashDrawer:false // Defaults to true
          };

          outerthis.starprnt.printImage(printerName, 'StarGraphic', imageObj)
            .then(result => {
              outerthis.helper.showToast("Print Success");
            }).catch(error => {
              outerthis.helper.showError("Print error " + error); 
          })

          }).catch(function(e) {
            console.error("error:", e);
          })

      }, "image/png", 1);
    });
  
  }

  printWeb(htmlData) {    

    var iframe=document.createElement('iframe');
    document.body.appendChild(iframe);
    //setTimeout(function(){
        var iframedoc = iframe.contentDocument || iframe.contentWindow.document;
        iframedoc.body.innerHTML = htmlData;

        html2canvas(iframedoc.body, {scrollY: -window.scrollY}).then(function(canvas) {
          var link = document.createElement("a");
          document.body.appendChild(link);
          link.download = "html_image.png";
          
          
          link.href = canvas.toDataURL("image/png", 1);
          
          link.target = '_blank';
          link.click();

         /*
         var base64image = canvas.toDataURL("image/png");
          var image = new Image();
          image.src = base64image;
  
          var w = window.open("");
          w.document.write(image.outerHTML);
          */
          
      });
    //}, 10);

    /*let passprnt_uri = "starpassprnt://v1/print/nopreview?";  

    passprnt_uri += "size=" + 3;
    passprnt_uri += "&popup=" + "enable";
    //passprnt_uri += "&html=" + encodeURIComponent(htmlData);
    passprnt_uri += "&url=" + encodeURIComponent("https://eazy4busy.com/passprnt/resource/myphoto.pdf");
    let back_url = window.location.href;
    passprnt_uri += "&back=" + encodeURIComponent(back_url);
   
    //console.log(passprnt_uri);
    location.href = passprnt_uri;*/
  }
}

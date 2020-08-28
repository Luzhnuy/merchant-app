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

  m_iframe:any;
  m_iframedoc:any;
  m_url:any;
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

  private prepareImgFile(folderPath:string, fileName:string, blob:any) {
    let outerthis = this; 
    return new Promise((resolve, reject) => {
        this.file.resolveDirectoryUrl(folderPath).then((dirEntry) => {         
          dirEntry.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
                    fileEntry.createWriter(function (fileWriter) {
                        fileWriter.onwriteend = resolve;
                        fileWriter.onerror = reject
                        fileWriter.write(blob);                        
                    });
                }, reject);
        }, reject);
    });
  }

  async print(printerName:string, htmlData:string)
  {  
    var tempPath = cordova.file.cacheDirectory;
    var tempFileName = "bt-print-temp.png";
    var tempFullPath = tempPath + tempFileName;

    var iframe=document.createElement('iframe');
    document.body.appendChild(iframe);
    var iframedoc = iframe.contentDocument || iframe.contentWindow.document;
    iframedoc.body.innerHTML = htmlData;
    const div = iframedoc.getElementById("print-html");

    const options = {y: 10, height:  div.clientHeight};

    let outerthis = this; 

    await this.helper.showLoading("Please wait ...", 5000);   

    html2canvas(div /*, options*/).then(function(canvas) {
      canvas.toBlob(function(blob) {          
        outerthis.prepareImgFile(tempPath, tempFileName, blob).then(function() { 
          
            var imageObj = {
              uri: tempFullPath,
              width: 576, // options: 384 = 2", 576 = 3", 832 = 4"  (Defaults to 576)
              cutReceipt:true, // Defaults to true
              openCashDrawer:false // Defaults to true
            };

            outerthis.starprnt.printImage(printerName, 'StarGraphic', imageObj)
              .then(_ => {
                outerthis.helper.showToast("Print Success");
                outerthis.helper.stopLoading();
              }).catch(_ => {
                outerthis.printErrHandler("Communication issue with the Bt-Printer.");
            })

          }).catch(_ => {
            outerthis.printErrHandler("Issue saving data to be printed.");
          })

      }, "image/png", 1);
    }).catch(_ => {
      outerthis.printErrHandler("Issue preparing data to be printed.");      
    });
  }

  printErrHandler(err:any) {
    this.helper.showError("Print error: " + err); 
    this.helper.stopLoading();
  }

  async printWebTemp(htmlData) {
     
  var div1=document.createElement('div');
  document.body.appendChild(div1);  
  div1.innerHTML = htmlData;  
  const div = div1.getElementsByTagName("div")[0];
  
  var clientHeight = div.offsetHeight;
  var tempHeight = div.getBoundingClientRect().height;
  console.log("div.offsetHeight : " + div.clientHeight);
  console.log("clientHeight : " + clientHeight);
  console.log("tempHeight : " + tempHeight);
 

  //const options = {backgroundColor:'#30fc03', height: clientHeight};
  
  // {y: 10, scrollY: -window.scrollY}
    html2canvas(div).then(function(canvas) {     
      console.log("canvas height : " + canvas.height);
      var link = document.createElement("a");
      document.body.appendChild(link);
      link.download = "html_image.png";
      
      
      link.href = canvas.toDataURL("image/png", 1);
      
      link.target = '_blank';
      link.click();

      /*
      var base64image = canvas.toDataURL("image/png",1);
      var image = new Image();
      image.src = base64image;

      var w = window.open("");
      w.document.write(image.outerHTML);*/
    });
  
  }
  
  printWeb(htmlData:string) {    
    this.printWebTemp(htmlData);

   /* let passprnt_uri = 'starpassprnt://v1/print/nopreview?';
    
    passprnt_uri += 'size=3';
    passprnt_uri += '&html=' + encodeURIComponent(htmlData);
    passprnt_uri += '&popup=enable';  
    passprnt_uri += '&back=' + encodeURIComponent(window.location.href);

    location.href = passprnt_uri;*/
  }
}

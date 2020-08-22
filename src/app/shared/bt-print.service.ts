import { Injectable } from '@angular/core';
import { StarPRNT, PrintObj } from '@ionic-native/star-prnt/ngx';
import { HelperService } from './helper.service';

@Injectable({
  providedIn: 'root'
})

export class PrintService {

  constructor(private starprnt: StarPRNT, private helper: HelperService) { }

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

 
  print(printerName:string, data:string)
  {
   
    var rasterObj = {
        text : "        Star Clothing Boutique\n" +
        "             123 Star Road\n" +
        "           City, State 12345\n" +
        "\n" +
        "Date:MM/DD/YYYY          Time:HH:MM PM\n" +
        "--------------------------------------\n" +
        "SALE\n" +
        "SKU            Description       Total\n" +
        "300678566      PLAIN T-SHIRT     10.99\n" +
        "300692003      BLACK DENIM       29.99\n" +
        "300651148      BLUE DENIM        29.99\n" +
        "300642980      STRIPED DRESS     49.99\n" +
        "30063847       BLACK BOOTS       35.99\n" +
        "300678566      PLAIN T-SHIRT     10.99\n" +
        "300692003      BLACK DENIM       29.99\n" +
        "300651148      BLUE DENIM        29.99\n" +
        "300642980      STRIPED DRESS     49.99\n" +
        "30063847       BLACK BOOTS       35.99\n" +
        "300678566      PLAIN T-SHIRT     10.99\n" +
        "300692003      BLACK DENIM       29.99\n" +
        "300651148      BLUE DENIM        29.99\n" +
        "300642980      STRIPED DRESS     49.99\n" +
        "30063847       BLACK BOOTS       35.99\n" +
        "300678566      PLAIN T-SHIRT     10.99\n" +
        "300692003      BLACK DENIM       29.99\n" +
        "300651148      BLUE DENIM        29.99\n" +
        "300642980      STRIPED DRESS     49.99\n" +
        "30063847       BLACK BOOTS       35.99\n" +
        "300678566      PLAIN T-SHIRT     10.99\n" +
        "300692003      BLACK DENIM       29.99\n" +
        "300651148      BLUE DENIM        29.99\n" +
        "300642980      STRIPED DRESS     49.99\n" +
        "30063847       BLACK BOOTS       35.99\n" +
        "\n" +
        "Subtotal                        156.95\n" +
        "Tax                               0.00\n" +
        "--------------------------------------\n" +
        "Total                          $156.95\n" +
        "--------------------------------------\n" +
        "\n" +
        "Charge\n" +
        "156.95\n" +
        "Visa XXXX-XXXX-XXXX-0123\n" +
        "Refunds and Exchanges\n" +
        "Within 30 days with receipt\n" +
        "And tags attached\n",
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
      })
  }

  public printWeb(pageUrl, htmlData) {
    let passprnt_uri = "starpassprnt://v1/print/nopreview?";  

    passprnt_uri += "size=" + 3;
    let back_url = 'http://localhost:8100/#' + pageUrl;
    //let back_url = 'https://merchants-portal-test.snapgrabdelivery.com/#' + pageUrl;
    
    passprnt_uri += "&back=" + encodeURIComponent(back_url);
    passprnt_uri += "&popup=" + "enable";
    
    // TODO : to be removed
    //passprnt_uri += "&url=" + encodeURIComponent('https://www.star-m.jp/products/s_print/sdk/passprnt/sample/resource/receipt_sample.pdf');    
    passprnt_uri += "&html=" + encodeURI(htmlData);
    //console.log(passprnt_uri);
    location.href = passprnt_uri;     
  }
}

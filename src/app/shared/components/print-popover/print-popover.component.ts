import { Component, OnInit } from
'@angular/core';
 import {PopoverController} from '@ionic/angular';
 @Component({
   selector: 'app-popovercomponent',
   templateUrl: './print-popover.component.html',
   styleUrls: ['./print-popover.component.scss'],
 })
 export class PopovercomponentPage implements OnInit {

   constructor(private popover:PopoverController) {} 
   ngOnInit() 
   {

   }
   
   setPrintType(type:number)
   {
     this.popover.dismiss(type);
   }
 } 
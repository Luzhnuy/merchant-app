import {CommonModule} from '@angular/common';
import {ModuleWithProviders, NgModule} from '@angular/core';

import {TooltipBox} from './components/tooltip-box/tooltip-box.component';
import {TooltipController} from './controllers/tooltip.cotroller';
import {TooltipDirective} from './directives/tooltip.directive';

@NgModule({
  declarations: [
    TooltipDirective,
    TooltipBox
  ],
  entryComponents: [
    TooltipBox
  ],
  exports: [
    TooltipDirective
  ],
  imports: [
    CommonModule
  ]
})
export class TooltipsModule {
  static forRoot():ModuleWithProviders {
    return {
      ngModule: TooltipsModule,
      providers: [
        TooltipController
      ],
    };
  }
}

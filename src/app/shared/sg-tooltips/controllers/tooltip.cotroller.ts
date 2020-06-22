import {Injectable} from '@angular/core';
import {TooltipDirective} from '../directives/tooltip.directive';

@Injectable({
  providedIn: 'root',
})
export class TooltipController {
  public allowMultiple: boolean = false;
  public activeTooltips:TooltipDirective[] = [];

  addTooltip(instance:TooltipDirective):void {
    if (instance.hideOthers || !this.allowMultiple && this.activeTooltips.length > 0) {
      this.hideAll();
    }

    this.activeTooltips.push(instance);
  }

  removeTooltip(instance:TooltipDirective):void {
    this.activeTooltips.splice(this.activeTooltips.indexOf(instance), 1);
  }

  hideAll():void {
    this.activeTooltips.forEach(
      (tooltip:TooltipDirective) => {
        tooltip.removeTooltip();
      }
    );
  }
}

import { animate, state, style, transition, trigger } from '@angular/animations';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  Input,
  Renderer2
} from '@angular/core';

@Component({
  selector:    'tooltip-box',
  templateUrl: 'tooltip-box.component.html',
  styleUrls: [
    'tooltip-box.component.scss'
  ],
  // animations: [
  //   trigger('fade', [
  //     state('visible', style({ opacity: 1 })),
  //     state('invisible', style({ opacity: 0 })),
  //     transition('visible <=> invisible', animate('300ms linear'))
  //   ])
  // ],
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class TooltipBox implements AfterViewInit {
  // @HostBinding('@fade') fadeState:string = 'invisible';

  @Input() role:string = 'status';
  @Input() text:string;
  @Input() tooltipHtml:string;
  @Input() tooltipStyles:{ [key:string]:string; } = {};

  @Input()
  set arrow(side:string) {
    this.rnd.setAttribute(
      this.getNativeElement(),
      'class',
      'has-arrow ' + 'arrow-' + side
    );
  }

  @Input()
  set posTop(val:number) {
    this.rnd.setStyle(
      this.getNativeElement(),
      'top',
      val + 'px'
    );
  }

  @Input()
  set posLeft(val:number) {
    this.rnd.setStyle(
      this.getNativeElement(),
      'left',
      val + 'px'
    );
  }

  private initResolve:Function;

  public init:Promise<void>;

  constructor(
    public elementRef:ElementRef,
    private rnd:Renderer2
  ) {
    this.init = new Promise<void>(
      (resolve) => {
        this.initResolve = resolve;
    }
    );
  }

  getNativeElement():HTMLElement {
    return this.elementRef.nativeElement;
  }

  ngAfterViewInit():void {
    this.initResolve();
  }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CategoriesV2Service } from '../../../categories-v2.service';
import { MenuCategory } from '../../../menu-category';
import { MenuOption } from '../../../menu-option';
import { OptionsService } from '../../../options.service';

@Component({
  selector: 'app-option-eye-button',
  templateUrl: './option-eye-button.component.html',
  styleUrls: ['./option-eye-button.component.scss'],
})
export class OptionEyeButtonComponent implements OnInit {

  @Input() option: MenuOption;
  @Output() switch = new EventEmitter<MenuOption>();

  constructor(
    private optionsService: OptionsService,
  ) { }

  ngOnInit() {
  }

  toggle() {
    const option = new MenuOption({
      id: this.option.id,
      enabled: !this.option.enabled,
    });
    this.optionsService
      .update(option)
      .subscribe(
        () => {
          this.option.enabled = !this.option.enabled;
          this.switch.emit(this.option);
        }
      );
  }
}
